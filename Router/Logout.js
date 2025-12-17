const express = require('express');
const router = express.Router();
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 세션 파기 공통 함수
function destroySession(req, res) {
    if(req.session) {
            const loginType = req.session ? req.session.loginType : null;
            console.log(loginType);
        req.session.destroy(err => {
            if(err) {
                console.error('세션 파기 중 오류 발생: ', err);
                return res.status(500).json({ message: '서버에서 로그아웃 처리 중 오류가 발생했습니다.' });
            }
            res.clearCookie('connect.sid');
            
            console.log('로그아웃 성공: 서버 세션이 파기되었습니다.');
            if(loginType === 'kakao') {
                const kakaoLogoutUrl = `https://kauth.kakao.com/oauth/logout?client_id=${process.env.KAKAO_REST_API_KEY}&logout_redirect_uri=${process.env.KAKAO_REDIRECT_URI}`;
                res.status(200).json({
                    message: '카카오 로그아웃을 진행합니다.',
                    logoutUrl: kakaoLogoutUrl
                });
            }
            else {
                return res.status(200).json({ message: '성공적으로 로그아웃되었습니다.' });
            }
        });
    } else {
        return res.status(200).json({ message: '이미 로그아웃된 상태입니다.' });
    }
}

// ✅ 네이버 토큰 폐기 함수
async function revokeNaverToken(accessToken) {
    try {
        const url = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&access_token=${accessToken}`;
        
        console.log('네이버 토큰 폐기 시도');
        const naverResponse = await fetch(url, { method: 'GET' });
        const data = await naverResponse.json();

        if(data.result === 'success') {
            console.log('✅ 네이버 토큰 폐기 성공');
            return true;
        } else {
            console.warn('⚠️ 네이버 토큰 폐기 실패:', data);
            return false;
        }
    } catch (err) {
        console.error('❌ 네이버 토큰 폐기 오류:', err);
        return false;
    }
}

// 로그아웃
router.post('/logout', async (req, res) => {
    try {
        // 세션 파기
        destroySession(req, res);
    } catch (err) {
            console.error('로그아웃 처리 중 예기치 않은 서버 오류: ', err);
            if(!res.headersSent) {
                return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
            }
        }
});

// 네이버 전용 로그아웃 (토큰 폐기 + 세션 파기)
router.post('/naver-logout', async (req, res) => {
    try {
        const naverAccessToken = req.session?.naverAccessToken;

        if(naverAccessToken) {
            await revokeNaverToken(naverAccessToken);
        } else {
            console.warn('⚠️ 세션에 네이버 토큰이 없습니다.');
        }

        destroySession(req, res, '네이버 로그아웃 성공');
    } catch (err) {
        console.error('네이버 로그아웃 처리 중 오류:', err);
        if(!res.headersSent) {
            return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
        }
    }
});

module.exports = router;