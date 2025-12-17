// DOM 요소 캐싱
let ServiceDOM = {};

// 데이터 관리
const Data = {
    inquiryList: [],
    STORAGE_KEY: 'codingmonster_inquiries',
    EMAIL: 'codingmonster.official@gmail.com', // (참고: mailto:가 아닌 API 방식에서는 사용되지 않음)

    init() {
        this.load();
    },

    load() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.inquiryList = JSON.parse(saved);
        }
    },

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.inquiryList));
    },

    add(title, content) {
        const inquiry = {
            id: Date.now(),
            title,
            content,
            date: new Date().toLocaleString('ko-KR'),
            status: '접수 완료',
            answer: null
        };

        this.inquiryList.unshift(inquiry);
        this.save();
        return inquiry;
    },

    addAnswer(index, answerContent) {
        const inquiry = this.inquiryList[index];
        if (inquiry) {
            inquiry.answer = answerContent;
            inquiry.status = '답변 완료';
            this.save();
        }
    },

    get(index) {
        return this.inquiryList[index];
    },

    getAll() {
        return this.inquiryList;
    },

    async sendEmail(inquiry) {
        const url = '/api/email/send-inquiry';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inquiry),
            });

            if (response.ok) {
                console.log('백엔드: 이메일 전송 요청 성공');
            } else {
                console.error('백엔드: 이메일 전송 요청 실패', response.status);
            }
        } catch (error) {
            console.error('백엔드: 네트워크 오류 발생.', error);
        }
    }
};

// 뷰 관리
const View = {
    show(element, displayType = 'flex') {
        if (element) element.style.display = displayType;
    },

    hide(element) {
        if (element) element.style.display = 'none';
    },

    showOnly(elementToShow, elementList, displayType = 'flex') {
        elementList.forEach(el => this.hide(el));
        this.show(elementToShow, displayType);
    },

    toggle(element, displayType = 'block') {
        if (!element) return false;
        const isHidden = element.style.display === 'none' || element.style.display === '';
        element.style.display = isHidden ? displayType : 'none';
        return isHidden;
    },

    // Page Navigation
    pages: [],
    showMain() {
        this.showOnly(ServiceDOM.mainContent, this.pages);
    },
    showHistory() {
        this.showOnly(ServiceDOM.inquiryHistoryPage, this.pages);
    },
    showDetail() {
        this.showOnly(ServiceDOM.inquiryDetailPage, this.pages);
    },

    // Inquiry Views
    inquiryViews: [],
    showInquiryArea() {
        this.showOnly(ServiceDOM.inquiryArea, this.inquiryViews);
    },
    showInquiryForm() {
        this.showOnly(ServiceDOM.inquiryForm, this.inquiryViews);
    }
};

