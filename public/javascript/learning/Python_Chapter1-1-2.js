const prevBtn = document.querySelector(".prev-btn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        window.location.href = "Python_Chapter1-1-1.html";
    });
}

const nextBtn = document.querySelector("#nextPageBtn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        window.location.href = "Python_Chapter1-1-3.html";
    });
}

const qToggle = document.getElementById("questionToggle");
const qAnswer = document.querySelector(".question-answer");
const qArrow = document.querySelector(".question-arrow i");

if (qToggle && qAnswer) {
    qToggle.addEventListener("click", () => {

        const isOpen = qAnswer.classList.contains("show");

        if (isOpen) {
            // 닫기
            qAnswer.classList.remove("show");
            qArrow.classList.remove("fa-chevron-up");
            qArrow.classList.add("fa-chevron-down");
        } else {
            // 열기
            qAnswer.classList.add("show");
            qArrow.classList.remove("fa-chevron-down");
            qArrow.classList.add("fa-chevron-up");
        }
    });
}