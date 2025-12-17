// 기본 예제 코드 (초기화용)
const defaultCode = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { color: #667eea; }
    .box { background: #f0f0f0; padding: 15px; border-radius: 10px; }
  </style>
</head>
<body>

  <h1>🧑‍💻 나의 프로필</h1>
  
  <div class="box">
    <h3>이름: 홍길동</h3>
    <p>안녕하세요! 저는 코딩을 배우고 있어요.</p>
    
    <h4>취미</h4>
    <ul>
      <li>게임하기 🎮</li>
      <li>유튜브 보기 📺</li>
    </ul>
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
    
    // iframe 내부의 document 객체 가져오기
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    // iframe 내용 갱신
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
    // 챕터 5의 마지막 페이지로 이동 (또는 챕터 5 목차)
    window.location.href = "html_Chapter5-5-1.html"; 
}

function goToNextPage() {
    window.location.href = "html_Chapter6-2-1.html"; // 다음 페이지 (퀴즈)
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