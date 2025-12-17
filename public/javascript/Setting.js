// DOM 요소
let DOM = {};

// UI 피드백
const UI = {
    showFeedback(button, icon, text, bgColor, textColor = 'white', duration = 2000) {
        const originalHTML = button.innerHTML;
        const originalBg = button.style.background;
        const originalColor = button.style.color;
        
        button.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${text}</span>`;
        button.style.background = bgColor;
        if (textColor !== 'white') button.style.color = textColor;
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = originalBg;
            button.style.color = originalColor;
        }, duration);
    },
    
    showSaveSuccess() {
        this.showFeedback(
            DOM.saveBtn,
            'check',
            '저장 완료!',
            'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        );
    },
    
    showCancelSuccess() {
        this.showFeedback(
            DOM.cancelBtn,
            'rotate-left',
            '초기화 완료!',
            '#fee',
            '#c00',
            1500
        );
    }
};

// 모달 관리
const Modal = {
    open() {
        DOM.serviceModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        DOM.serviceModal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// 이벤트 및 초기화
const App = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadSettings();
    },

    cacheDOM() {
        DOM = {
            themeRadios: document.querySelectorAll('input[name="theme"]'),
            saveBtn: document.getElementById('saveBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            goToServiceBtn: document.getElementById('goToService'),
            serviceModal: document.getElementById('serviceModal'),
            closeServiceBtn: document.getElementById('closeServiceBtn')
        };
    },

    loadSettings() {
        // 1. ThemeLoader를 통해 현재 테마 적용
        if (typeof ThemeLoader !== 'undefined') {
            ThemeLoader.init();
            
            // 2. 라디오 버튼 상태 동기화
            const savedTheme = localStorage.getItem('theme');
            const targetRadio = document.getElementById(savedTheme);
            if (targetRadio) targetRadio.checked = true;
        } else {
            console.error("ThemeLoader.js가 로드되지 않았습니다.");
        }
    },

    bindEvents() {
        // 테마 라디오 버튼 변경 시 실시간 미리보기
        if (DOM.themeRadios) {
            DOM.themeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (typeof ThemeLoader !== 'undefined') {
                        ThemeLoader.applyTheme(e.target.id);
                    }
                });
            });
        }

        // 저장 버튼
        DOM.saveBtn?.addEventListener('click', () => {
            // 현재 선택된 라디오 버튼 찾기
            const selectedTheme = document.querySelector('input[name="theme"]:checked')?.id;
            if (selectedTheme) {
                localStorage.setItem('theme', selectedTheme);
                UI.showSaveSuccess();
            }
        });

        // 취소 버튼 (저장된 상태로 되돌리기)
        DOM.cancelBtn?.addEventListener('click', () => {
            if (typeof ThemeLoader !== 'undefined') {
                ThemeLoader.init(); // 저장된 값으로 복구
                
                // 라디오 버튼도 되돌리기
                const savedTheme = localStorage.getItem('theme');
                const targetRadio = document.getElementById(savedTheme);
                if (targetRadio) targetRadio.checked = true;
                
                UI.showCancelSuccess();
            }
        });

        // 모달 이벤트들
        DOM.goToServiceBtn?.addEventListener('click', Modal.open);
        DOM.closeServiceBtn?.addEventListener('click', Modal.close);
        DOM.serviceModal?.addEventListener('click', (e) => {
            if (e.target === DOM.serviceModal) Modal.close();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});