// UI 업데이트
const ServiceUI = {
    renderInquiryList() {
        if (!ServiceDOM.inquiryHistoryList) return;

        ServiceDOM.inquiryHistoryList.innerHTML = '';

        Data.getAll().forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid white; cursor: pointer;">${item.title}</td>
                <td style="padding: 10px; border-bottom: 1px solid white;">${item.date}</td>
                <td style="padding: 10px; border-bottom: 1px solid white;">${item.status}</td>
            `;
            row.onclick = () => ServiceActions.openInquiryDetail(index);
            ServiceDOM.inquiryHistoryList.appendChild(row);
        });
    },

    openInquiryDetail(index) {
        const inquiry = Data.get(index);
        if (!inquiry) return;

        ServiceDOM.detailTitle.innerText = inquiry.title;
        ServiceDOM.detailDate.innerText = inquiry.date;
        ServiceDOM.detailContent.innerText = inquiry.content;

        const answerContentEl = document.getElementById('answerContent');
        if (answerContentEl) {
            if (inquiry.answer) {
                answerContentEl.innerText = inquiry.answer;
            } else {
                answerContentEl.innerText = '답변 대기 중입니다.';
            }
        }

        View.showDetail();
    },

    clearInquiryForm() {
        if (ServiceDOM.inquiryTitle) ServiceDOM.inquiryTitle.value = '';
        if (ServiceDOM.inquiryContent) ServiceDOM.inquiryContent.value = '';
    },

    openSettingsModal() {
        View.show(ServiceDOM.settingsPage);
    },

    closeCustomerCenter() {
        View.hide(ServiceDOM.customerCenterModal);
    }
};

const ServiceActions = {
    openInquiryForm() {
        View.showInquiryForm();
    },

    async submitInquiry() {
        const title = ServiceDOM.inquiryTitle?.value.trim();
        const content = ServiceDOM.inquiryContent?.value.trim();

        if (!title || !content) {
            alert('문의 제목과 내용을 모두 입력해주세요.');
            return;
        }

        const newInquiry = Data.add(title, content);

        Data.sendEmail(newInquiry);

        alert('문의가 정상적으로 제출되었습니다.');
        ServiceUI.clearInquiryForm();
        View.showInquiryArea();
    },

    cancelInquiry() {
        if (confirm('작성을 취소하시겠습니까?')) {
            ServiceUI.clearInquiryForm();
            View.showInquiryArea();
        }
    },

    goInquiryHistory() {
        ServiceUI.renderInquiryList();
        View.showHistory();
    },

    backToMain() {
        View.showMain();
    },

    backToInquiryHistory() {
        View.showHistory();
    },

    openInquiryDetail(index) {
        ServiceUI.openInquiryDetail(index);
    },

    toggleAnswer(answerId) {
        const answer = document.getElementById(answerId);
        View.toggle(answer, 'block');
    },

    toggleFAQList() {
        const arrow = ServiceDOM.toggleFaqBtn?.querySelector('.arrow');
        const isNowVisible = View.toggle(ServiceDOM.faqList, 'flex');

        if (arrow) {
            arrow.classList.toggle('rotate', isNowVisible);
        }
    },

    openSettingsModal() {
        ServiceUI.openSettingsModal();
    },

    closeCustomerCenter() {
        ServiceUI.closeCustomerCenter();
    },

    handleChangePassword() {
    // 소셜 로그인 사용자 체크 (선택사항)
    ServiceDOM.passwordModal.style.display = 'flex';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordMessage').textContent = '';
},

async confirmChangePassword() {
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const messageEl = document.getElementById('passwordMessage');

    if (!currentPassword || !newPassword || !confirmPassword) {
        messageEl.textContent = '모든 필드를 입력해주세요.';
        messageEl.style.color = 'red';
        return;
    }

    if (newPassword !== confirmPassword) {
        messageEl.textContent = '새 비밀번호가 일치하지 않습니다.';
        messageEl.style.color = 'red';
        return;
    }

    if (newPassword.length < 8) {
        messageEl.textContent = '비밀번호는 8자 이상이어야 합니다.';
        messageEl.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            alert('비밀번호가 성공적으로 변경되었습니다.');
            ServiceDOM.passwordModal.style.display = 'none';
        } else {
            messageEl.textContent = data.message || '비밀번호 변경에 실패했습니다.';
            messageEl.style.color = 'red';
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        messageEl.textContent = '네트워크 오류가 발생했습니다.';
        messageEl.style.color = 'red';
    }
},

cancelChangePassword() {
    ServiceDOM.passwordModal.style.display = 'none';
},

    // 회원 탈퇴 모달
    async handleWithdraw() {
        // 모달 표시
        document.getElementById('withdrawModal').style.display = 'flex';
    },

    async confirmWithdraw() {
        // 모달 닫기
        document.getElementById('withdrawModal').style.display = 'none';

        try {
            const response = await fetch('/user/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });


            if (response.ok) {
                alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert('회원 탈퇴에 실패했습니다: ' + (errorData.message || '서버 오류'));
            }
        } catch (error) {
            console.error('회원 탈퇴 중 오류 발생:', error);
            alert('네트워크 오류로 회원 탈퇴에 실패했습니다.');
        }
    },

    cancelWithdraw() {
        document.getElementById('withdrawModal').style.display = 'none';
    }
};

// 이벤트 핸들러
const ServiceEvents = {
    init() {
        // 기본 버튼 이벤트
        ServiceDOM.openInquiryFormBtn?.addEventListener('click', ServiceActions.openInquiryForm);
        ServiceDOM.submitInquiryBtn?.addEventListener('click', ServiceActions.submitInquiry);
        ServiceDOM.cancelInquiryBtn?.addEventListener('click', ServiceActions.cancelInquiry);
        ServiceDOM.toggleFaqBtn?.addEventListener('click', ServiceActions.toggleFAQList);
        ServiceDOM.goInquiryHistoryBtn?.addEventListener('click', ServiceActions.goInquiryHistory);
        ServiceDOM.backToInquiryHistoryBtn?.addEventListener('click', ServiceActions.backToInquiryHistory);
        ServiceDOM.withdrawBtn?.addEventListener('click', ServiceActions.handleWithdraw);
        ServiceDOM.backToMainBtn?.addEventListener('click', ServiceActions.backToMain);
        ServiceDOM.changePasswordBtn?.addEventListener('click', ServiceActions.handleChangePassword);
ServiceDOM.confirmPasswordBtn?.addEventListener('click', ServiceActions.confirmChangePassword);
ServiceDOM.cancelPasswordBtn?.addEventListener('click', ServiceActions.cancelChangePassword);
        ServiceDOM.withdrawBtn?.addEventListener('click', ServiceActions.handleWithdraw);
        ServiceDOM.confirmWithdrawBtn?.addEventListener('click', ServiceActions.confirmWithdraw);
        ServiceDOM.cancelWithdrawBtn?.addEventListener('click', ServiceActions.cancelWithdraw);

        // 설정 버튼
        ServiceDOM.openSettingsButton?.addEventListener('click', ServiceActions.openSettingsModal);

        // FAQ 아이템 클릭 이벤트 (이벤트 위임)
        ServiceDOM.faqList?.addEventListener('click', (e) => {
            const faqItem = e.target.closest('.faq-item');
            if (faqItem) {
                const answerId = faqItem.dataset.answerId;
                if (answerId) ServiceActions.toggleAnswer(answerId);
            }
        });
    }
};

// 초기화
function initCustomerCenter() {

    Data.init(); // localStorage에서 데이터 로드

    // DOM 요소 초기화
    ServiceDOM = {
        // Pages
        mainContent: document.getElementById('mainContent'),
        inquiryHistoryPage: document.getElementById('inquiryHistoryPage'),
        inquiryDetailPage: document.getElementById('inquiryDetailPage'),
        settingsPage: document.getElementById('settingsPage'),

        // Inquiry Views
        inquiryArea: document.getElementById('inquiryArea'),
        inquiryForm: document.getElementById('inquiryForm'),

        // Form Elements
        inquiryTitle: document.getElementById('inquiryTitle'),
        inquiryContent: document.getElementById('inquiryContent'),

        // Lists
        inquiryHistoryList: document.getElementById('inquiryHistoryList'),
        faqList: document.getElementById('faqList'),

        // Detail
        detailTitle: document.getElementById('detailTitle'),
        detailDate: document.getElementById('detailDate'),
        detailContent: document.getElementById('detailContent'),

        // Buttons
        openInquiryFormBtn: document.getElementById('openInquiryFormBtn'),
        submitInquiryBtn: document.getElementById('submitInquiryBtn'),
        cancelInquiryBtn: document.getElementById('cancelInquiryBtn'),
        toggleFaqBtn: document.getElementById('toggleFaqBtn'),
        goInquiryHistoryBtn: document.getElementById('goInquiryHistoryBtn'),
        backToInquiryHistoryBtn: document.getElementById('backToInquiryHistoryBtn'),
        withdrawBtn: document.getElementById('withdrawBtn'),
        backToMainBtn: document.getElementById('backToMainBtn'),
        withdrawBtn: document.getElementById('withdrawBtn'),
        changePasswordBtn: document.getElementById('changePasswordBtn'),
        passwordModal: document.getElementById('passwordModal'),
        confirmPasswordBtn: document.getElementById('confirmPasswordBtn'),
        cancelPasswordBtn: document.getElementById('cancelPasswordBtn'),

        // Modals
        openSettingsButton: document.getElementById('openSettings'),
        customerCenterModal: document.querySelector('.settings-modal'),
        
        // 회원 탈퇴 모달
        withdrawModal: document.getElementById('withdrawModal'),
        confirmWithdrawBtn: document.getElementById('confirmWithdrawBtn'),
        cancelWithdrawBtn: document.getElementById('cancelWithdrawBtn'),

    };

    // View 배열 초기화
    View.pages = [ServiceDOM.mainContent, ServiceDOM.inquiryHistoryPage, ServiceDOM.inquiryDetailPage];
    View.inquiryViews = [ServiceDOM.inquiryArea, ServiceDOM.inquiryForm];

    ServiceEvents.init();
}

document.addEventListener('DOMContentLoaded', initCustomerCenter);