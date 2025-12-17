// ==========================================
// 1. 페이지 네비게이션
// ==========================================
function goToPreviousPage() {
    window.location.href = "html_Chapter4-3-1.html"; // 이전 페이지
}

function goToNextPage() {
    window.location.href = "html_Chapter4-5-1.html"; // 다음 페이지
}

// ==========================================
// 2. 종합 예제 제출 핸들러
// ==========================================
function handleFinalSubmit(event) {
    event.preventDefault(); // 새로고침 방지
    alert("가입을 축하합니다! 🎊\n(실제 서버 전송은 생략되었습니다)");
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
    alert('질문이 전송되었습니다.');
    textarea.value = '';
    closeQuestionBox();
}

// ==========================================
// 4. 이벤트 리스너 (DOM 로드 후 실행)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    
    // --- [추가됨] 색상 선택기 로직 ---
    // HTML의 id="demoColor"와 id="colorValue"를 찾습니다.
    const colorPicker = document.getElementById('demoColor'); 
    const colorDisplay = document.getElementById('colorValue');

    if (colorPicker && colorDisplay) {
        // 'input' 이벤트: 색상을 드래그하는 동안에도 실시간으로 변경됩니다.
        colorPicker.addEventListener('input', function() {
            colorDisplay.textContent = this.value; // 텍스트 변경
            colorDisplay.style.color = this.value; // 글자색 변경 (선택 사항)
            
            // 만약 배경색을 바꾸고 싶다면 아래 주석을 해제하세요
            // colorDisplay.style.backgroundColor = this.value;
            // colorDisplay.style.color = '#fff';
        });
    }

    // --- 질문 모달 배경 클릭 닫기 ---
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQuestionBox();
});