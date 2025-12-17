document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.querySelector(".start-button");
  startButton.addEventListener("click", function () {
    window.location.href = "html_Chapter1-1-1.html"; // 이동할 다음 페이지 파일명
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const codeBox = document.querySelector('.code-box');
  if (codeBox) {
    codeBox.style.color = isLight ? '#222' : '#f8f8f8';
    codeBox.style.fontFamily = "'Fira Code', monospace";
    codeBox.style.border = `2px solid ${isLight ? '#bbb' : '#666'}`;
  }
});
