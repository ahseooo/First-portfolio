// 일기장 기본 예제 코드
const defaultCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: 'Gowun Dodum', sans-serif; 
      padding: 20px; 
      background-color: #fdf6e3; /* 아이보리 배경 */
    }
    .diary-container {
      background: white;
      padding: 30px;
      border: 3px dashed #d2b48c; /* 점선 테두리 */
      border-radius: 20px;
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 5px 5px 15px rgba(0,0,0,0.1);
    }
    h1 { color: #8b4513; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .date { color: #888; text-align: right; font-size: 14px; }
    .mood { font-size: 20px; text-align: center; margin: 10px 0; }
    .content { line-height: 1.8; color: #333; }
    .highlight { background: linear-gradient(to top, #ffeeba 50%, transparent 50%); }
  </style>
</head>
<body>

  <div class="diary-container">
    <p class="date">2024년 5월 20일 맑음 ☀️</p>
    <h1>🌱 오늘의 일기</h1>
    
    <div class="mood">
      오늘의 기분: <strong>최고! 🥰</strong>
    </div>
    
    <hr>

    <div class="content">
      <p>오늘은 <span class="highlight">나만의 웹페이지</span>를 만드는 방법을 배웠다.</p>
      <p>처음에는 코드가 복잡해 보였지만, 하나씩 따라 하니까 정말 신기했다!</p>
      <p>앞으로 더 멋진 사이트를 만들어서 친구들에게 자랑해야지.</p>
    </div>
  </div>

</body>
</html>`;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const codeArea = document.getElementById('code');
    
    // 1. 에디터가 비어있으면 기본 코드 채우기
    if (codeArea && codeArea.value.trim() === '') {
        codeArea.value = defaultCode;
    }
    
    // 2. 초기 코드 자동 실행
    runCode();

    // 3. 모달 닫기 이벤트
    const qModal = document.getElementById('question-modal');
    if (qModal) {
        qModal.addEventListener('click', function(e) {
            if (e.target === this) closeQuestionBox();
        });
    }
});

// 코드 실행 함수
function runCode() {
    const code = document.getElementById("code").value;
    const iframe = document.getElementById("result");
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    doc.open();
    doc.write(code);
    doc.close();
}

// 코드 초기화 함수
function resetCode() {
    if(confirm("작성한 코드가 사라집니다. 초기화할까요?")) {
        document.getElementById("code").value = defaultCode;
        runCode();
    }
}

// --- 네비게이션 & 모달 ---
function goToPreviousPage() {
    window.location.href = "html_Chapter6-1-1.html"; // 이전 프로젝트
}

function goToNextPage() {
    window.location.href = "html_Chapter6-3-1.html"; // 다음 페이지 (퀴즈)
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