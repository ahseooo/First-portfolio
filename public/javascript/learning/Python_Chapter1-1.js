// 학습하기 버튼 클릭시 진행바 업데이트 (선택사항)
const startButton = document.querySelector('.start-button');
if (startButton) {
    startButton.addEventListener('click', () => {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = '10%';
        }
    });
}