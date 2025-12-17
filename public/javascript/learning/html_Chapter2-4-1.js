function goToPreviousPage() {
    window.location.href = "html_Chapter2-3-1.html"; // 이전 페이지
}

function goToNextPage() {
    alert("축하합니다! HTML 챕터 2를 모두 완료했어요! 🎉\n다음 챕터로 이동합니다.");
    window.location.href = "html_Chapter3-1-1.html"; // 다음 챕터 (예: 이미지와 링크)
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