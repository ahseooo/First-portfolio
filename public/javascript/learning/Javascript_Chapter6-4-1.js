/* 파일명: Javascript_Chapter6-4-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter6-3-1.html"; // 이전 페이지 (추첨기)
}

function goToNextPage() {
    window.location.href = "Javascript_Chapter6-5-1.html"; // 다음 페이지 (퀴즈/마무리)
}

// --- 코드 실행 기능 ---
function runCode() {
    const codeInput = document.getElementById('code-input').value;
    const previewFrame = document.getElementById('preview-frame');
    
    const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    
    frameDoc.open();
    frameDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; text-align: center; padding: 20px; }
                input { padding: 8px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; }
                button { padding: 8px 15px; background: #ff9f43; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px; font-size: 16px; }
                button:hover { background: #e67e22; }
                ul { list-style: none; padding: 0; margin-top: 20px; text-align: left; display: inline-block; width: 100%; max-width: 300px; }
                li { background: #f1f2f6; border-bottom: 1px solid #ddd; padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius: 5px; margin-bottom: 5px; }
                li button { background: #ff4757; font-size: 12px; padding: 5px 10px; margin-left: 10px; }
                li button:hover { background: #e84118; }
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