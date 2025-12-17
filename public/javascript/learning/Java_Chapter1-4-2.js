document.addEventListener("DOMContentLoaded", () => {

    // 페이지 이동
    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-4-1.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-4-3.html";
    });

    const slideData = [
        {
            title: "1. Eclipse 사이트 접속하기",
            info: `
                이클립스(Eclipse) 설치 파일을 다운로드하기 위해 
                이클립스 웹사이트(https://www.eclipse.org/)에 접속합니다.<br>
                상단의 [Download] 버튼을 클릭합니다.
            `,
            tip: `💡 TIP: Download 버튼은 페이지 상단에 있어요.`,
            img: "/images/learning/Eclipse1.png"
        },
        {
            title: "2. 좌측 [Download x86_64] 클릭",
            info: `
                운영체제를 자동으로 감지하여 PC에 맞는 버전 버튼이 표시됩니다.<br>
                좌측의 [Download x86_64] 버튼을 클릭하세요.
            `,
            tip: `💡 TIP: 다른 OS가 필요하면 하단 "Download Packages"에서 변경할 수 있어요.`,
            img: "/images/learning/Eclipse2.png"
        },
        {
            title: "3. 버전 선택",
            info: `
                다운로드가 완료되면 설치 파일을 실행합니다.<br>
                여러 버전이 보이지만 반드시 "Eclipse IDE for Java Developers"를 선택하세요!
            `,
            tip: `💡 TIP: 자바 개발용 필수 버전은 Java Developers 버전입니다.`,
            img: "/images/learning/Eclipse3.png"
        },
        {
            title: "4. Install",
            info: `
                워크스페이스(프로젝트 저장 폴더)를 선택합니다.<br>
                기본 경로 사용 또는 원하는 폴더로 변경할 수 있어요.
            `,
            tip: `💡 TIP: "Use this as default" 체크하면 다음부터 이 화면이 생략됩니다.`,
            img: "/images/learning/Eclipse4.png"
        },
        {
            title: "5. 설치 완료",
            info: `
                모든 설치 과정이 완료되었습니다!<br>
                이제 첫 Java 프로젝트를 만들 준비가 되었습니다.
            `,
            tip: `💡 TIP: 이클립스가 열리면 기본 테마를 선택할 수도 있어요.`,
            img: "/images/learning/Eclipse5.png"
        }
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

    // UI 업데이트 함수
    function updateSlideUI() {

        slideImage.src = slideData[currentSlide].img;
        slideTitle.innerHTML = slideData[currentSlide].title;
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

    // 이전 이미지
    imgPrev.addEventListener("click", () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlideUI();
        }
    });

    // 다음 이미지
    imgNext.addEventListener("click", () => {
        if (currentSlide < slideData.length - 1) {
            currentSlide++;
            updateSlideUI();
        }
    });

    // 초기 실행
    updateSlideUI();
});
