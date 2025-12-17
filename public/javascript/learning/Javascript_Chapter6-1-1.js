/* 파일명: Javascript_Chapter6-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter6-1.html"; // 이전 페이지 (챕터 5 마지막)
}

function goToNextPage() {
    window.location.href = "Javascript_Chapter6-2-1.html"; // 다음 페이지 (퀴즈)
}

// --- 코드 실행 기능 (Mini Editor) ---
function runCode() {
    const codeInput = document.getElementById('code-input').value;
    const previewFrame = document.getElementById('preview-frame');
    
    // iframe 내부 리셋 및 쓰기
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 20px; }
                h1 { color: #9b59b6; }
                #result { font-size: 24px; font-weight: bold; margin: 20px 0; min-height: 30px; color: #333; }
                button { background: #9b59b6; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; cursor: pointer; }
                button:hover { background: #8e44ad; }
            </style>
        </head>
        <body>
            ${codeInput}
        </body>
        </html>
    `);
    frameDoc.close();
}

// 초기 로드 시 한 번 실행하여 플레이스홀더 내용 보여주기 (선택사항)
// document.addEventListener('DOMContentLoaded', runCode);

// --- 공통 기능 ---
function openQuestionBox() {
    document.getElementById('question-modal').classList.remove('hidden');
}

function closeQuestionBox() {
    document.getElementById('question-modal').classList.add('hidden');
}

function submitQuestion() {
    alert('질문이 전송되었습니다.');
    closeQuestionBox();
}

document.addEventListener('DOMContentLoaded', function() {
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQuestionBox();
});