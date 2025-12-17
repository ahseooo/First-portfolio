const questionBtn = document.querySelector('.question-button');
const modal = document.getElementById('question-modal');

questionBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

function closeQuestionBox() {
    modal.classList.add('hidden');
}

function submitQuestion() {
    const text = modal.querySelector('textarea').value.trim();
    if (text === '') {
        alert('질문 내용을 입력해주세요.');
        return;
    }

    alert('질문이 제출되었습니다: \n' + text);
    modal.querySelector('textarea').value = '';
    closeQuestionBox();
}
const prevBtn = document.querySelector(".prev-btn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        window.location.href = "html_Chapter2-1.html";
    });
}

const nextBtn = document.querySelector(".next-btn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        window.location.href = "html_Chapter2-2-1.html";
    });
}