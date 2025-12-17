const express = require('express');
const Judge0API = require('../Utils/judge0');
const router = express.Router();
require('dotenv').config();

const judge0 = new Judge0API(process.env.JUDGE0_API_KEY);

const LANGUAGE_IDS = {
    'python': 71,
    'java': 62,
    'javascript': 63
};

// 코드 실행 엔드포인트
router.post('/execute', async (req, res) => {
    try {
        const { code, language, input = '' } = req.body;

        if(!code) {
            return res.status(400).json({
                success: false,
                error: '실행할 코드를 입력해주세요.'
            });
        }

        if(!language) {
            return res.status(400).json({
                success: false,
                error: ('프로그래밍 언어를 선택해주세요.')
            });
        }

        const languageId = LANGUAGE_IDS[language.toLowerCase()];
        if(!languageId) {
            return res.status(400).json({
                success: false,
                error: '지원하지 않는 언어입니다.'
            });
        }
        
        console.log(`코드 실행 요청 - 언어: ${language}, 코드 길이: ${code.length}`);

        // Judge0 API로 코드 실행
        const result = await judge0.executeCode(code, languageId, input);

        res.json({
            success: true,
            data: result
        });
    } catch(error) {
        console.error('코드 실행 오류: ', error.message);

        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API 상태 확인 엔드포인트
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Judge0 API 서비스가 정상적으로 작동 중입니다.',
        supportedLanguages: Object.keys(LANGUAGE_IDS),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;