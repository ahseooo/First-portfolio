/* 파일명: Javascript_Chapter5-4-1.js */

function goToPreviousPage() {
    window.location.href = "Javascript_Chapter5-3-1.html"; // 이전 페이지 (조건부 렌더링)
}

function goToNextPage() {
    // 챕터 5 완료 -> 다음 챕터 (예: Chapter 6 마무리)
    window.location.href = "Javascript_Chapter5-5-1.html"; 
}

// --- 로컬 스토리지 데모 기능 ---
function saveData() {
    const key = document.getElementById('storageKey').value;
    const value = document.getElementById('storageValue').value;
    const resultArea = document.getElementById('resultArea');

    if (key && value) {
        localStorage.setItem(key, value);
        resultArea.textContent = `✅ 저장 완료! (${key}: ${value})`;
        resultArea.style.color = "green";
    } else {
        alert("이름(Key)과 값(Value)을 모두 입력해주세요!");
    }
}

function loadData() {
    const key = document.getElementById('storageKey').value;
    const resultArea = document.getElementById('resultArea');

    if (key) {
        const value = localStorage.getItem(key);
        if (value) {
            resultArea.textContent = `📂 불러온 값: ${value}`;
            resultArea.style.color = "blue";
        } else {
            resultArea.textContent = "❌ 해당 이름으로 저장된 값이 없어요.";
            resultArea.style.color = "red";
        }
    } else {
        alert("불러올 이름(Key)을 입력해주세요!");
    }
}

function clearData() {
    localStorage.clear();
    const resultArea = document.getElementById('resultArea');
    resultArea.textContent = "🗑️ 모든 데이터가 삭제되었습니다.";
    resultArea.style.color = "orange";
    
    document.getElementById('storageKey').value = "";
    document.getElementById('storageValue').value = "";
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