let currentPage = 1;
        const totalPages = 4;

        function updatePage() {
            // 모든 페이지 숨기기
            document.querySelectorAll('.story-page').forEach(page => {
                page.classList.remove('active');
            });

            // 현재 페이지 보이기
            document.querySelector(`[data-page="${currentPage}"]`).classList.add('active');

            // 인디케이터 업데이트
            document.querySelectorAll('.indicator-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index + 1 === currentPage);
            });

            // 이전 버튼 상태
            document.getElementById('prevBtn').disabled = currentPage === 1;

            // 다음/완료 버튼 텍스트
            const nextBtn = document.getElementById('nextBtn');
            if (currentPage === totalPages) {
                nextBtn.textContent = '완료';
            } else {
                nextBtn.textContent = '다음';
            }
        }

        function nextPage() {
            if (currentPage < totalPages) {
                currentPage++;
                updatePage();
            } else {
                closeModal();
            }
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                updatePage();
            }
        }

        function closeModal() {
            const modal = document.getElementById('prologueModal');
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                // 실제로는 localStorage에 저장하여 다시 안 보이게 처리
                localStorage.setItem('prologueShown', 'true');
            }, 300);
        }

        // 페이드아웃 애니메이션 추가
        const style = document.createElement('style'); 
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // 키보드 이벤트 (화살표 키로 페이지 이동)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
            if (e.key === 'Escape') closeModal();
        });
