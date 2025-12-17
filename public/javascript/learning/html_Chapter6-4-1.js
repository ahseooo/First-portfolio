// 시간표 기본 예제 코드
const defaultCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; text-align: center; }
    h1 { color: #333; }
    table { 
      width: 100%; max-width: 500px; margin: 0 auto;
      border-collapse: collapse; 
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    th, td { 
      border: 1px solid #ddd; padding: 10px; text-align: center;
    }
    th { background-color: #4CAF50; color: white; }
    td { background-color: white; }
    .break { background-color: #f0f0f0; font-weight: bold; color: #555; }
  </style>
</head>
<body>

  <h1>🏫 이번 학기 시간표</h1>
  
  <table>
    <thead>
      <tr>
        <th>교시</th>
        <th>월</th>
        <th>화</th>
        <th>수</th>
        <th>목</th>
        <th>금</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1교시</td>
        <td>국어</td>
        <td>수학</td>
        <td>영어</td>
        <td>과학</td>
        <td>체육</td>
      </tr>
      <tr>
        <td>2교시</td>
        <td>수학</td>
        <td>영어</td>
        <td>과학</td>
        <td>사회</td>
        <td>미술</td>
      </tr>
      <tr>
        <td colspan="6" class="break">🍱 점심 시간 🍱</td>
      </tr>
      <tr>
        <td>3교시</td>
        <td>영어</td>
        <td>과학</td>
        <td>체육</td>
        <td>국어</td>
        <td>음악</td>
      </tr>
    </tbody>
  </table>

</body>
</html>`;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const codeArea = document.getElementById('code');
    
    if (codeArea && codeArea.value.trim() === '') {
        codeArea.value = defaultCode;
    }
    
    runCode();

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
    window.location.href = "html_Chapter6-3-1.html"; // 이전 프로젝트
}

function goToNextPage() {
    window.location.href = "html_Chapter6-5-1.html"; // 다음 페이지 (퀴즈 등)
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