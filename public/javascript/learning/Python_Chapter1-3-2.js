document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-3-1.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-3-3.html";
    });

    const slideData = [
    {
        title: "1. Python 사이트 접속하기",
        info: `Python 설치 파일을 다운로드하기 위해 파이썬 웹사이트(https://www.python.org)에 접속합니다.<br>
                상단의 [Download] → [Windows] / [MacOS] 메뉴를 클릭합니다.`,
        tip: `💡 TIP: 파이썬 [Download]는 Python 공식 페이지 내 상단 메뉴에 있습니다.`,
        img: "/images/learning/Python1.png"
    },
    {
        title: "2. 버전 선택",
        info: `운영체제에 맞는 원하는 버전을 선택합니다.`,
        tip: `💡 TIP: 최신 버전 다운로드 버튼은 항상 상단에 있습니다.`,
        img: "/images/learning/Python2.png"
    },
    {
        title: "3. 설치 파일 실행",
        info: `다운로드 된 python 3.x.x를 클릭하여 설치 프로그램을 열어주세요.`,
        tip: `💡 TIP: Add python.exe to PATH를 반드시 체크해주세요. 필요한 설정들이 포함되어 있습니다.`,
        img: "/images/learning/Python3.png"
    },
    {
        title: "4. 옵션 선택 사항",
        info: `필요하다면 원하는 설정을 체크해주세요.`,
        tip: `💡 TIP: 언제든지 설정에서 변경할 수 있습니다..`,
        img: "/images/learning/Python4.png"
    },
];


    let currentSlide = 0;

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

        // 상단 dots
        stepDots.forEach((dot, idx) => {
            dot.classList.remove("active");
            if (idx === currentSlide) dot.classList.add("active");
        });

        // 하단 dots
        pagerDots.forEach((dot, idx) => {
            dot.classList.remove("active");
            if (idx === currentSlide) dot.classList.add("active");
        });
    }

    // 이미지 이전 버튼
    imgPrev.addEventListener("click", () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlideUI();
        }
    });

    // 이미지 다음 버튼
    imgNext.addEventListener("click", () => {
        if (currentSlide < slideData.length - 1) {
            currentSlide++;
            updateSlideUI();
        }
    });

    updateSlideUI();
});
