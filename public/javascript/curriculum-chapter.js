// 1. 커리큘럼 데이터 정의 (JSON)
// 나중에 DB에서 받아오거나 별도 js 파일로 분리하면 관리가 훨씬 쉽습니다.
const curriculumData = {
    "JAVA": [
        {
            title: "자바의 시작",
            subchapters: [
                { name: "1. 자바(JAVA)란?", link: "/public-learning/Java_Chapter1-1.html" },
                { name: "2. 자바의 특징", link: "/public-learning/Java_Chapter1-2-1.html" },
                { name: "3. JDK 설치하기", link: "/public-learning/Java_Chapter1-3-1.html" },
                { name: "4. 이클립스 설치하기", link: "/public-learning/Java_Chapter1-4-1.html" },
                { name: "5. 에러와 해결 방법", link: "/public-learning/Java_Chapter1-5-1.html" }
            ]
        },
        {
            title: "자바 기초 문법",
            subchapters: [
                { name: "1. 자바 프로그램의 기본 구조", link: "#" },
                { name: "2. 변수와 자료형", link: "#" },
                { name: "3. 연산자", link: "#" },
                { name: "4. 조건문", link: "#" },
                { name: "5. 반복문", link: "#" }
            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [

            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [

            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [

            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [

            ]
        },
        // ... Chapter 3~6 데이터 추가
    ],
    "PYTHON": [
        {
            title: "파이썬의 시작",
            subchapters: [
                { name: "1. 파이썬이란?", link: "/public-learning/Python_Chapter1-1.html" },
                { name: "2. 파이썬의 특징", link: "/public-learning/Python_Chapter1-2-1.html" },
                { name: "3. 파이썬 인터프리터 설치하기", link: "/public-learning/Python_Chapter1-3-1.html" },
                { name: "PyCharm 설치하기 (선택)", link: "/public-learning/Python_Chapter1-4-1.html" },
                { name: "자주 발생하는 에러와 해결 방법", link: "/public-learning/Python_Chapter1-5-1.html" }
            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [
            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [
            ]
        },
        {
            title: "업데이트 예정",
            subchapters: [
            ]
        }

        // ... 파이썬 챕터 데이터 추가
    ],
    "JAVASCRIPT": [
        {
            title: "자바스크립트의 시작",
            subchapters: [
                { name: "1. 자바스크립트란? (역할과 특징)", link: "/public-learning/Javascript_Chapter1-1.html" },
                { name: "2. 변수와 상수 (let, const)", link: "/public-learning/Javascript_Chapter1-2-1.html" },
                { name: "3. 데이터 타입 (문자, 숫자, 불리언)", link: "/public-learning/Javascript_Chapter1-3-1.html" },
                { name: "4. 연산자 (산술, 비교, 논리)", link: "/public-learning/Javascript_Chapter1-4-1.html" }
            ]
        },
        {
            title: "자바스크립트 제어문과 함수",
            subchapters: [
                { name: "1. 조건문 (if, else, switch)", link: "/public-learning/Javascript_Chapter2-1.html" },
                { name: "2. 반복문 (for, while)", link: "/public-learning/Javascript_Chapter2-2-1.html" },
                { name: "3. 함수 기초 (function)", link: "/public-learning/Javascript_Chapter2-3-1.html" },
                { name: "4. 화살표 함수와 스코프", link: "/public-learning/Javascript_Chapter2-4-1.html" }
            ]
        },
        {
            title: "객체와 배열",
            subchapters: [
                { name: "1. 배열 (Array) 다루기", link: "/public-learning/Javascript_Chapter3-1.html" },
                { name: "2. 객체 (Object) 이해하기", link: "/public-learning/Javascript_Chapter3-2-1.html" },
                { name: "3. 배열과 객체 함께 쓰기 (JSON 기초)", link: "/public-learning/Javascript_Chapter3-3-1.html" },
                { name: "4. 배열 조작하기 (push, pop, forEach)", link: "/public-learning/Javascript_Chapter3-4-1.html" },
                { name: "5. 문자열과 배열 함수 총정리", link: "/public-learning/Javascript_Chapter3-5-1.html" }
            ]
        },
        {
            title: "객체 메서드와 DOM",
            subchapters: [
                { name: "1. 객체 생성과 접근", link: "/public-learning/Javascript_Chapter4-1.html" },
                { name: "2. 객체 메서드 (this 키워드)", link: "/public-learning/Javascript_Chapter4-2-1.html" },
                { name: "3. DOM (Document Object Model)의 이해", link: "/public-learning/Javascript_Chapter4-3-1.html" },
                { name: "4. HTML 요소 선택과 조작", link: "/public-learning/Javascript_Chapter4-4-1.html" },
                { name: "5. 이벤트 처리 (버튼 클릭 등)", link: "/public-learning/Javascript_Chapter4-5-1.html" }
            ]
        },
        {
            title: "자바스크립트 고급 기능",
            subchapters: [
                { name: "1. 브라우저 이벤트 (onClick, onChange 등)", link: "/public-learning/Javascript_Chapter5-1.html" },
                { name: "2. JSON과 데이터 구조", link: "/public-learning/Javascript_Chapter5-2-1.html" },
                { name: "3. 조건부 렌더링 (화면 제어)", link: "/public-learning/Javascript_Chapter5-3-1.html" },
                { name: "4. 로컬 스토리지 (localStorage)", link: "/public-learning/Javascript_Chapter5-4-1.html" },
                { name: "5. 시간 다루기 (setTimeout, setInterval)", link: "/public-learning/Javascript_Chapter5-5-1.html" }
            ]
        },
        {
            title: "미니 프로젝트 & 퀴즈",
            subchapters: [
                { name: "1. 미니 프로젝트: 주사위 게임", link: "/public-learning/Javascript_Chapter6-1.html" },
                { name: "2. 미니 프로젝트: 숫자 순서 맞추기", link: "/public-learning/Javascript_Chapter6-2-1.html" },
                { name: "3. 미니 프로젝트: 랜덤 이름 추첨기", link: "/public-learning/Javascript_Chapter6-3-1.html" },
                { name: "4. 미니 프로젝트: To-Do 리스트", link: "/public-learning/Javascript_Chapter6-4-1.html" },
                { name: "5. 최종 퀴즈 (Final Quiz)", link: "/public-learning/Javascript_Chapter6-5-1.html" }
            ]
        }
    ],
    "HTML": [
        {
            title: "HTML의 시작",
            subchapters: [
                { name: "1. HTML이란?", link: "/public-learning/html_Chapter1-1.html" },
                { name: "2. HTML 특징", link: "/public-learning/html_Chapter1-2-1.html" },
                { name: "3. VS Code 설치하기", link: "/public-learning/html_Chapter1-3-1.html" },
                { name: "4. Live Server 플러그인 설치", link: "/public-learning/html_Chapter1-4-1.html" },
                { name: "5. 첫 번째 HTML 파일 만들기", link: "/public-learning/html_Chapter1-5-1.html" },
                { name: "6. 자주 발생하는 에러와 해결 방법", link: "/public-learning/html_Chapter1-6-1.html" },
            ]
        },
        {
            title: "HTML 문서 구조",
            subchapters: [
                { name: "1. HTML 문서의 기본 구조 (html, head, body)", link: "/public-learning/html_Chapter2-1.html" },
                { name: "2. 제목(Heading)과 문단(Paragraph)", link: "/public-learning/html_Chapter2-2-1.html" },
                { name: "3. 줄바꿈, 수평선, 그리고 주석", link: "/public-learning/html_Chapter2-3-1.html" },
                { name: "4. 특수문자, 들여쓰기, 텍스트 정렬", link: "/public-learning/html_Chapter2-4-1.html" }
            ]
        },
        {
            title: "HTML 텍스트와 멀티미디어",
            subchapters: [
                { name: "1. 글자 꾸미기 (굵게, 밑줄, 색상)", link: "/public-learning/html_Chapter3-1.html" },
                { name: "2. 하이퍼링크 (a 태그, 새 탭 열기)", link: "/public-learning/html_Chapter3-2-1.html" },
                { name: "3. 이미지 넣기 (img 태그, 속성)", link: "/public-learning/html_Chapter3-3-1.html" },
                { name: "4. 목록 만들기 (순서 있는/없는 목록)", link: "/public-learning/html_Chapter3-4-1.html" },
                { name: "5. 파일 경로 이해하기 (상대/절대 경로)", link: "/public-learning/html_Chapter3-5-1.html" }
            ]
        },
        {
            title: "HTML 표와 폼",
            subchapters: [
                { name: "1. 표 만들기 (table, tr, td, th)", link: "/public-learning/html_Chapter4-1.html" },
                { name: "2. 셀 병합하기 (colspan, rowspan)", link: "/public-learning/html_Chapter4-2-1.html" },
                { name: "3. 폼 만들기 (form 태그 구조)", link: "/public-learning/html_Chapter4-3-1.html" },
                { name: "4. 다양한 입력 요소 (input, textarea, select)", link: "/public-learning/html_Chapter4-4-1.html" },
                { name: "5. 체크박스와 라디오 버튼 실습", link: "/public-learning/html_Chapter4-5-1.html" }
            ]
        },
        {
            title: "HTML 시맨틱과 웹 접근성",
            subchapters: [
                { name: "1. 시맨틱 태그 (header, nav, main, footer)", link: "/public-learning/html_Chapter5-1.html" },
                { name: "2. div vs 시맨틱 태그 비교", link: "/public-learning/html_Chapter5-2-1.html" },
                { name: "3. 간단한 레이아웃 잡기 (실습)", link: "/public-learning/html_Chapter5-3-1.html" },
                { name: "4. 멀티미디어 삽입 (iframe, audio, video)", link: "/public-learning/html_Chapter5-4-1.html" },
                { name: "5. 웹 접근성 기초 (alt, label, 제목 구조)", link: "/public-learning/html_Chapter5-5-1.html" }
            ]
        },
        {
            title: "HTML 미니 프로젝트 & 퀴즈",
            subchapters: [
                { name: "1. 미니 프로젝트 1: 나만의 프로필 만들기", link: "/public-learning/html_Chapter6-1.html" },
                { name: "2. 미니 프로젝트 2: 일기장 만들기", link: "/public-learning/html_Chapter6-2-1.html" },
                { name: "3. 미니 프로젝트 3: 설문조사 만들기", link: "/public-learning/html_Chapter6-3-1.html" },
                { name: "4. 미니 프로젝트 4: 시간표 만들기", link: "/public-learning/html_Chapter6-4-1.html" },
                { name: "5. 최종 실력 점검 퀴즈", link: "/public-learning/html_Chapter6-5-1.html" }
            ]
        }
    ],
};

// 2. 렌더링 함수
function renderCurriculum() {
    const tabContainer = document.getElementById('curriculum-tabs');
    const contentContainer = document.getElementById('curriculum-content');

    if (!tabContainer || !contentContainer) return; // 에러 방지

    tabContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    const languages = Object.keys(curriculumData);

    languages.forEach((lang, index) => {
        // 2-1. 언어 탭 버튼 생성
        const btn = document.createElement('button');
        btn.innerText = lang;
        if (index === 0) btn.classList.add('active');
        btn.onclick = () => showChapters(lang);
        tabContainer.appendChild(btn);

        // 2-2. 챕터 그룹 컨테이너 생성
        const groupDiv = document.createElement('div');
        groupDiv.className = 'chapter-group';
        groupDiv.dataset.tab = lang;
        groupDiv.style.display = index === 0 ? 'block' : 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'chapter-wrapper';

        const chapterList = document.createElement('div');
        chapterList.className = 'chapter-list';

        const subchapterList = document.createElement('div');
        subchapterList.className = 'subchapter-list';

        const chapters = curriculumData[lang];

        // 2-3. 챕터 및 서브챕터 생성
        if (chapters.length === 0) {
            chapterList.innerHTML = "<p style='padding:15px; color:#999;'>업데이트 예정인 과정입니다.</p>";
        } else {
            chapters.forEach((chapter, chIdx) => {
                const chId = `${lang.toLowerCase()}-ch${chIdx + 1}`;

                // [Chapter 버튼]
                const chBtn = document.createElement('button');
                chBtn.className = `chapter ${chIdx === 0 ? 'active' : ''}`;
                chBtn.innerText = `Chapter ${chIdx + 1}`;
                
                // ★ 수정됨: 클릭된 버튼 자신(this)을 전달
                chBtn.onclick = function() { toggleSubChapters(chId, this); };
                
                chapterList.appendChild(chBtn);

                // [Subchapter 목록]
                const subDiv = document.createElement('div');
                subDiv.className = `subchapters ${chIdx === 0 ? 'active' : ''}`;
                subDiv.id = chId;

                // 타이틀
                const title = document.createElement('h4');
                title.className = 'chapter-title';
                title.innerText = chapter.title; // 대괄호 제거하고 깔끔하게
                subDiv.appendChild(title);

                // 상세 링크들
                chapter.subchapters.forEach(sub => {
                    const link = document.createElement('a');
                    link.href = sub.link || "#";
                    link.className = 'subchapter-link'; // 스타일링을 위해 클래스 추가

                    const subBtn = document.createElement('button');
                    subBtn.className = 'subchapter';
                    subBtn.innerText = sub.name;

                    link.appendChild(subBtn);
                    subDiv.appendChild(link);
                });

                subchapterList.appendChild(subDiv);
            });
        }

        wrapper.appendChild(chapterList);
        wrapper.appendChild(subchapterList);
        groupDiv.appendChild(wrapper);
        contentContainer.appendChild(groupDiv);
    });
}

// 3. 언어 탭 전환 함수
function showChapters(langName) {
    // 탭 버튼 스타일 업데이트
    const tabs = document.querySelectorAll('#curriculum-tabs button');
    tabs.forEach(btn => {
        if (btn.innerText === langName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 컨텐츠 표시 업데이트
    const groups = document.querySelectorAll('.chapter-group');
    groups.forEach(group => {
        if (group.dataset.tab === langName) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}

// 4. 챕터 토글 함수 (수정됨)
function toggleSubChapters(targetId, btnElement) {
    const targetSub = document.getElementById(targetId);
    if (!targetSub) return;

    // 해당 그룹 찾기 (현재 활성화된 언어 탭 내부)
    const parentGroup = targetSub.closest('.chapter-group');

    // 1. 모든 서브챕터와 챕터 버튼 초기화
    parentGroup.querySelectorAll('.subchapters').forEach(el => el.classList.remove('active'));
    parentGroup.querySelectorAll('.chapter').forEach(el => el.classList.remove('active'));

    // 2. 타겟 서브챕터 보이기
    targetSub.classList.add('active');

    // 3. 클릭된 챕터 버튼 활성화 (★ 추가된 부분)
    if (btnElement) {
        btnElement.classList.add('active');
    }
}

// 초기화 실행
document.addEventListener('DOMContentLoaded', renderCurriculum);