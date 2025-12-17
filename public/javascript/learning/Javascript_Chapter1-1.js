document.addEventListener('DOMContentLoaded', function() {
    // 진행률 표시 (예: 0% 초기화 또는 로컬 스토리지 연동)
    const progressBar = document.getElementById('progressBar');
    
    // 애니메이션 효과를 위해 약간의 지연 후 실행
    setTimeout(() => {
        // 사용자의 실제 진도율을 불러와서 넣을 수 있습니다.
        // 지금은 시작 페이지이므로 0~5% 정도만 보여줍니다.
        progressBar.style.width = '5%'; 
    }, 500);
});