document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-4-2.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Python_Chapter1-5-1.html";
    });

    const slideData = [
    {
        title: "1. 프로젝트 생성하기",
        info: ` Create New Project를 클릭하세요.`,
        tip: `💡 TIP: 프로젝트 생성은 상단 설정에서도 생성할 수 있습니다.`,
        img: "/images/learning/PyCharm6.png"
    },
    {
        title: "2. 프로젝트 이름 설정",
        info: `프로젝트 이름은 SystemTrading으로 지어줍니다. `,
        tip: `💡 TIP: 이름은 설정에서 변경할 수 있습니다.`,
        img: "/images/learning/PyCharm7.png"
    },
    {
        title: "3. Python.exe",
        info: ` Python.exe를 선택하고 Ok를 누릅니다.`,
        tip: `💡 TIP: 다음 화면에서 계속 진행합니다.`,
        img: "/images/learning/PyCharm8.png"
    },
    {
        title: "4. 생성하기",
        info: `Create를 누르면 프로젝트가 생성됩니다.`,
        tip: `💡 코드를 입력해보세요. `,
        img: "/images/learning/PyCharm9.png"
    },
    {
        title: "5. 생성 완료",
        info: `프로젝트 생성이 완료되었습니다.`,
        tip: `💡 TIP: 프로그램을 실행해보세요!`,
        img: "/images/learning/PyCharm10.png"
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
