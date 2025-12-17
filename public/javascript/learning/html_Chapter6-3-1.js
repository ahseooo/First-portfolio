// 설문조사 기본 예제 코드
const defaultCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; background-color: #f0f8ff; }
    h1 { color: #007bff; text-align: center; }
    .form-box { 
      background: white; padding: 25px; border-radius: 15px; 
      max-width: 400px; margin: 0 auto;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    label { display: block; margin-top: 10px; font-weight: bold; }
    input[type="text"], input[type="number"] { 
      width: 100%; padding: 8px; margin-top: 5px; 
      border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box;
    }
    button { 
      width: 100%; margin-top: 20px; padding: 10px; 
      background: #007bff; color: white; border: none; 
      border-radius: 5px; font-size: 16px; cursor: pointer;
    }
    button:hover { background: #0056b3; }
  </style>
</head>
<body>

  <div class="form-box">
    <h1>📋 학생 설문조사</h1>
    
    <label>이름</label>
    <input type="text" placeholder="이름을 입력하세요">
    
    <label>학년</label>
    <input type="number" placeholder="숫자만 입력">
    
    <label>좋아하는 과목 (체크)</label>
    <input type="checkbox"> 국어
    <input type="checkbox"> 수학
    <input type="checkbox"> 체육
    
    <label>점심 메뉴 (택1)</label>
    <input type="radio" name="lunch"> 급식
    <input type="radio" name="lunch"> 도시락
    
    <button onclick="alert('제출되었습니다!')">제출하기</button>
  </div>

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
    window.location.href = "html_Chapter6-2-1.html"; // 이전 프로젝트
}

function goToNextPage() {
    window.location.href = "html_Chapter6-4-1.html"; // 다음 페이지 (퀴즈)
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