// ==========================================
// 1. 페이지 네비게이션
// ==========================================
function goToPreviousPage() {
    window.location.href = "html_Chapter4-2-1.html"; // 이전 페이지 (표 병합)
}

function goToNextPage() {
    window.location.href = "html_Chapter4-4-1.html"; // 다음 페이지 (입력 요소 심화)
}

// ==========================================
// 2. 폼 제출 핸들러 (보내주신 로직 반영)
// ==========================================
function handleDemoSubmit(event) {
    event.preventDefault(); // 1. 새로고침 막기
    
    const resultDiv = document.getElementById('form-result');
    
    // 2. 결과 메시지 표시 (CSS hidden 클래스 제거)
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = '✅ 폼이 제출되었어요! (실제로는 서버로 전송됩니다)';
    
    // 3. 3초 뒤에 메시지 사라지게 하기
    setTimeout(() => {
        resultDiv.classList.add('hidden'); // 다시 숨기기
        resultDiv.innerHTML = '';          // 내용 비우기
    }, 3000);
}

// ==========================================
// 3. 질문하기 모달 (공통 기능)
// ==========================================
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
    
    alert('질문이 전송되었습니다! 🚀');
    textarea.value = ''; // 입력창 초기화
    closeQuestionBox();
}

// ==========================================
// 4. 이벤트 리스너 (페이지 로드 후)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // 질문 모달 배경 클릭 시 닫기
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeQuestionBox();
    }
});