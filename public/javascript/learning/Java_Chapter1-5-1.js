document.addEventListener("DOMContentLoaded", () => {

    // 페이지 이동
    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-4-4.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        alert("축하합니다! 자바 챕터 1을 모두 완료했어요! 🎉\n다음 챕터로 이동합니다.");
        alert("업데이트 중입니다.");
    });
});