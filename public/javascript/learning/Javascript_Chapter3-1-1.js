/* 파일명: Javascript_Chapter3-1-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter2-5-1.html"; // 이전 페이지 (반복문)
}

function goToNextPage() {
    window.location.href = "Javascript_Chapter3-2-1.html"; // 다음 페이지 (화살표 함수 - 커리큘럼상 3-2로 가정)
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