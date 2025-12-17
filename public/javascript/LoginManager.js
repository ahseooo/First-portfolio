const LoginManager = {
    LOGIN_TYPES: {
        GENERAL: 'general',
        NAVER: 'naver',
        KAKAO: 'kakao',
        GOOGLE: 'google'
    },

    resetEmail: null,
    timerInterval: null,
    isNicknameAvailable: false,

    // 비밀번호 찾기 알림
    showMessage(text, title = '알림') {
        const modal = document.getElementById('messageModal');
        if (modal) {
            document.getElementById('messageTitle').textContent = title;
            document.getElementById('messageContent').textContent = text;
            modal.style.display = 'flex';
        } else {
            alert(text); // 모달이 없을 경우 fallback
        }
    },

    closeMessageModal() {
        const modal = document.getElementById('messageModal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    },

    // [비밀번호 찾기] 모달 내부 인라인 메시지 표시
    showResetMessage(text, type) {
        const messageEl = document.getElementById('resetMessage');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.className = `reset-message ${type}`; // success or error
            messageEl.style.display = 'block';
        }
    },

    // [비밀번호 찾기] 모달 열기
    showPasswordResetModal() {
        this.resetEmail = null;
        const modal = document.getElementById('passwordResetModal');
        modal.style.display = 'flex';
        this.goToStep(1); // 1단계부터 시작
        
        // 입력창 초기화
        document.getElementById('resetEmail').value = '';
        document.getElementById('verifyCode').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        const msgEl = document.getElementById('resetMessage');
        if(msgEl) msgEl.style.display = 'none';
    },

    // [비밀번호 찾기] 모달 닫기
    closePasswordResetModal() {
        document.getElementById('passwordResetModal').style.display = 'none';
        if (this.timerInterval) clearInterval(this.timerInterval);
    },

    // [비밀번호 찾기] 단계 이동 함수
    goToStep(step) {
        // 모든 스텝 숨기기
        document.querySelectorAll('.reset-step').forEach(el => el.classList.remove('active'));
        // 해당 스텝 보이기
        const target = document.getElementById(`step${step}`);
        if(target) target.classList.add('active');
    },

    // [비밀번호 찾기] 타이머 시작 (5분)
    startTimer() {
        let timeLeft = 300; // 5분
        const timerEl = document.getElementById('resetTimer');
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            if(timerEl) timerEl.textContent = `남은 시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                if(timerEl) timerEl.textContent = '인증 시간이 만료되었습니다.';
                this.showResetMessage('인증 시간이 만료되었습니다. 재전송해주세요.', 'error');
            }
        }, 1000);
    },

    // ============================================================
    // 2. 비밀번호 찾기 로직 (API 통신)
    // ============================================================

    // [1단계] 인증코드 전송
    async sendResetCode() {
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            this.showResetMessage('이메일을 입력해주세요.', 'error');
            return;
        }

        const send_btn = document.getElementById('sendCodeBtn')
        const originalText = send_btn.textContent;
        send_btn.textContent = '전송 중...';
        send_btn.disabled = true;
        send_btn.style.opacity = '0.6';
        send_btn.style.cursor = 'default';

        try {
            const response = await fetch('/user/forgot-password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                this.resetEmail = email;
                this.showResetMessage(result.message, 'success');
                this.goToStep(2);
                this.startTimer();
            } else {
                this.showResetMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('오류:', error);
            this.showResetMessage('서버 통신 오류입니다.', 'error');
        } finally {
            // 버튼 복구
            send_btn.textContent = originalText;
            send_btn.disabled = false;
            send_btn.style.opacity = '1';
            send_btn.style.cursor = 'pointer';
        }
    },

    // [2단계] 인증코드 확인
    async verifyResetCode() {
        const verifyCode = document.getElementById('verifyCode').value.trim();

        if (!verifyCode || verifyCode.length !== 6) {
            this.showResetMessage('6자리 인증코드를 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await fetch('/user/verify-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.resetEmail,
                    code: verifyCode
                })
            });

            const result = await response.json();

            if (response.ok) {
                clearInterval(this.timerInterval);
                this.showResetMessage(result.message, 'success');
                this.goToStep(3);
            } else {
                this.showResetMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('오류:', error);
            this.showResetMessage('서버 통신 오류입니다.', 'error');
        }
    },

    // [2단계] 코드 재전송
    async resendResetCode() {
        if (!this.resetEmail) return;

        const resend_btn = document.getElementById('resendCodeBtn')
        const originalText = resend_btn.textContent;
        resend_btn.textContent = '전송 중...';
        resend_btn.disabled = true;
        resend_btn.style.opacity = '0.6';
        resend_btn.style.cursor = 'default';

        try {
            const response = await fetch('/user/forgot-password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.resetEmail })
            });

            const result = await response.json();

            if (response.ok) {
                this.showResetMessage('인증코드가 재전송되었습니다.', 'success');
                document.getElementById('verifyCode').value = '';
                this.startTimer();
            } else {
                this.showResetMessage(result.message, 'error');
            }
        } catch (error) {
            this.showResetMessage('서버 통신 오류입니다.', 'error');
        } finally {
            // 버튼 복구
            resend_btn.textContent = originalText;
            resend_btn.disabled = false;
            resend_btn.style.opacity = '1';
            resend_btn.style.cursor = 'pointer';
        }
    },

    // [3단계] 비밀번호 변경
    async resetPassword() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newPassword || !confirmPassword) {
            this.showResetMessage('비밀번호를 모두 입력해주세요.', 'error');
            return;
        }
        if (newPassword.length < 8) {
            this.showResetMessage('비밀번호는 8자 이상이어야 합니다.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            this.showResetMessage('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        try {
            const response = await fetch('/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.resetEmail, newPassword })
            });

            const result = await response.json();

            if (response.ok) {
                this.showResetMessage(result.message, 'success');
                setTimeout(() => {
                    this.closePasswordResetModal();
                }, 2000);
            } else {
                this.showResetMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('오류:', error);
            this.showResetMessage('서버 통신 오류입니다.', 'error');
        }
    },

    // ============================== 로그인 로직 ==============================
    // 성공 처리
    handleLoginSuccess(userInfo, loginType) {
        console.log(`${loginType} 로그인 성공: `, userInfo);
        sessionStorage.setItem('loginType', loginType);
        location.replace('/Play_on');
    },

    // 실패 처리
    handleLoginFailure(error, loginType) {
        console.error(`${loginType} 로그인 실패: `, error);
        alert(error.message || '로그인 중 오류가 발생했습니다.');
    },

    // 소셜 로그인
    async socialLogin(loginMethod, userInfo, token = null) {
        if (token) {
            userInfo.token = token;
        }

        try {
            const response = await fetch('/user/social-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginMethod, userInfo })
            });

            const result = await response.json();

            // 신규 회원 - 닉네임 생성 필요
            if (response.status === 201) {
                this.showNicknameModal(loginMethod, userInfo);
            }
            // 기존 회원 - 로그인 성공
            else if (response.ok) {
                this.handleLoginSuccess(result.user, loginMethod);
            }
            else {
                this.handleLoginFailure(new Error(result.message), loginMethod);
            }
        } catch (error) {
            this.handleLoginFailure(error, loginMethod);
        }
    },

    // 닉네임 모달 표시
    showNicknameModal(loginMethod, userInfo) {
        document.getElementById('nicknameModal').style.display = 'flex';
        window.socialLoginData = { loginMethod, userInfo };
        this.isNicknameAvailable = false;

        // 입력 초기화
        document.getElementById('socialNickname').value = '';
        document.getElementById('nicknameMessage').textContent = '';
        document.getElementById('confirmNicknameBtn').disabled = true;
    },

    // 닉네임 중복 확인
    async checkSocialNickname() {
        const nickname = document.getElementById('socialNickname').value.trim();
        const messageEl = document.getElementById('nicknameMessage');
        const confirmBtn = document.getElementById('confirmNicknameBtn');

        if (!nickname) {
            messageEl.textContent = '닉네임을 입력해주세요.';
            messageEl.style.color = 'red';
            return;
        }

        try {
            const response = await fetch('/user/check-nickname', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname })
            });

            const result = await response.json();

            if (result.available) {
                messageEl.textContent = result.message;
                messageEl.style.color = 'green';
                confirmBtn.disabled = false;
                this.isNicknameAvailable = true;
            } else {
                messageEl.textContent = result.message;
                messageEl.style.color = 'red';
                confirmBtn.disabled = true;
                this.isNicknameAvailable = false;
            }
        } catch (error) {
            console.error('닉네임 중복 확인 오류:', error);
            messageEl.textContent = '서버 오류가 발생했습니다.';
            messageEl.style.color = 'red';
        }
    },

    // 소셜 회원가입 완료
    async confirmSocialSignup() {
        if (!this.isNicknameAvailable) {
            alert('닉네임 중복 확인을 해주세요.');
            return;
        }

        const nickname = document.getElementById('socialNickname').value.trim();
        const { loginMethod, userInfo } = window.socialLoginData;

        try {
            const response = await fetch('/user/social-signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loginMethod,
                    nickname,
                    email: userInfo.email,
                    token: userInfo.token
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`${nickname}님, 가입을 환영합니다!`);
                document.getElementById('nicknameModal').style.display = 'none';
                this.handleLoginSuccess(result.user, loginMethod);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('회원가입 완료 오류:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    },

    // 일반 로그인
    async generalLogin(loginMethod) {
        const id = document.getElementById('user_id').value.trim();
        const password = document.getElementById('user_pw').value.trim();

        if (!id || !password) {
            alert('아이디와 비밀번호를 모두 입력하세요.');
            return;
        }

        try {
            const response = await fetch('/user/general-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, password, loginMethod })
            });

            const result = await response.json();

            if (response.ok) {
                const userInfo = {
                    userId: result.user.id,
                    nickname: result.user.nickname,
                    email: result.user.email
                };
                this.handleLoginSuccess(userInfo, loginMethod);
            }
            else {
                this.handleLoginFailure(new Error(result.message), loginMethod);
            }
        } catch (error) {
            this.handleLoginFailure(error, loginMethod);
        }
    },

    initNaverLogin() {
        const naverLogin = new naver.LoginWithNaverId({
            clientId: config.NAVER_CLIENT_ID,
            callbackUrl: config.CALLBACK_URL_NAVER,
            isPopup: false,
            loginButton: { color: "green", type: 1, height: 40 }
        });
        naverLogin.init();
    },

    initKakaoLogin() {
        Kakao.init(config.KAKAO_JAVASCRIPT_KEY);
        console.log('카카오 초기화: ', Kakao.isInitialized());
    },

    kakaoLogin(loginMethod) {
        Kakao.Auth.login({
            scope: 'profile_nickname, account_email',
            success: (authObj) => {
                const accessToken = authObj.access_token;

                Kakao.API.request({
                    url: '/v2/user/me',
                    success: (res) => {
                        const userInfo = {
                            email: res.kakao_account.email,
                            nickname: res.kakao_account.profile.nickname
                        };

                        this.socialLogin(loginMethod, userInfo, accessToken);
                    },
                    fail: (error) => {
                        this.handleLoginFailure(error, loginMethod);
                    }
                });
            },
            fail: (err) => {
                this.handleLoginFailure(err, loginMethod);
            },
        });
    },

    initGoogleLogin() {
        google.accounts.id.initialize({
            client_id: config.GOOGLE_CLIENT_ID,
            callback: (response) => this.processGoogleCallback(response)
        });

        const googleBtn = document.getElementById('google-login-btn');
        if (googleBtn) {
            google.accounts.id.renderButton(googleBtn, {
                theme: "outline",
                size: "large",
                type: "icon"
            });
        }
        console.log("Google 초기화 완료");
    },

    async processGoogleCallback(response) {
        try {
            const parts = response.credential.split('.');
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

            const binaryString = atob(payload);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const userInfo = JSON.parse(new TextDecoder().decode(bytes));

            const token = response.credential;

            await this.socialLogin(this.LOGIN_TYPES.GOOGLE, {
                email: userInfo.email,
                nickname: userInfo.name
            }, token);

        } catch (error) {
            this.handleLoginFailure(error, this.LOGIN_TYPES.GOOGLE);
        }
    },

    init() {
        // 네이버 신규 회원 처리
        const pendingSignup = sessionStorage.getItem('pendingSocialSignup');
        if (pendingSignup) {
            sessionStorage.removeItem('pendingSocialSignup');
            const { loginMethod, userInfo } = JSON.parse(pendingSignup);
            this.showNicknameModal(loginMethod, userInfo);
        }

        // 일반 회원 로그인
        const loginBtn = document.getElementById('login_btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.generalLogin(this.LOGIN_TYPES.GENERAL));
        }

        // 소셜 회원 로그인 - 카카오
        const kakaoBtn = document.getElementById('kakao-login-btn');
        if (kakaoBtn) {
            kakaoBtn.addEventListener('click', () => this.kakaoLogin(this.LOGIN_TYPES.KAKAO));
        }

        // 닉네임 생성
        const checkNicknameBtn = document.getElementById('checkNicknameBtn');
        const confirmNicknameBtn = document.getElementById('confirmNicknameBtn');

        if (checkNicknameBtn) {
            checkNicknameBtn.addEventListener('click', () => this.checkSocialNickname());
        }
        if (confirmNicknameBtn) {
            confirmNicknameBtn.addEventListener('click', () => this.confirmSocialSignup());
        }

        // 알림 모달 닫기 버튼
        document.getElementById('closeMessageModalBtn')?.addEventListener('click', () => this.closeMessageModal());

        // 비밀번호 찾기 모달
        document.getElementById('forgot_pw_link')?.addEventListener('click', () => this.showPasswordResetModal());
        document.getElementById('closeResetModalBtn')?.addEventListener('click', () => this.closePasswordResetModal());

        // 비밀번호 찾기 버튼
        document.getElementById('sendCodeBtn')?.addEventListener('click', () => this.sendResetCode());
        document.getElementById('verifyCodeBtn')?.addEventListener('click', () => this.verifyResetCode());
        document.getElementById('resendCodeBtn')?.addEventListener('click', () => this.resendResetCode());
        document.getElementById('resetPasswordBtn')?.addEventListener('click', () => this.resetPassword());

        // 엔터키 처리 (비밀번호 찾기)
        document.getElementById('resetEmail')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendResetCode(); });
        document.getElementById('verifyCode')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.verifyResetCode(); });
        document.getElementById('confirmPassword')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.resetPassword(); });


        this.initNaverLogin();
        this.initKakaoLogin();
        this.initGoogleLogin();
    }
};

document.addEventListener("DOMContentLoaded", () => LoginManager.init());