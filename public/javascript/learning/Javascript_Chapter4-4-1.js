/* 파일명: Javascript_Chapter4-4-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter4-3-1.html"; // 이전 페이지 (DOM 기초)
}

function goToNextPage() {
    // 챕터 4 완료 -> 다음은 실전 프로젝트 챕터(예: Chapter 5) 목차로 이동
    window.location.href = "Javascript_Chapter4-5-1.html"; 
}

// --- 데모 기능 ---
document.addEventListener('DOMContentLoaded', function() {
    const demoBtn = document.getElementById('demo-btn');
    const demoMsg = document.getElementById('demo-msg');

    if (demoBtn && demoMsg) {
        demoBtn.addEventListener('click', function() {
            demoMsg.textContent = "변신 완료! ✨ 멋지죠?";
            demoMsg.style.color = "purple";
            demoMsg.style.fontSize = "24px";
            demoMsg.style.fontWeight = "bold";
            demoBtn.style.backgroundColor = "#8e44ad";
            demoBtn.textContent = "성공!";
        });
    }

    // 모달 닫기
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