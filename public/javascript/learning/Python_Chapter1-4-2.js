document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-4-1.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-4-3.html";
    });

    const slideData = [
    {
        title: "1. PyCharm 사이트 접속하기",
        info: ` PyCharm 설치 파일을 다운로드하기 위해 PyCharm 웹사이트(https://www.jetbrains.com)에 접속합니다.<br>
                    상단의 [개발자 도구] → [PyCharm] 메뉴를 클릭합니다.`,
        tip: `💡 TIP: PyCharm [개발자 도구]는 PyCharm 공식 페이지 내 상단 메뉴에 있습니다.`,
        img: "/images/learning/PyCharm1.png"
    },
    {
        title: "2. 버전 선택",
        info: `운영체제에 맞는 원하는 버전을 선택합니다.`,
        tip: `💡 TIP: 최신 버전 다운로드 버튼은 항상 상단에 있습니다.`,
        img: "/images/learning/PyCharm2.png"
    },
    {
        title: "3. 설치 파일 실행",
        info: `다운로드 된 PyCharm 설치 파일을 클릭하여 프로그램을 열어주세요.`,
        tip: `💡 TIP: 계속 Next를 눌러 진행해 주세요.`,
        img: "/images/learning/PyCharm3.png"
    },
    {
        title: "4. 옵션 선택 사항",
        info: `필요하다면 원하는 설정을 체크해주세요.`,
        tip: `💡 TIP: Add launchers dir to the PATH는 반드시 체크해주세요.
        필요한 설정들이 포함되어 있습니다. `,
        img: "/images/learning/PyCharm4.png"
    },
    {
        title: "5. 설치 완료",
        info: `이제 설치가 끝났습니다.`,
        tip: `💡 TIP: 프로그램을 실행해보세요!`,
        img: "/images/learning/PyCharm5.png"
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
