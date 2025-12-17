/* 파일명: Javascript_Chapter6-3-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter6-2-1.html"; // 이전 페이지 (숫자 게임)
}

function goToNextPage() {
    // 챕터 6-4 (최종 퀴즈/마무리)
    window.location.href = "Javascript_Chapter6-4-1.html"; 
}

// --- 코드 실행 기능 ---
function runCode() {
    const codeInput = document.getElementById('code-input').value;
    const previewFrame = document.getElementById('preview-frame');
    
    // iframe 리셋 및 코드 주입
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 20px; }
                h1 { color: #00b894; margin-bottom: 20px; }
                h2 { font-size: 40px; color: #555; min-height: 50px; }
                button { background: #00cec9; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 20px; cursor: pointer; font-weight: bold; transition: 0.2s; }
                button:hover { transform: scale(1.05); background: #00b894; }
                button:active { transform: scale(0.95); }
            </style>
        </head>
        <body>
            ${codeInput}
        </body>
        </html>
    `);
    frameDoc.close();
}

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