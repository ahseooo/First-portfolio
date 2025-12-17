function goToPreviousPage() {
    window.location.href = "Javascript_Chapter1-3-1.html"; // 이전 페이지 (만들기)
}

function goToNextPage() {
    alert("축하합니다! 자바스크립트 챕터 1을 모두 완료했어요! 🎉\n다음 챕터(제어문과 함수)로 이동합니다.");
    window.location.href = "Javascript_Chapter2-1-1.html"; // 다음 챕터 (조건문)
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