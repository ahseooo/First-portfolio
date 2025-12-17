require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT;

app.use(express.json({ limit: '10mb' }));

// for login flow
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

// public 폴더를 정적 파일로 제공
app.use(express.static(path.join(__dirname, 'public')));

// 레벨퀘스트 이미지
app.use('/quest-images', express.static('src-quest'));

// 랭킹 페이지 벳지 이미지
app.use('/badge-img', express.static('src-badge'));

// 프로필 아이콘 이미지
app.use('/profile', express.static('src-profile'));

// 티어 이미지
app.use('/tier-img', express.static('src-tier'));

// 로그인 후 이용 가능한 페이지
const isLoggedInRouter = require('./Router/loggedin-session');
app.use('/', isLoggedInRouter);

// 로그아웃
const logoutRouter = require('./Router/Logout');
app.use('/logout-request', logoutRouter);

// DB 연동 (라우터 연결)
const userRouter = require('./Router/user');
app.use('/user', userRouter);

const sendingEmailRouter = require('./Router/send-complain');
app.use('/api/email', sendingEmailRouter);

const lq_Router = require('./Router/Lq_contents');
app.use('/levelquest', lq_Router);

const executeRouter = require('./Router/execute');
app.use('/api', executeRouter);

const geminiApiRouter = require('./Utils/Gemini-api'); 
app.use('/gemini-api', geminiApiRouter);

const BoardRouter = require('./Router/board');
app.use('/board', BoardRouter);

const calendarRouter = require('./Router/calendar');
app.use('/calendar', calendarRouter);

const badgeRouter = require('./Router/edit-badge');
app.use('/badge', badgeRouter);

const profileRouter = require('./Router/user-profile');
app.use('/profile', profileRouter);

const rankingRoutes = require('./Router/language-ranking');
app.use('/ranking', rankingRoutes);

const publicRouter = require('./Router/public-pages');
app.use('/', publicRouter);

// 서버 실행
app.listen(PORT, '0.0.0.0', () => {
    console.log(`http://127.0.0.1:${PORT} 에서 서버 실행 중`);

    // Judge0 API 키 확인
    if(!process.env.JUDGE0_API_KEY) {
        console.warn('⚠️ 경고: JUDGE0_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    else {
        console.log('✅ Judge0 API 키가 설정되었습니다.');
    }
});