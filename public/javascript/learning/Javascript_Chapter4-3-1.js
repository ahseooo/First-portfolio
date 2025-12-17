/* 파일명: Javascript_Chapter4-3-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter4-2-1.html"; // 이전 페이지
}

function goToNextPage() {
    window.location.href = "Javascript_Chapter4-4-1.html"; // 다음 페이지 (요소 조작)
}

// --- 데모 기능 ---
document.addEventListener('DOMContentLoaded', function() {
    const demoBtn = document.getElementById('demo-btn');
    const demoText = document.getElementById('demo-text');

    if (demoBtn && demoText) {
        demoBtn.addEventListener('click', function() {
            demoText.textContent = "와! 글자가 바뀌었어요! 🎉";
            demoText.style.color = "#d35400";
            demoText.style.fontWeight = "900";
            demoBtn.textContent = "성공!";
            demoBtn.style.backgroundColor = "#27ae60";
        });
    }

    // 모달 닫기 이벤트
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQuestionBox();
});