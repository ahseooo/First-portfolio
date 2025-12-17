/* 파일명: Javascript_Chapter5-3-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter5-2-1.html"; // 이전 페이지 (JSON)
}

function goToNextPage() {
    // 챕터 5-3이 마지막이라면 다음 챕터 또는 완료 페이지
    window.location.href = "Javascript_Chapter5-4-1.html"; // (예시: API 통신)
}

// --- 1. 토글 데모 ---
function toggleDemo() {
    const demoMsg = document.getElementById('demo-msg');
    if (demoMsg) {
        if (demoMsg.style.display === 'none') {
            demoMsg.style.display = 'block';
        } else {
            demoMsg.style.display = 'none';
        }
    }
}

// --- 2. 로그인 시뮬레이션 ---
function setLogin(isLoggedIn) {
    const statusText = document.getElementById('login-status');
    const userIcon = document.getElementById('user-icon');

    if (isLoggedIn) {
        statusText.textContent = "로그인되었습니다! 🎉";
        statusText.style.color = "#2ecc71";
        userIcon.classList.remove('guest');
        userIcon.classList.add('member');
        userIcon.textContent = "🧑‍💻";
    } else {
        statusText.textContent = "로그아웃 상태";
        statusText.style.color = "#555";
        userIcon.classList.remove('member');
        userIcon.classList.add('guest');
        userIcon.textContent = "👤";
    }
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