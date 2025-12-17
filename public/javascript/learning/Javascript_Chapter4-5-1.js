/* 파일명: Javascript_Chapter4-5-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter4-4-1.html"; // 이전 페이지 (DOM 조작)
}

function goToNextPage() {
    // 챕터 4 완료 -> 챕터 5 목차로 이동
    window.location.href = "Javascript_Chapter5-1.html"; 
}

// --- 데모 기능 ---
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 알림 버튼 데모
    const alertBtn = document.getElementById('alert-btn');
    if (alertBtn) {
        alertBtn.addEventListener('click', function() {
            alert('버튼 클릭됨! 🎉\n이벤트 처리가 잘 작동하네요!');
        });
    }

    // 2. 마우스 오버 상자 데모
    const interactiveBox = document.getElementById('interactive-box');
    if (interactiveBox) {
        interactiveBox.addEventListener('mouseover', function() {
            this.style.backgroundColor = 'orange';
            this.textContent = '올라왔다! 😮';
            this.style.color = 'white';
        });

        interactiveBox.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'lightblue';
            this.textContent = '나갔다... 😐';
            this.style.color = '#333';
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