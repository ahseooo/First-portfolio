function goToPreviousPage() {
    window.location.href = "html_Chapter4-5-1.html"; // 이전 페이지 (입력 요소)
}

function goToNextPage() {
    alert("축하합니다! HTML 챕터 4를 모두 완료했어요! 🎉\n다음 챕터로 이동합니다.");
    window.location.href = "html_Chapter5-1-1.html"; // 다음 챕터 (표 만들기 등)
}

// 1. 체크박스 제출 핸들러
function submitCheckbox() {
    const checkboxes = document.querySelectorAll('#checkboxForm input[type="checkbox"]:checked');
    const resultDiv = document.getElementById('checkboxResult');
    
    if (checkboxes.length === 0) {
        resultDiv.textContent = "😅 아무것도 선택하지 않았어요!";
        resultDiv.classList.remove('hidden');
        return;
    }

    // 선택된 값들 가져오기
    const values = Array.from(checkboxes).map(cb => cb.value);
    
    resultDiv.innerHTML = `🧺 장바구니에 <strong>${values.join(', ')}</strong>을(를) 담았어요!`;
    resultDiv.classList.remove('hidden');
}

// 2. 라디오 버튼 제출 핸들러
function submitRadio() {
    const radio = document.querySelector('#radioForm input[type="radio"]:checked');
    const resultDiv = document.getElementById('radioResult');

    if (!radio) {
        resultDiv.textContent = "😅 학년을 선택해주세요!";
        resultDiv.classList.remove('hidden');
        return;
    }

    resultDiv.innerHTML = `🎓 당신은 <strong>${radio.value}</strong>입니다!`;
    resultDiv.classList.remove('hidden');
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