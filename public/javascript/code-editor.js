let editor;
let currentLanguage = sessionStorage.getItem('selectedLanguage') || 'java';
let pendingLanguage = null;

const modal = document.getElementById('languagaChangeModal');
const languageButtons = document.querySelectorAll('.lang-btn');

// Monaco Editor 초기화
require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs'
    }
});

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: getDefaultCode(currentLanguage),
        language: currentLanguage,
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 16,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlight: 'all',
        tabSize: 4,
        contextmenu: true,
    });

    // 에디터 초기화 완료 후 언어 버튼 초기화
    initializeLanguageButtons();
});

// 기본 코드 템플릿
function getDefaultCode(language) {
    const templates = {
        html: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>코딩몬스터</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            height: 100vh;
        }
    </style>
</head>
<body>
    <!--여기에 코드를 작성해 주세요.-->
</body>
</html>`,

        javascript: `// 코딩몬스터 JavaScript 예제
console.log("안녕하세요! 코딩몬스터입니다 🦁");`,

        python: `# 코딩몬스터 Python 예제
print("안녕하세요! 코딩몬스터입니다 🦁")`,

        java: `// 코딩몬스터 Java 예제
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}`
    };
    return templates[language] || '';
}

// 언어 변경 관련

// 언어 버튼 초기화
function initializeLanguageButtons() {

    // 초기 상태 설정
    updateActiveButton(currentLanguage);

    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLanguage = button.dataset.lang;

            if(selectedLanguage === currentLanguage) {
                return;
            }

            if(selectedLanguage && selectedLanguage !== currentLanguage) {
                attemptLanguageChange(selectedLanguage);
            }
        });
    });
}

// 언어 변경 시도
function attemptLanguageChange(selectedLanguage) {
    // 변경할 언어 정보 저장
    pendingLanguage = selectedLanguage;

    // 모달 표시
    showModal(currentLanguage.toUpperCase(), selectedLanguage.toUpperCase());
}

// 모달 표시
function showModal(currentLang, selectedLang) {
    const modalCurrentLang = document.getElementById('modalCurrentLang');
    const modalselectedLang = document.getElementById('modalselectedLang');

    if(modal && modalCurrentLang && modalselectedLang) {
        modalCurrentLang.textContent = currentLang;
        modalselectedLang.textContent = selectedLang;
        modal.classList.add('show');
    }
}

// 모달 닫기
function closeModal() {
    if(modal) {
        modal.classList.remove('show');
        pendingLanguage = null;
    }
}

// 언어 변경 실행
function changeLanguage(selectedLanguage) {
    console.log(`🔄 언어 변경: ${currentLanguage} → ${selectedLanguage}`);
    
    sessionStorage.setItem('selectedLanguage', selectedLanguage)
    currentLanguage = selectedLanguage;

    if(editor) {
        // Monaco Editor 기본 언어 설정
        const monacoLanguage = getMonacoLanguage(selectedLanguage);
        monaco.editor.setModelLanguage(editor.getModel(), monacoLanguage);

        editor.setValue(getDefaultCode(selectedLanguage));       // 기본 코드 설정
        updateActiveButton(selectedLanguage);                    // 활성 버튼 스타일 업데이트
        clearOutput();                                      // 출력 화면 초기화
        document.getElementById('output').textContent = '여기에 실행 결과가 표시됩니다.';
        
        fetchQuests();
    }

    closeModal();
}

function getMonacoLanguage(language) {
    const monacoMapping = {
        'html': 'html',
        'javascript': 'javascript',
        'python': 'python',
        'java': 'java'
    };
    return monacoMapping[language] || language;
}

// 활성 버튼 스타일 업데이트
function updateActiveButton(activeLang) {
    languageButtons.forEach(button => {
        const buttonLang = button.dataset.lang;
        button.classList.toggle('active', buttonLang === activeLang);
    });
}

// 모달 버튼 이벤트
document.addEventListener('DOMContentLoaded', () => {
    // 취소 버튼
    const btnCancel = document.getElementById('btnCancel');
    btnCancel.addEventListener('click', () => {
        closeModal();
    });

    // 변경 버튼
    const btnConfirm = document.getElementById('btnConfirm');
    btnConfirm.addEventListener('click', () => {
        if(pendingLanguage) {
            changeLanguage(pendingLanguage);
        }
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            console.log('❌ 모달 외부 클릭으로 취소');
            closeModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && modal && modal.classList.contains('show')) {
            console.log('❌ ESC 키로 취소');
            closeModal();
        }
    });
});

// 출력 화면 지우기
function clearOutput() {
    document.getElementById('output').textContent = '';
    document.getElementById('htmlOutput').src = 'about:blank';
}

// 초기화 버튼
document.getElementById('reset').addEventListener('click', () => {
    clearOutput();
    document.getElementById('output').textContent = '여기에 실행 결과가 표시됩니다.';
    
});

// 코드 실행
document.getElementById('run-code').addEventListener('click', async () => {
    if (!editor) return;

    const code = editor.getValue();
    const outputElement = document.getElementById('output');
    const htmlOutputElement = document.getElementById('htmlOutput');

    // UI 초기화
    outputElement.style.display = currentLanguage === 'html' ? 'none' : 'block';
    htmlOutputElement.style.display = currentLanguage === 'html' ? 'block' : 'none';

    try {
        if (currentLanguage === 'html') {
            // HTML 직접 실행
            executeHTML(code, htmlOutputElement);
        } else {
            // Python, Java, Javascript - Judge0 API 사용
            await executeWithAPI(code, currentLanguage);
        }
    } catch (error) {
        outputElement.textContent = 'ERROR: ' + error.message;
    }
});

// HTML 실행 함수
function executeHTML(code, htmlOutputElement) {
    try {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        htmlOutputElement.src = url;
        console.log('✅ HTML 실행 완료');
    } catch (error) {
        throw new Error(`HTML 실행 실패: ${error.message}`);
    }
}

// Judge0 API로 코드 실행 (Python, Java)
async function executeWithAPI(code, language) {
    const outputElement = document.getElementById('output');
    const loadingElement = document.getElementById('loading');

    try {
        // 로딩 표시
        loadingElement.style.display = 'flex';
        outputElement.style.display = 'none';

        // 서버 API 호출
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                language: language,
                input: document.getElementById('editor') ? editor.getValue() : ''
            })
        });

        const result = await response.json();

        if(result.success) {
            const data = result.data;

            let output = ``;

            if(data.output) {
                output += `📤 출력 결과:\n${data.output}\n\n`;
            }

            if(data.error) {
                output += `❌ 오류/경고:\n${data.error}\n\n`;
            }

            output += `⏱️ 실행 시간: ${data.time || 0}초\n`;
            output += `💾 메모리 사용: ${data.memory || 0}KB`;

            outputElement.textContent = output;
        }
        else {
            outputElement.textContent = `❌ 실행 실패:\n${result.error}`;
        }

    } catch (error) {
        outputElement.textContent = 'API 실행 중 오류가 발생했습니다: ' + error.message;
    } finally {
        loadingElement.style.display = 'none';
        outputElement.style.display = 'block';
    }
}