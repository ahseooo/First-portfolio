document.addEventListener("DOMContentLoaded", () => {

    // ⬅ 이전 → 1-3-1
    const prevBtn = document.querySelector(".prev-btn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            window.location.href = "Java_Chapter1-2-5.html";
        });
    }

    // ➡ 다음 → 1-3-3
    const nextBtn = document.querySelector(".next-btn");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            window.location.href = "Java_Chapter1-3-2.html";
        });
    }
});
