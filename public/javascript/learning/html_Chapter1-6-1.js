// 이미지 모달 관련 JavaScript
function openImageModal(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    if (modal && modalImg) {
        modal.classList.remove('hidden');
        modalImg.src = imageSrc;
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.id === 'modal-image') {
                closeImageModal();
            }
        });
    }

    // 모든 이미지에 클릭 이벤트 추가
    const images = document.querySelectorAll('.left-img, .ex-img, .ri-img, .le-img');
    images.forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            openImageModal(this.src);
        });
    });
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    }
});

const questionBtn = document.querySelector('.question-button');
const modal = document.getElementById('question-modal');

questionBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
});

function closeQuestionBox() {
    modal.classList.add('hidden');
}

function submitQuestion() {
    const text = modal.querySelector('textarea').value.trim();
    if (text === '') {
        alert('질문 내용을 입력해주세요.');
        return;
    }

    alert('질문이 제출되었습니다: \n' + text);
    modal.querySelector('textarea').value = '';
    closeQuestionBox();
}
const prevBtn = document.querySelector(".prev-btn");
if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        window.location.href = "html_Chapter1-5-1.html";
    });
}

const nextBtn = document.querySelector(".next-btn");
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        alert("축하합니다! HTML 챕터 1을 모두 완료했어요! 🎉\n다음 챕터로 이동합니다.");
        window.location.href = "html_Chapter2-1-1.html";
    });
}