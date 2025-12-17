document.addEventListener("DOMContentLoaded", () => {

    // 이전 → 1-2-3
    const prevBtn = document.querySelector(".prev-btn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            window.location.href = "Java_Chapter1-2-3.html";
        });
    }

    // 다음 → 1-2-5
    const nextBtn = document.querySelector("#nextPageBtn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            window.location.href = "Java_Chapter1-2-5.html";
        });
    }
});
