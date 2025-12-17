/* 파일명: Javascript_Chapter1-3-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter1-2-1.html"; // 이전 페이지 (JS 특징)
}

function goToNextPage() {
    window.location.href = "Javascript_Chapter1-4-1.html"; // 다음 페이지 (에러와 디버깅)
}

// --- 데모용 이벤트 핸들러 ---
document.addEventListener('DOMContentLoaded', function() {
    
    // 버튼 클릭 이벤트 데모
    const clickBtn = document.getElementById('clickBtn');
    if (clickBtn) {
        clickBtn.addEventListener('click', function() {
            alert('버튼이 클릭되었습니다! 🖱️');
        });
    }

    // 마우스 오버 이벤트 데모
    const hoverBox = document.getElementById('hoverBox');
    if (hoverBox) {
        hoverBox.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e74c3c';
            this.style.color = 'white';
            this.textContent = '올라왔다!';
        });
        hoverBox.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#ddd';
            this.style.color = '#333';
            this.textContent = '마우스 오버';
        });
    }

    // 모달 배경 클릭 시 닫기
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

// --- 공통 모달 기능 ---
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