const axios = require('axios');

class Judge0API {
    constructor(apiKey) {
        this.client = axios.create({
            baseURL: 'https://judge0-ce.p.rapidapi.com',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': apiKey,
                "X-RapidAPI-Host": 'judge0-ce.p.rapidapi.com'
            },
            timeout: 15000  // 15초
        });

        // 요청 인터셉터 - 로그 && 디버깅
        this.client.interceptors.request.use(
            (config) => {
                console.log(`Judge0 API 요청: ${config.method.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('요청 설정 오류: ', error);
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터 - 에러 처리
        this.client.interceptors.response.use(
            (response) => {
                console.log(`Judge0 API 응답: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                if(error.response) {
                    console.error(`Judge0 API 에러  ${error.response.status}: `, error.response.data);
                }
                else if(error.request) {
                    console.error('네트워크 에러: ', error.request);
                }
                else {
                    console.error('설정 에러: ', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // 코드 제출
    async submitCode(sourceCode, languageId, stdin = '') {
        try {
            const response = await this.client.post('/submissions?base64_encoded=true&wait=false', {
                source_code: Buffer.from(sourceCode, 'utf8').toString('base64'),
                language_id: languageId,
                stdin: stdin ? Buffer.from(stdin, 'utf8').toString('base64') : ''
            });

            return response.data.token;
        } catch(error) {
            this.handleError(error, '코드 제출');
        }
    }

    // 결과 조회
    async getResult(token) {
        try {
            const response = await this.client.get(`/submissions/${token}?base64_encoded=true`);
            const result = response.data;

            // Base64 디코딩
            if(result.stdout) {
                result.stdout = Buffer.from(result.stdout, 'base64').toString('utf8');
            }
            if(result.stderr) {
                result.stderr = Buffer.from(result.stderr, 'base64').toString('utf8');
            }
            if(result.compile_output) {
                result.compile_output = Buffer.from(result.compile_output, 'base64').toString('utf8');
            }

            return result;
        } catch(error) {
            this.handleError(error, '결과 조회');
        }
    }

    // 폴링을 통한 완전한 코드 실행
    async executeCode(sourceCode, languageId, stdin = '', maxWaitTime = 30000) {
        try {
            console.log(`코드 실행 시작 - 언어 ID: ${languageId}`);

            // 1. 코드 제출
            const token = await this.submitCode(sourceCode, languageId, stdin);
            console.log(`제출 완료 - 토큰: ${token}`);

            // 2. 결과 폴링
            const startTime = Date.now();
            let attempts = 0;

            while(Date.now() - startTime < maxWaitTime) {
                attempts++;
                console.log(`결과 확인 시도 ${attempts}번째...`);

                const result = await this.getResult(token);

                // 실행 상태 확인
                // 1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer, 5: Time Limit Exceeded, 6: Compilation Error, etc.

                if(result.status.id > 2) {
                    console.log(`실행 완료 - 상태: ${result.status.description}`);

                    return {
                        success: result.status.id === 3,    // 3 = Accepted
                        status: result.status.description,
                        output: result.stdout || '',
                        error: result.stderr || result.compile_output || '',
                        time: result.time || 0,
                        memory: result.memory || 0,
                        token: token
                    };
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            throw new Error(`실행 시간 초과 (${maxWaitTime / 1000}초)`);
        } catch(error) {
            console.error('코드 실행 중 오류: ', error.message);
            throw error;
        }
    }

    handleError(error, operation) {
        let errorMessage = `${operation} 실패: `;

        if(error.response) {
            // API 에러 응답
            const status = error.response.status;
            const data = error.response.data;

            if(status === 429) {
                errorMessage += 'API 호출 한도 초과. 잠시후 다시 시도해주세요.';
            } else if(status === 401) {
                errorMessage += 'API 키가 유효하지 않습니다.';
            } else if(status >= 500) {
                errorMessage += 'Judge0 서버 오류가 발생했습니다.';
            } else {
                errorMessage += data?.message || `HTTP ${status} 오류`;
            }
        } else if(error.request) {
            errorMessage += '네트워크 연결 오류. 인터넷 연결을 확인해주세요.';
        } else if(error.code === 'ECONNABORTED') {
            errorMessage += '요청 시간 초과. 다시 시도해주세요.';
        } else {
            errorMessage += error.message;
        }

        throw new Error(errorMessage);
    }
}

module.exports = Judge0API;