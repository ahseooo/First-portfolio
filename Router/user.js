const express = require('express');
const router = express.Router();
const database = require('../mysqlDB');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

let verifyCodes = {};        // 인증 코드 (회원가입 및 비밀번호 재설정용)
let verifyStatus = {};       // 인증 완료 여부 (회원가입용)
let resetStatus = {};        // 비밀번호 재설정 권한 여부 (비밀번호 찾기용)

// 이메일 전송
async function sendVerificationEmail(email, code, type = 'signup') {
    // 메일 전송 설정 (Gmail 기준)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_AUTH_ID,   // .env 파일에 설정된 이메일
            pass: process.env.GMAIL_AUTH_PASS, // .env 파일에 설정된 앱 비밀번호
        }
    });

    let subject = '';
    let htmlContent = '';

    if (type === 'signup') {
        subject = 'Coding Monster 회원가입 인증';
        htmlContent = `<p>Coding Monster 회원가입을 위한 인증코드입니다.</p>`;
    } else if (type === 'reset') {
        subject = 'Coding Monster 비밀번호 재설정';
        htmlContent = `<p>비밀번호 재설정을 위한 인증코드입니다.</p>`;
    }

    const mailOptions = {
        from: `'Coding Monster' <${process.env.GMAIL_AUTH_ID}>`,
        to: email,
        subject: subject,
        html: htmlContent +
                `<p>아래의 인증코드를 입력하여 인증을 완료해주세요.</p>` +
                `<b style="font-size:25px; color:blue;">${code}</b>`
    };

    await transporter.sendMail(mailOptions);
}

