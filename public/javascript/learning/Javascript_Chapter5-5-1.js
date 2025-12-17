/* 파일명: Javascript_Chapter5-5-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter5-4-1.html"; // 이전 페이지 (로컬 스토리지)
}

function goToNextPage() {
    // 챕터 5 완료 -> 챕터 6 시작 (예: 프로젝트)
    window.location.href = "Javascript_Chapter6-1.html"; 
}

// --- 1. setTimeout Demo ---
function runTimeout() {
    const box = document.getElementById('timeout-box');
    box.textContent = "3초 기다리는 중... ⏳";
    box.classList.add('active');
    box.classList.remove('done');

    setTimeout(function() {
        box.textContent = "3초 끝! 땡! 🛎️";
        box.classList.remove('active');
        box.classList.add('done');
    }, 3000);
}

// --- 2. setInterval Demo ---
let timerId = null;
let count = 0;

function startInterval() {
    const display = document.getElementById('interval-box');
    
    if (timerId !== null) return; // 이미 실행 중이면 중복 실행 방지

    timerId = setInterval(function() {
        count++;
        display.textContent = count;
    }, 1000);
}

function stopInterval() {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
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