/* 파일명: Javascript_Chapter6-2-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter6-1.html"; // 이전 페이지 (주사위)
}

function goToNextPage() {
    // 챕터 6 완료 또는 퀴즈
    window.location.href = "Javascript_Chapter6-3-1.html"; 
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
                body { font-family: sans-serif; text-align: center; padding: 10px; }
                /* 사용자가 작성하지 않아도 기본적으로 좀 예쁘게 보이도록 기본 스타일 추가 가능 */
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