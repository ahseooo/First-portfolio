const express = require('express');
const router = express.Router();
const database = require('../mysqlDB'); // DB 연결 모듈 경로 확인 필요

// 미들웨어: 로그인 여부 확인 (이 라우터의 모든 요청에 적용)
// router.use((req, res, next) => {
//     if (!req.session.user) {
//         return res.status(401).json({ message: '로그인이 필요합니다.' });
//     }
//     next();
// });

// [GET] 내 프로필 정보 가져오기
// 요청 경로: /user/profile
router.get('/profile-info', async (req, res) => {
    const userId = req.session.user.user_ID;

    try {
        // DB에서 최신 닉네임, 프로필 아이콘, 등급(role) 조회
        const [rows] = await database.query(
            'SELECT nickname, profile_icon, role FROM user_info WHERE user_ID = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = rows[0];

        res.status(200).json({
            message: '프로필 조회 성공',
            data: {
                nickname: user.nickname,
                // DB에 값이 없으면(null) null 반환 -> 프론트에서 기본 이미지 처리
                profile_icon: user.profile_icon
            }
        });

    } catch (err) {
        console.error('프로필 조회 오류:', err);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;