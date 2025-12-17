const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_AUTH_ID,
        pass: process.env.GMAIL_AUTH_PASS
    }
});

// 문의 이메일 전송
router.post('/send-inquiry', async (req, res) => {
    
    // 1. 세션에서 사용자 이메일 가져오기
    const userEmail = req.session.user?.user_ID;

    // 2. 로그인(세션) 여부 확인
    if (!userEmail) {
        return res.status(401).json({
            success: false,
            error: '로그인이 필요합니다.'
        });
    }
    
    // 3. 프론트엔드에서 보낸 inquiry 객체 받기
    const inquiry = req.body; // { id, title, content, date, ... }

    if (!inquiry.title || !inquiry.content) {
        return res.status(400).json({ 
            success: false, 
            error: '제목과 내용은 필수입니다.' 
        });
    }

    const mailOptions = {
        from: `"코딩몬스터 고객문의봇" <${process.env.GMAIL_AUTH_ID}>`, // 보내는 사람
        to: 'codingmonster.official@gmail.com',         // 받는 관리자
        
        // 4. (핵심) 답장 주소 설정
        replyTo: userEmail, 

        subject: `[문의] ${inquiry.title}`,
        html: `
            <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px;">
                    새로운 문의가 접수되었습니다.
                </h2>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    
                    <p style="margin: 10px 0;"><strong>문의 ID:</strong> ${inquiry.id}</p>
                    <p style="margin: 10px 0;"><strong>회신 이메일:</strong> ${userEmail}</p>
                    <p style="margin: 10px 0;"><strong>제목:</strong> ${inquiry.title}</p>
                    <p style="margin: 10px 0;"><strong>내용:</strong></p>
                    <p style="white-space: pre-wrap; line-height: 1.6;">${inquiry.content}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #718096; font-size: 14px;">
                    <strong>접수일:</strong> ${inquiry.date}
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ 
            success: true, 
            message: '문의가 전송되었습니다.' 
        });
    } catch (error) {
        console.error('이메일 전송 실패:', error);
        res.status(500).json({ 
            success: false, 
            error: '이메일 전송에 실패했습니다.' 
        });
    }
});

// 이메일 설정 테스트
router.get('/test', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ success: true, message: 'SMTP 연결 성공' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;