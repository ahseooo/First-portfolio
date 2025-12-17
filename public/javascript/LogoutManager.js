const LogoutManager = {
    LOGIN_TYPES: {
        GENERAL: 'general',
        NAVER: 'naver',
        KAKAO: 'kakao',
        GOOGLE: 'google'
    },

    async serverLogout(endpoint, body = {}) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: Object.keys(body).length ? JSON.stringify(body) : undefined
            });

            const result = await response.json();
            if(!response.ok) {
                throw new Error('서버 로그아웃 실패');
            }

            console.log('✅ 서버 로그아웃 성공', result.message);
            return result;
        } catch (error) {
            console.error('❌ 서버 로그아웃 오류:', error);
            throw error;
        }
    },

    // ✅ 클라이언트 정리 함수
    clearClientData() {
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('loginType');
    },

    async logout() {
        const loginType = sessionStorage.getItem('loginType');
        console.log('🔍 현재 loginType:', loginType);
        let endpoint = '/logout-request/logout';
        let sdkLogout = null;

        switch (loginType) {
            case this.LOGIN_TYPES.NAVER:
                endpoint = '/logout-request/naver-logout'
                
                sdkLogout = () => {
                    if (typeof naverLogin !== 'undefined') {
                        naverLogin.logout();
                    }
                };
                break;

            case this.LOGIN_TYPES.KAKAO:
                sdkLogout = () => {
                    return new Promise(resolve => {
                        if (Kakao.Auth.getAccessToken()) {
                            Kakao.Auth.logout(resolve);
                        } else {
                            resolve(); // 토큰이 없으면 바로 종료
                        }
                    });
                };
                break;

            case this.LOGIN_TYPES.GOOGLE:
                sdkLogout = () => {
                    if(typeof google !== 'undefined') {
                        google.accounts.id.disableAutoSelect();
                    }
                }
                break;

            case this.LOGIN_TYPES.GENERAL:
            default:
                break;
        }
        try {
            const result = await this.serverLogout(endpoint);

            if(sdkLogout) {
                await sdkLogout();
                console.log(`✅ ${loginType} SDK 로그아웃 완료`);
            }

            this.clearClientData();
            // alert('로그아웃 되었습니다.');
            window.location.href = result.logoutUrl || config.HOME_URL;
        } catch (err) {
            console.error('로그아웃 처리 중 최종 오류:', error);
            alert(error.message || '로그아웃 중 오류가 발생했습니다.');
            
            // 에러 발생 시에도 클라이언트 정리 후 홈으로 이동
            this.clearClientData();
            location.replace(config.HOME_URL);
        }
    },

    init() {
        const logoutBtn = document.getElementById('btn_logout');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        Kakao.init(config.KAKAO_JAVASCRIPT_KEY);
    }
}

document.addEventListener('DOMContentLoaded', () => LogoutManager.init());