// 로그인
router.post('/general-login', async (req, res) => {
    const { loginMethod, id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력하세요.' });
    }

    try {
        const [rows] = await database.query(
            'SELECT * FROM user_info WHERE user_ID = ?', [id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const user = rows[0];

        if(user.login_method === loginMethod) {
                console.log(`기존 유저(${id}), 정상적으로 로그인합니다.`);
            }
            else {
                const provider = {
                    general: '일반',
                    kakao: '카카오',
                    google: '구글',
                    naver: '네이버'
                }[user.login_method] || 'undefined'
                return res.status(409).json({ message: `이미 '${provider}' 계정으로 가입된 이메일입니다.\n해당 방식으로 로그인해주세요.`});
            };

        const isMatch = await bcrypt.compare(password, user.pw);
        if (isMatch) {
            const { pw, ...sessionUser } = user;

            req.session.user = sessionUser;
            req.session.loginType = user.login_method;

            console.log('[백엔드 검문소] 세션에 저장될 최종 데이터:', {
                loginType: req.session.loginType
            });

            req.session.save(err => {
                if(err) {
                    console.error('세션 저장 오류: ', err);
                    return res.status(500).json({ message: '세션 저장 중 오류가 발생했습니다.'});
                }
                res.status(200).json({ message: '로그인 처리 완료', user: sessionUser });
            });
        }
        else {
            return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

    }
    catch (err) {
        console.error('로그인 오류: ', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 소셜 로그인
router.post('/social-login', async (req, res) => {
    const { loginMethod, userInfo } = req.body;
    const { email, token } = userInfo || {};

    if(!loginMethod || !email) {
        return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    try {
        const [eRows] = await database.query('SELECT * FROM user_info WHERE user_ID = ?', [email]);
        let user = eRows[0];
        
        if (user) {
            // 기존 회원 로그인
            if(user.login_method === loginMethod) {
                console.log(`기존 유저(${email}), 정상적으로 로그인합니다.`);
                
                const { pw, ...sessionUser } = user;
                req.session.user = sessionUser;
                req.session.loginType = user.login_method;

                if(token) {
                    if(loginMethod === 'kakao') {
                        req.session.kakaoAccessToken = token;
                    }
                    else if(loginMethod === 'naver') {
                        req.session.naverAccessToken = token;
                    }
                    else if(loginMethod === 'google') {
                        req.session.googleAccessToken = token;
                    }
                }

                req.session.save(err => {
                    if(err) {
                        console.error('세션 저장 오류: ', err);
                        return res.status(500).json({ message: '세션 저장 중 오류가 발생했습니다.'});
                    }
                    res.status(200).json({ message: '로그인 처리 완료', user: sessionUser });
                });
            }
            else {
                const provider = {
                    general: '일반',
                    kakao: '카카오',
                    google: '구글',
                    naver: '네이버'
                }[user.login_method] || 'undefined';
                return res.status(409).json({ message: `이미 '${provider}' 계정으로 가입된 이메일입니다.\n해당 방식으로 로그인해주세요.`});
            }
        }
        else {
            // 신규 회원 - 닉네임 생성 필요
            console.log(`신규 유저(${email}), 닉네임 설정이 필요합니다.`);
            return res.status(201).json({ 
                message: '닉네임 설정이 필요합니다.',
                requireNickname: true 
            });
        }

    } catch (err) {
        console.error(`${loginMethod} 처리 중 서버 오류: `, err);
        return res.status(500).json({ message: '서버 오류가 발생했습니다.'});
    }
});

// 소셜 회원가입 완료
router.post('/social-signup', async (req, res) => {
    const { loginMethod, nickname, email, token } = req.body;

    if(!loginMethod || !nickname || !email) {
        return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    try {
        // 닉네임 중복 확인
        const [nRows] = await database.query('SELECT * FROM user_info WHERE nickname = ?', [nickname]);
        if (nRows.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        }

        // 회원 정보 저장
        const newUser = {
            user_ID: email,
            nickname: nickname,
            login_method: loginMethod
        };
        await database.query('INSERT INTO user_info SET ?', newUser);
        
        const [userRows] = await database.query('SELECT * FROM user_info WHERE user_ID = ?', [email]);
        const user = userRows[0];

        // 세션 저장
        const { pw, ...sessionUser } = user;
        req.session.user = sessionUser;
        req.session.loginType = user.login_method;

        if(token) {
            if(loginMethod === 'kakao') req.session.kakaoAccessToken = token;
            else if(loginMethod === 'naver') req.session.naverAccessToken = token;
            else if(loginMethod === 'google') req.session.googleAccessToken = token;
        }

        req.session.save(err => {
            if(err) {
                console.error('세션 저장 오류: ', err);
                return res.status(500).json({ message: '세션 저장 중 오류가 발생했습니다.'});
            }
            res.status(200).json({ message: '회원가입 완료', user: sessionUser });
        });

    } catch (err) {
        console.error('소셜 회원가입 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});


// 회원가입
router.post('/signup', async (req, res) => {
    const { nickname, email, password } = req.body;

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '유효한 이메일 주소를 입력하세요.' });
    }

    // 이메일 인증 여부 체크
    if (!verifyStatus[email]) {
        console.log(verifyStatus);
        return res.status(400).json({ message: '이메일 인증이 완료되지 않았습니다.' });
    }

    try {
        // 닉네임 중복 확인
        const [nRows] = await database.query('SELECT * FROM user_info WHERE nickname = ?', [nickname]);
        if (nRows.length > 0) {
            return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
        }

        // 이메일 중복 확인
        const [eRows] = await database.query('SELECT * FROM user_info WHERE user_ID = ?', [email]);
        if (eRows.length > 0) {
            const user = eRows[0];
            const loginType = user.login_method;
            let provider;

            switch(loginType) {
                case 'naver' :
                    provider = '네이버';
                    break;
                case 'kakao' :
                    provider = '카카오';
                    break;
                case 'google' :
                    provider = '구글';
                    break;
                default :
                    provider = '일반'
            }
            return res.status(409).json({ message: `이미 '${provider}' 계정으로 가입된 이메일입니다.\n해당 계정으로 로그인해주세요.`});
        }

        // 비밀번호 해싱
        const hashedPW = await bcrypt.hash(password, 10);

        // DB 저장
        await database.query(
            'INSERT INTO user_info (nickname, user_ID, pw) VALUES (?, ?, ?)', [nickname, email, hashedPW]
        );

        // 인증 정보 삭제(1회성 인증)
        delete verifyStatus[email];

        res.status(200).json({ message: '가입을 환영합니다!^^', nickname });
    }
    catch (err) {
        console.error('회원가입 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 닉네임 중복 확인
router.post('/check-nickname', async (req, res) => {
    const { nickname } = req.body;

    if (!nickname) {
        return res.status(400).json({ message: '닉네임을 입력해주세요.' });
    }

    try {
        const [rows] = await database.query(
            'SELECT * FROM user_info WHERE nickname = ?', [nickname]
        );

        if (rows.length > 0) {
            return res.json({ available: false, message: '이미 사용 중인 닉네임입니다.' });
        }
        else {
            return res.json({ available: true, message: '사용 가능한 닉네임입니다.' });
        }
    }
    catch (err) {
        console.error('닉네임 중복 확인 오류: ', err);
        return res.status(500).json({ message: '서버 오류' });
    }
});

// 이메일 중복 확인
router.post('/check-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
    }

    try {
        const [rows] = await database.query(
            'SELECT * FROM user_info WHERE user_ID = ?', [email]
        );

        if (rows.length > 0) {
            const user = rows[0];
            const provider = {
                general: '일반',
                kakao: '카카오',
                google: '구글',
                naver: '네이버'
            }[user.login_method] || '일반';
            
            return res.status(409).json({ 
                message: `이미 가입된 이메일입니다.` 
            });
        }
        
        return res.json({ available: true, message: '사용 가능한 이메일입니다.' });
    }
    catch (err) {
        console.error('이메일 중복 확인 오류: ', err);
        return res.status(500).json({ message: '서버 오류' });
    }
});

// 인증 이메일 전송
router.post('/send-code', async (req, res) => {
    const { email } = req.body;
    if(!email) return res.status(400).json({ message: '이메일을 입력해주세요.' });

    // 랜덤 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verifyCodes[email] = {
        code: code,
        createdAt: Date.now()
    };

    try {
        await sendVerificationEmail(email, code, 'signup');
        res.json({ message: '인증코드가 전송되었습니다.' });
    }
    catch (err) {
        console.error('이메일 전송 오류: ', err);
        res.status(500).json({ message: '이메일 전송을 실패했습니다.' });
    }
});

// 인증코드 확인
router.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    if(!verifyCodes[email]) {
        return res.status(400).json({ verified: false, message: '인증코드를 먼저 전송해주세요.' });
    }

    const { code: savedCode, createdAt } = verifyCodes[email];
    const now = Date.now();
    const diffMinutes = (now - createdAt) / 1000 / 60;

    // 5분 경과 확인
    if(diffMinutes > 5) {
        delete verifyCodes[email];
        return res.status(400).json({ verified: false, message: '인증 시간이 만료되었습니다. 인증코드를 재전송해주세요.' });
    }

    // 코드 일치 확인
    if(savedCode === code){
        delete verifyCodes[email];
        verifyStatus[email] = true;
        return res.json({ verified: true, message: '이메일 인증 성공' });
    }
    
    return res.status(400).json({ verified: false, message: '인증코드가 일치하지 않습니다.' });
});

// 1. 비밀번호 찾기 요청 및 코드 전송
router.post('/forgot-password-request', async (req, res) => {
    const { email } = req.body;
    if(!email) return res.status(400).json({ message: '이메일을 입력해주세요.' });

    try {
        const [rows] = await database.query(
            'SELECT login_method FROM user_info WHERE user_ID = ?', [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '등록되지 않은 이메일입니다.' });
        }

        const user = rows[0];

        // 소셜 로그인 계정은 비밀번호 찾기 기능 제한
        if (user.login_method !== 'general') {
            return res.status(400).json({ message: `소셜 로그인 계정은 비밀번호를 재설정할 수 없습니다.` });
        }
        
        // 랜덤 인증번호 생성 및 저장
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verifyCodes[email] = code; 
        
        // 기존 resetStatus는 초기화
        delete resetStatus[email];

        await sendVerificationEmail(email, code, 'reset');
        res.json({ message: '비밀번호 재설정 인증코드가 전송되었습니다.' });

    } catch (err) {
        console.error('비밀번호 찾기 요청 오류: ', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 2. 재설정 코드 확인
router.post('/verify-reset-code', (req, res) => {
    const { email, code } = req.body;

    if(!verifyCodes[email]) {
        return res.status(400).json({ verified: false, message: '인증코드를 먼저 전송해주세요.' });
    }

    const { code: savedCode, createdAt } = verifyCodes[email];
    const now = Date.now();
    const diffMinutes = (now - createdAt) / 1000 / 60;

    // 5분 경과 확인
    if(diffMinutes > 5) {
        delete verifyCodes[email];
        return res.status(400).json({ verified: false, message: '인증 시간이 만료되었습니다. 인증코드를 재전송해주세요.' });
    }

    if(savedCode === code){
        delete verifyCodes[email];
        resetStatus[email] = true;
        return res.json({ verified: true, message: '이메일 인증 성공. 새 비밀번호를 설정할 수 있습니다.' });
    }
    return res.status(400).json({ verified: false, message: '인증코드가 일치하지 않습니다.' });
});

// 3. 새 비밀번호 설정
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ message: '이메일과 새 비밀번호를 모두 입력해주세요.' });
    }

    // 재설정 권한 확인
    if (!resetStatus[email]) {
        return res.status(403).json({ message: '비밀번호 재설정 권한이 없습니다. 이메일 인증을 다시 진행해주세요.' });
    }
    
    try {
        // 새 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // DB 업데이트
        const [result] = await database.query(
            'UPDATE user_info SET pw = ? WHERE user_ID = ? AND login_method = "general"',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            // 이메일이 존재하지 않거나, 일반 계정이 아닐 경우
            return res.status(404).json({ message: '사용자를 찾을 수 없거나 재설정 권한이 없습니다.' });
        }

        // 권한 삭제 (1회성 재설정)
        delete resetStatus[email];

        res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });

    } catch (err) {
        console.error('비밀번호 재설정 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 비밀번호 변경
router.post('/change-password', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.user_ID;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }

    try {
        const [rows] = await database.query(
            'SELECT pw, login_method FROM user_info WHERE user_ID = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = rows[0];

        // 소셜 로그인 사용자 체크
        if (user.login_method !== 'general') {
            return res.status(400).json({ 
                message: '소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.' 
            });
        }

        // 현재 비밀번호 확인
        const isMatch = await bcrypt.compare(currentPassword, user.pw);
        if (!isMatch) {
            return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // DB 업데이트
        await database.query(
            'UPDATE user_info SET pw = ? WHERE user_ID = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({ message: '비밀번호가 변경되었습니다.' });

    } catch (err) {
        console.error('비밀번호 변경 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 회원 탈퇴
router.post('/withdraw', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const userId = req.session.user.user_ID;
    const loginMethod = req.session.loginType;

    try {
        const [rows] = await database.query(
            'SELECT * FROM user_info WHERE user_ID = ?', 
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 소셜 로그인 연동 해제
        if (loginMethod === 'kakao') {
            await unlinkKakao(req.session.kakaoAccessToken);
        } else if (loginMethod === 'naver') {
            await unlinkNaver(req.session.naverAccessToken);
        } else if (loginMethod === 'google') {
            await unlinkGoogle(req.session.googleAccessToken);
        }

        // DB에서 회원 정보 삭제
        await database.query('DELETE FROM user_info WHERE user_ID = ?', [userId]);

        // 세션 삭제
        req.session.destroy(err => {
            if (err) {
                console.error('세션 삭제 오류:', err);
                return res.status(500).json({ message: '세션 삭제 중 오류가 발생했습니다.' });
            }

            res.clearCookie('connect.sid');
            res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
        });

    } catch (err) {
        console.error('회원 탈퇴 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 카카오 연동 해제
async function unlinkKakao(accessToken) {
    if (!accessToken) return;
    
    try {
        const response = await fetch('https://kapi.kakao.com/v1/user/unlink', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error('카카오 연동 해제 실패:', await response.text());
        }
    } catch (err) {
        console.error('카카오 연동 해제 오류:', err);
    }
}

// 네이버 연동 해제
async function unlinkNaver(accessToken) {
    if (!accessToken) return;
    
    try {
        const response = await fetch('https://nid.naver.com/oauth2.0/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'delete',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                access_token: accessToken,
                service_provider: 'NAVER'
            })
        });

        if (!response.ok) {
            console.error('네이버 연동 해제 실패:', await response.text());
        }
    } catch (err) {
        console.error('네이버 연동 해제 오류:', err);
    }
}

// 구글 연동 해제
async function unlinkGoogle(accessToken) {
    if (!accessToken) return;
    
    try {
        const response = await fetch(`https://oauth2.googleapis.com/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'token': accessToken
            })
        });

        if (!response.ok) {
            console.error('구글 연동 해제 실패:', await response.text());
        }
    } catch (err) {
        console.error('구글 연동 해제 오류:', err);
    }
}

module.exports = router;