const CallbackManager = {
    LOGIN_TYPES: {
        NAVER: 'naver'
    },

    REDIRECTS: {
        SUCCESS: '/Play_on',
        FAILURE: '/sign_in'
    },

    async socialLogin(loginMethod, userInfo, token) {
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

             // 신규 회원 - 로그인 페이지로 데이터 전달
            if (response.status === 201) {
                sessionStorage.setItem('pendingSocialSignup', JSON.stringify({
                    loginMethod,
                    userInfo
                }));
                location.replace('/sign_in');

            }
            // 기존 회원 - 로그인 성공
            else if (response.ok) {
                this.handleSuccess(result.user, loginMethod);
            }
            else {
                this.handleFailure(new Error(result.message), loginMethod);
            }
        } catch (error) {
            this.handleFailure(error, loginMethod);
        }
    },

    handleSuccess(userInfo, loginType) {
        console.log(`${loginType} 로그인 성공:`, userInfo);
        sessionStorage.setItem('loginType', loginType);
        // alert('로그인 성공!');
        location.replace(this.REDIRECTS.SUCCESS);
    },

    handleFailure(error, loginType) {
        console.error(`${loginType} 로그인 실패:`, error);
        alert(`로그인 실패: ${error.message || error}`);
        location.replace(this.REDIRECTS.FAILURE);
    },

    processNaverCallback() {
        const naverLogin = new naver.LoginWithNaverId({
            clientId: config.NAVER_CLIENT_ID,
            callbackUrl: config.CALLBACK_URL_NAVER,
            isPopup: false,
            callbackHandle: true
        });

        naverLogin.init();

        naverLogin.getLoginStatus((status) => {
            if (status) {
                const userInfo = {
                    email: naverLogin.user.getEmail(),
                    nickname: naverLogin.user.getNickName()
                };
                const token = naverLogin.accessToken.accessToken;

                this.socialLogin(this.LOGIN_TYPES.NAVER, userInfo, token);
            } else {
                this.handleFailure(new Error('네이버 로그인 상태 확인 실패'), this.LOGIN_TYPES.NAVER);
            }
        });
    },

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const provider = urlParams.get("provider");

        if (provider === this.LOGIN_TYPES.NAVER) {
            this.processNaverCallback();
        } else {
            console.error('잘못된 provider:', provider);
            location.replace(this.REDIRECTS.FAILURE);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => CallbackManager.init());