const express = require('express');
const router = express.Router();
const { GoogleGenAI, Type } = require('@google/genai');
require('dotenv').config();

// API 키 초기화
let ai;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
} else {
    console.error("⚠️ 오류: GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.");
}

const decodeBase64 = (str) => {
    if (!str) return '';
    // Node.js 버퍼를 사용하여 UTF-8로 안전하게 디코딩 (한글 깨짐 해결)
    return Buffer.from(str, 'base64').toString('utf8');
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// html - gemini 채점
router.post('/grade-html', async (req, res) => {
    if (!ai) {
        return res.status(500).json({ 
            error: '서버 설정 오류: Gemini API 키가 없습니다.' 
        });
    }

    try {
        const { code, testCases, language } = req.body;

        if (!code || !testCases) {
            return res.status(400).json({ error: '코드와 테스트 케이스가 필요합니다.' });
        }

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                results: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            description: { type: Type.STRING },
                            passed: { type: Type.BOOLEAN },
                            input: { type: Type.ARRAY, items: { type: Type.STRING } },
                            expected: { type: Type.STRING },
                            actual: { type: Type.STRING }
                        },
                        propertyOrdering: ['id', 'description', 'passed', 'input', 'expected', 'actual']
                    }
                },
                feedback: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        strengths: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        improvements: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    propertyOrdering: ['summary', 'strengths', 'improvements', 'suggestions']
                }
            },
            propertyOrdering: ['results', 'feedback']
        };

        // 프롬프트 생성
        const prompt = `
당신은 ${language || 'JavaScript'} 코드 채점 시스템입니다.

**사용자 코드:**
\`\`\`${language || 'javascript'}
${code}
\`\`\`

**테스트 케이스:**
${testCases.map((test, idx) => `
테스트 ${idx + 1}:
- 입력: ${JSON.stringify(test.input)}
- 예상 출력: ${JSON.stringify(test.expected)}
- 설명: ${test.description}
`).join('\n')}

**작업 지시:**
1. 코드를 분석하고 각 테스트 케이스를 검증하세요.
2. 각 테스트의 실제 결과(actual)를 정확히 판별하세요.
3. 예상값과 실제값을 비교하여 passed를 true/false로 설정하세요.
4. 코드 품질에 대한 피드백을 제공하세요.

**중요:**
- ⭐️ 'expected'와 'actual' 필드는 반드시 JSON 문자열로 반환하세요.
- 구문 오류가 있다면 모든 테스트를 failed로 처리하세요.
- 피드백의 summary에는 이모지를 포함하세요 (예: 🎉, 💪).
- strengths는 최소 2개, improvements는 실패한 경우에만, suggestions는 최소 2개 제공하세요.
- **마크다운 문법(백틱, 별표 등)을 사용하지 마세요. 일반 텍스트로만 작성하세요.**
- HTML 태그를 언급할 때 꺾쇠 괄호(<, >)를 그대로 사용하세요.
- 피드백은 10대 학생이 이해할 수 있는 쉬운 한국어로 작성하세요.
`;

        console.log('🔄 Gemini API 호출 시작...');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                generationConfig: {
                    temperature: 0.5,
                    topK: 20,
                    topP: 0.7
                }
            }
        });

        // 구조화된 JSON 파싱
        const gradingResult = JSON.parse(response.text);

        // 통과한 테스트 개수 계산
        const passedCount = gradingResult.results.filter(r => r.passed).length;
        const totalCount = gradingResult.results.length;

        res.json({
            ...gradingResult,
            passedCount,
            totalCount
        });

    } catch (error) {
        console.error('❌ 채점 오류:', error);
        console.error('오류 스택:', error.stack);
        
        res.status(500).json({
            error: '채점 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// java, javascript, python - 하이브리드 채점
router.post('/grade', async (req, res) => {
    if (!ai) {
        return res.status(500).json({ 
            error: '서버 설정 오류: Gemini API 키가 없습니다.' 
        });
    }

    try {
        const { code, testCases, language } = req.body;

        if (!code || !testCases) {
            // 🌟 응답에 누락된 필드 정보를 추가하여 디버깅 용이하게 함
            const missing = [];
            if (!code) missing.push('code');
            if (!testCases) missing.push('testCases');
            
            return res.status(400).json({ 
                error: '필수 데이터가 누락되었습니다.',
                missing_fields: missing
            });
        }

        const languageIds = {
            java: 62,
            python: 71,
            javascript: 63
        };

        const languageId = languageIds[language];
        if (!languageId) {
            return res.status(400).json({ error: '지원하지 않는 언어입니다.' });
        }

        const judgeHeaders = {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        };

        // judge0 API 호출
        const judge0Results = [];
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            // Judge0 API 호출
            try {
                // (A) 코드 제출 (base64_encoded=true 필수)
                const submitResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false', {
                    method: 'POST',
                    headers: judgeHeaders,
                    body: JSON.stringify({
                        source_code: Buffer.from(code).toString('base64'), // 코드도 Base64로 전송
                        language_id: languageId,
                        stdin: testCase.input ? Buffer.from(testCase.input).toString('base64') : '',
                        expected_output: testCase.expected ? Buffer.from(testCase.expected).toString('base64') : ''
                    })
                });

                const submitData = await submitResponse.json();
                const token = submitData.token;

                // (B) 결과 폴링 (Polling) - 결과가 나올 때까지 대기
                let result = null;
                let attempts = 0;
                
                while (attempts < 10) { // 최대 10초 대기
                    const checkResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`, {
                        method: 'GET',
                        headers: judgeHeaders
                    });
                    
                    result = await checkResponse.json();

                    // status.id => 1: Queue, 2: Processing, 3: Accepted, >3: Error
                    if (result.status.id > 2) {
                        break; // 채점 완료
                    }
                    
                    await delay(1000); // 1초 대기
                    attempts++;
                }

                // (C) 결과 데이터 정리 (디코딩)
                // stdout(표준출력)이 있으면 디코딩, 없으면 빈 문자열
                const actualOutput = decodeBase64(result.stdout || '').trim();
                const expectedOutput = testCase.expected.trim();
                
                // 에러 메시지도 디코딩
                const stderr = decodeBase64(result.stderr || '');
                const compileOutput = decodeBase64(result.compile_output || '');

                judge0Results.push({
                    id: i + 1,
                    description: testCase.description,
                    input: testCase.input,
                    expected: expectedOutput,
                    actual: actualOutput,     // 이제 한글이 정상적으로 보입니다
                    passed: actualOutput === expectedOutput, // Judge0가 해준 passed 말고 직접 비교가 더 정확함
                    status: result.status.description,
                    compile_output: compileOutput || null,
                    stderr: stderr || null
                });

            } catch (err) {
                console.error(`테스트 ${i+1} 실행 중 오류:`, err);
                judge0Results.push({
                    id: i + 1,
                    description: testCase.description,
                    passed: false,
                    actual: "실행 오류",
                    expected: testCase.expected,
                    stderr: err.message
                });
            }
        }

        const passedCount = judge0Results.filter(r => r.passed).length;
        const totalCount = judge0Results.length;

        // 프롬프트 생성
        const prompt = `
당신은 ${language} 코드 리뷰어입니다.

**사용자 코드:**
\`\`\`${language}
${code}
\`\`\`

**테스트 결과:**
${judge0Results.map((r, idx) => `
테스트 ${idx + 1}: ${r.passed ? '✅ 통과' : '❌ 실패'}
- 설명: ${r.description}
- 입력: ${r.input || '(없음)'}
- 예상 출력: ${r.expected}
- 실제 출력: ${r.actual}
${r.compile_output ? `- 컴파일 오류: ${r.compile_output}` : ''}
${r.stderr ? `- 런타임 오류: ${r.stderr}` : ''}
`).join('\n')}

**통과율: ${passedCount} / ${totalCount}**

**피드백 작성 지침:**
1. **summary**: 전체적인 코드 평가 (이모지 포함, 2-3문장)
2. **strengths**: 잘한 점 2-3개 (배열)
3. **improvements**: 개선이 필요한 점 (실패한 테스트가 있을 경우만, 배열)
4. **suggestions**: 다음 단계 학습 제안 2-3개 (배열)

**중요:**
- 반드시 JSON 문자열(예: "3", "Hello World")로 반환해야 합니다.
- 10대 학생이 쉽게 이해할 수 있는 수준의 한국어로 작성
- 실패한 테스트가 있으면 구체적인 해결 방법 제시
- 컴파일/런타임 오류가 있으면 원인과 해결법 설명
- 격려와 긍정적인 톤 유지
`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                feedback: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        strengths: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        improvements: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    propertyOrdering: ['summary', 'strengths', 'improvements', 'suggestions']
                }
            },
            propertyOrdering: ['feedback']
        };

        console.log('🔄 Gemini API로 피드백 생성 중...');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-09-2025',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 0.1
                }
            }
        });

        // 구조화된 JSON 파싱
        const feedbackData = JSON.parse(response.text);

        // 최종 결과 반환
        res.json({
            results: judge0Results,
            feedback: feedbackData.feedback,
            passedCount,
            totalCount
        });

    } catch (error) {
        console.error('❌ 채점 오류:', error);
        console.error('오류 스택:', error.stack);
        
        res.status(500).json({
            error: '채점 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

module.exports = router;