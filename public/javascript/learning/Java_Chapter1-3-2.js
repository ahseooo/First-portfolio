document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-3-1.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-3-3.html";
    });

    const slideData = [
    {
        title: "1. Oracle 사이트 접속하기",
        info: `Oracle JDK 설치 파일을 다운로드하기 위해 오라클 웹사이트(https://www.oracle.com)에 접속합니다.
               상단의 [Products] → [Hardware and Software] → [Java] 메뉴를 클릭합니다.`,
        tip: `💡 TIP: Java는 Oracle 공식 페이지 내 “Products” 메뉴 아래에 있습니다.`,
        img: "/images/learning/JDK1.png"
    },
    {
        title: "2. Download Java 클릭",
        info: `[Java] 화면이 나타나면 우측 상단의 [Download Java] 버튼을 클릭합니다.`,
        tip: `💡 TIP: 최신 버전 다운로드 버튼은 항상 우측 상단에 있습니다.`,
        img: "/images/learning/JDK2.png"
    },
    {
        title: "3. JDK 21 설치 파일 다운로드",
        info: `[Java Downloads] 화면에서 아래로 스크롤해 JDK 21을 찾습니다.
               상단의 [Windows] 탭을 클릭한 뒤 x64 Installer 다운로드 링크를 눌러
               jdk-21_windows-x64_bin.exe 파일을 다운로드합니다.`,
        tip: `💡 TIP: Windows 사용자는 반드시 x64 Installer(.exe)을 다운로드해야 합니다.`,
        img: "/images/learning/JDK3.png"
    },
    {
        title: "4. 설치 마법사 진행하기",
        info: `다운로드한 설치 파일을 실행한 뒤 각 화면에서 Next 버튼을 눌러 기본 설정으로 설치를 진행합니다.`,
        tip: `💡 TIP: 설치 과정은 기본값 그대로 진행하면 됩니다.`,
        img: "/images/learning/JDK4.png"
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
