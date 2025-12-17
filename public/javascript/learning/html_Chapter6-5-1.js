// 퀴즈 데이터 (문제 은행)
const quizData = [
    {
        question: "1. HTML 문서의 가장 큰 제목을 나타내는 태그는?",
        options: ["<head>", "<h1>", "<title>", "<p>"],
        answer: 1 // 인덱스 (<h1>)
    },
    {
        question: "2. 다음 중 이미지를 넣을 때 사용하는 속성은?",
        options: ["href", "src", "link", "img"],
        answer: 1 // (src)
    },
    {
        question: "3. 클릭하면 다른 페이지로 이동하는 태그는?",
        options: ["<a>", "<b>", "<i>", "<p>"],
        answer: 0 // (<a>)
    },
    {
        question: "4. 순서가 있는 목록을 만들 때 쓰는 태그는?",
        options: ["<ul>", "<dl>", "<ol>", "<li>"],
        answer: 2 // (<ol>)
    },
    {
        question: "5. 시맨틱 태그가 아닌 것은?",
        options: ["<header>", "<div>", "<nav>", "<footer>"],
        answer: 1 // (<div>)
    }
];

let currentQuestion = 0;
let score = 0;

// 페이지 로드 시 시작
document.addEventListener('DOMContentLoaded', function() {
    loadQuestion();
    
    // 모달 이벤트
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

function loadQuestion() {
    const qData = quizData[currentQuestion];
    
    // 진행도 업데이트
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = quizData.length;
    const progress = ((currentQuestion) / quizData.length) * 100;
    document.getElementById('quiz-progress').style.width = `${progress}%`;

    // 문제 표시
    document.getElementById('question-text').textContent = qData.question;
    
    // 보기 표시
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = ''; // 초기화

    qData.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsArea.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement) {
    const correctIndex = quizData[currentQuestion].answer;
    const buttons = document.querySelectorAll('.option-btn');

    // 모든 버튼 비활성화 (중복 클릭 방지)
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
        // 정답 버튼도 표시해주기
        buttons[correctIndex].classList.add('correct');
    }

    // 1초 뒤 다음 문제로
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }, 1000);
}

function showResult() {
    document.getElementById('quiz-box').classList.add('hidden');
    document.getElementById('result-box').classList.remove('hidden');
    document.getElementById('quiz-progress').style.width = '100%';

    const finalScore = score * 20; // 5문제 * 20점 = 100점
    document.getElementById('score-text').textContent = finalScore;

    const msg = document.getElementById('result-msg');
    const desc = document.getElementById('result-desc');

    if (finalScore === 100) {
        msg.textContent = "🏆 완벽해요!";
        desc.textContent = "HTML 마스터가 되셨군요! 대단합니다!";
    } else if (finalScore >= 60) {
        msg.textContent = "👏 잘했어요!";
        desc.textContent = "조금만 더 복습하면 100점 맞을 수 있어요!";
    } else {
        msg.textContent = "💪 힘내세요!";
        desc.textContent = "다시 한번 복습해보는 건 어떨까요?";
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('result-box').classList.add('hidden');
    document.getElementById('quiz-box').classList.remove('hidden');
    loadQuestion();
}

// --- 네비게이션 & 모달 ---
function goToPreviousPage() {
    window.location.href = "html_Chapter6-4-1.html"; // 이전 페이지
}

function goToNextPage() {
    alert("축하합니다! 모든 과정을 완료하고 홈으로 이동합니다.");
    window.location.href = "/";
}

function openQuestionBox() {
    document.getElementById('question-modal').classList.remove('hidden');
}

function closeQuestionBox() {
    document.getElementById('question-modal').classList.add('hidden');
}

function submitQuestion() {
    alert('질문이 전송되었습니다! 🚀');
    closeQuestionBox();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeQuestionBox();
});