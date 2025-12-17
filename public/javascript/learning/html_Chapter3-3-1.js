function goToPreviousPage() {
    window.location.href = "html_Chapter3-2-1.html"; // 이전 페이지 (하이퍼링크)
}

function goToNextPage() {
    window.location.href = "html_Chapter3-4-1.html"; // 다음 페이지 (목록 만들기)
}

// --- 공통 기능 ---
function openQuestionBox() {
    const modal = document.getElementById('question-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeQuestionBox() {
    const modal = document.getElementById('question-modal');
    if (modal) modal.classList.add('hidden');
}

function submitQuestion() {
    const modal = document.getElementById('question-modal');
    const textarea = modal.querySelector('textarea');
    if (textarea.value.trim() === '') {
        alert('내용을 입력해주세요.');
        return;
    }
    alert('질문이 전송되었습니다.');
    textarea.value = '';
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