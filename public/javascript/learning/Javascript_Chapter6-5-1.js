/* 파일명: Javascript_Chapter6-5-1.js */

// 퀴즈 데이터
const quizData = [
    {
        question: "1. 변수를 만들 때 값을 바꿀 수 '없는' 키워드는?",
        options: ["var", "let", "const", "fix"],
        answer: 2 // 0부터 시작, const
    },
    {
        question: "2. 배열의 맨 뒤에 데이터를 추가하는 함수는?",
        options: ["pop()", "push()", "shift()", "add()"],
        answer: 1 // push()
    },
    {
        question: "3. 'click' 이벤트를 연결하는 올바른 방법은?",
        options: [
            "element.onclick('func')",
            "element.addEvent('click', func)",
            "element.addEventListener('click', func)",
            "element.event('click', func)"
        ],
        answer: 2 // addEventListener
    },
    {
        question: "4. HTML 요소를 CSS 선택자로 찾는 메서드는?",
        options: ["getElementById", "querySelector", "findTag", "selectOne"],
        answer: 1 // querySelector
    },
    {
        question: "5. 다음 중 '조건이 참일 때만' 실행하는 문법은?",
        options: ["for", "while", "if", "switch"],
        answer: 2 // if
    }
];

let score = 0;
let userAnswers = new Array(quizData.length).fill(null); // 사용자가 선택한 답

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter6-4-1.html"; // 이전 페이지
}

function finishCourse() {
    alert("축하합니다! 모든 코스를 완주하셨습니다! 🎉\n메인 화면으로 이동합니다.");
    window.location.href = "/"; // 처음으로
}

// 퀴즈 렌더링
function renderQuiz() {
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = '';

    quizData.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'quiz-item';
        
        // 질문
        const header = document.createElement('div');
        header.className = 'question-header';
        header.innerHTML = `<div class="q-num">Q${index + 1}</div><div class="q-text">${q.question}</div>`;
        item.appendChild(header);

        // 보기 (버튼)
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options-grid';

        q.options.forEach((opt, optIndex) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(index, optIndex, btn, item);
            optionsDiv.appendChild(btn);
        });

        item.appendChild(optionsDiv);

        // 피드백 메시지 영역
        const feedback = document.createElement('div');
        feedback.className = 'feedback-msg';
        feedback.id = `feedback-${index}`;
        item.appendChild(feedback);

        quizList.appendChild(item);
    });
}

// 정답 확인
function checkAnswer(qIndex, selectedOptIndex, btnElement, itemContainer) {
    // 이미 푼 문제는 클릭 방지
    if (userAnswers[qIndex] !== null) return;

    userAnswers[qIndex] = selectedOptIndex;
    const correctAns = quizData[qIndex].answer;
    const buttons = itemContainer.querySelectorAll('.option-btn');
    const feedback = document.getElementById(`feedback-${qIndex}`);

    // 버튼 스타일 변경
    if (selectedOptIndex === correctAns) {
        btnElement.classList.add('correct');
        feedback.textContent = "정답입니다! 🎉";
        feedback.classList.add('correct');
        score += 20; // 5문제니까 20점씩
    } else {
        btnElement.classList.add('wrong');
        feedback.textContent = `땡! 정답은 '${quizData[qIndex].options[correctAns]}' 입니다. 😢`;
        feedback.classList.add('wrong');
        // 정답 버튼도 표시해주기
        buttons[correctAns].classList.add('correct');
    }

    // 모든 버튼 비활성화
    buttons.forEach(b => b.disabled = true);

    // 모든 문제를 풀었는지 확인
    if (userAnswers.every(a => a !== null)) {
        showResult();
    }
}

// 결과 화면 표시
function showResult() {
    const resultScreen = document.getElementById('result-screen');
    const quizList = document.getElementById('quiz-list');
    const finalScore = document.getElementById('final-score');
    const resultMsg = document.getElementById('result-message');
    const resultDesc = document.getElementById('result-desc');

    // 퀴즈 목록 숨기고 결과 보여주기
    setTimeout(() => {
        quizList.style.display = 'none';
        resultScreen.classList.remove('hidden');
        
        // 점수 애니메이션
        let current = 0;
        const interval = setInterval(() => {
            if (current >= score) {
                clearInterval(interval);
                finalScore.textContent = score;
            } else {
                current++;
                finalScore.textContent = current;
            }
        }, 20);

        // 메시지 설정
        if (score === 100) {
            resultMsg.textContent = "완벽해요! 🏆";
            resultDesc.textContent = "자바스크립트 기초를 마스터하셨군요!";
        } else if (score >= 60) {
            resultMsg.textContent = "잘했어요! 👍";
            resultDesc.textContent = "조금만 더 복습하면 완벽해질 거예요.";
        } else {
            resultMsg.textContent = "아쉬워요! 😅";
            resultDesc.textContent = "다시 한번 복습하고 도전해볼까요?";
        }
    }, 1000);
}

// --- 공통 기능 ---
function openQuestionBox() {
    document.getElementById('question-modal').classList.remove('hidden');
}

function closeQuestionBox() {
    document.getElementById('question-modal').classList.add('hidden');
}

function submitQuestion() {
    alert('질문이 전송되었습니다.');
    closeQuestionBox();
}

document.addEventListener('DOMContentLoaded', function() {
    renderQuiz(); // 퀴즈 생성

    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQuestionBox();
});