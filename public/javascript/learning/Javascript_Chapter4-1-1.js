/* 파일명: Javascript_Chapter4-1-1.js */

function goToPreviousPage() {
    // 3챕터 마지막 페이지 (문자열/배열 함수)
    window.location.href = "Javascript_Chapter3-5-1.html"; 
}

function goToNextPage() {
    // 4-2. 메서드 페이지
    window.location.href = "Javascript_Chapter4-2-1.html"; 
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