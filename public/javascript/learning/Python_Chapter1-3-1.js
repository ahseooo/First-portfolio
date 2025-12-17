document.addEventListener("DOMContentLoaded", () => {

    // ⬅ 이전
    const prevBtn = document.querySelector(".prev-btn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            window.location.href = "Python_Chapter1-2-1.html";
        });
    }

    // ➡ 다음
    const nextBtn = document.querySelector(".next-btn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            window.location.href = "Python_Chapter1-3-2.html";
        });
    }
});
