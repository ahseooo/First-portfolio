document.addEventListener("DOMContentLoaded", () => {

    // 페이지 이동
    document.getElementById("pagePrev").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-4-3.html";
    });

    document.getElementById("pageNext").addEventListener("click", () => {
        window.location.href = "Java_Chapter1-5-1.html";
    });

    const slideData = [
        {
            title: "1. 새 프로젝트 만들기",
            info: `
                File → New → Java Project
            `,
            tip: `💡 TIP: 단축키 Ctrl+N (또는 Cmd+N)을 누르면 더 빠르게 새 프로젝트를 만들 수 있어요!`,
            img: "/images/learning/Eclipse7.png"
        },
        {
            title: "2. 프로젝트 설정하기",
            info: `
                Project name: HelloWorld<br>
                JRE 설정: 'Use default JRE' 선택
            `,
            tip: `💡 TIP: 프로젝트 이름은 영문으로 시작하고, 공백 없이 작성하는 것이 좋아요. JRE는 기본값을 사용하면 됩니다!`,
            img: "/images/learning/Eclipse8.png"
        },
        {
            title: "3. 클래스 만들기",
            info: `
                프로젝트 우클릭 → New → Class<br>
                ✅ public static void main 체크!
            `,
            tip: `💡 TIP: 'public static void main' 옵션을 체크하면 프로그램 시작점인 main 메서드가 자동으로 생성됩니다. 이것은 반드시 필요해요!`,
            img: "/images/learning/Eclipse9.png"
        },
        {
            title: "4. 코드 작성하기",
            info: `
                main 메서드 안에 다음 코드를 작성하세요:
            `,
            tip: `💡 TIP: 'sysout'을 입력하고 Ctrl + Space를 누르면 System.out.println()이 자동 완성됩니다!<br>
            코드 작성 후 Ctrl + S로 저장하는 것도 잊지 마세요.`,
            img: "/images/learning/Eclipse10.png"
        },
        {
            title: "5. 프로그램 실행하기",
            info: `
                방법 1: 단축키 사용<br>
                실행 단축키:<br>
                Ctrl + F11<br>
                방법 2: 상단 툴바의 ▶️ 버튼 클릭
            `,
            tip: `💡 TIP: Hello, World가 출력되면 성공!`,
            img: "/images/learning/Eclipse11.png"
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
