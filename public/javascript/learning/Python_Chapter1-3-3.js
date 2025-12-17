document.addEventListener("DOMContentLoaded", () => {

    // 페이지 이동 
    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-3-2.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-4-1.html";
    });

    const slideData = [
        {
            title: "1. 명령 프롬프트 실행하기",
            info: `
                시작 메뉴 검색창에 ‘cmd’ 또는 ‘명령’을 입력한 뒤  
                나타나는 <strong>명령 프롬프트</strong>를 실행하세요.
            `,
            tip: `💡 TIP: ‘명령’만 입력해도 cmd가 자동으로 검색됩니다.`,
            img: "/images/learning/Python6.png"
        },
        {
            title: "2. 파이썬 버전 확인하기",
            info: `
                명령 프롬프트에서 <strong>python -version</strong>을 입력하세요.<br>
                아래처럼 버전이 출력되면 파이썬 설치가 정상적으로 완료된 것입니다!
            `,
            tip: `💡 TIP: 명령어는 소문자로 입력해도 문제 없습니다.`,
            img: "/images/learning/Python6.png"
        }
    ];

    let currentSlide = 0;

    // 요소 불러오기
    const slideImage = document.getElementById("slideImage");
    const slideTitle = document.getElementById("slideTitle");
    const infoBox = document.getElementById("infoBox");
    const tipBox = document.getElementById("tipBox");

    const stepDots = document.querySelectorAll("#stepDots .dot");  
    const pagerDots = document.querySelectorAll("#pagerDots .dot");

    const imgPrev = document.getElementById("imgPrev");
    const imgNext = document.getElementById("imgNext");

    function updateSlideUI() {

        slideImage.src = slideData[currentSlide].img;
        slideTitle.innerText = slideData[currentSlide].title;
        infoBox.innerHTML = slideData[currentSlide].info;
        tipBox.innerHTML = slideData[currentSlide].tip;

        // 상단 dot
        stepDots.forEach((dot, idx) => {
            dot.classList.remove("active");
            if (idx === currentSlide) dot.classList.add("active");
        });

        // 하단 dot
        pagerDots.forEach((dot, idx) => {
            dot.classList.remove("active");
            if (idx === currentSlide) dot.classList.add("active");
        });
    }

    // 이미지 ← 버튼
    imgPrev.addEventListener("click", () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlideUI();
        }
    });

    // 이미지 → 버튼
    imgNext.addEventListener("click", () => {
        if (currentSlide < slideData.length - 1) {
            currentSlide++;
            updateSlideUI();
        }
    });

    // 첫 화면 초기화
    updateSlideUI();
});
