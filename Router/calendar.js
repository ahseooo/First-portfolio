const express = require('express');
const router = express.Router();
const database = require('../mysqlDB');

/* 유틸: 날짜 포맷터 */
const formatDate = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// ========== 출석 관련 API ==========

// 월별 출석 조회
router.get('/attendance/:year/:month', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.json({}); 
        }
    
        const { year, month } = req.params;
        const user_ID = req.session.user.user_ID;
        
        const query = `
            SELECT DATE_FORMAT(attendance_date, '%Y-%m-%d') as date
            FROM attendance
            WHERE user_ID = ? 
            AND YEAR(attendance_date) = ? 
            AND MONTH(attendance_date) = ?
        `;

        const [rows] = await database.query(query, [user_ID, year, month]);

        // { "2025-01-15": true, "2025-01-20": true } 형태로 변환
        const attendanceData = {};
        rows.forEach(row => {
            attendanceData[row.date] = true;
        });

        res.json(attendanceData);
    } catch (error) {
        console.error('출석 조회 오류:', error);
        res.json({}); // 에러 나도 빈 달력 보여주기
    }
});

// 월별 메모 조회
router.get('/memos/:year/:month', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.json({});
        }

        const { year, month } = req.params;
        const user_ID = req.session.user.user_ID;

        const query = `
            SELECT DATE_FORMAT(memo_date, '%Y-%m-%d') as date, content
            FROM memos
            WHERE user_ID = ? 
            AND YEAR(memo_date) = ? 
            AND MONTH(memo_date) = ?
        `;

        const [rows] = await database.query(query, [user_ID, year, month]);

        // { "2025-01-15": "메모 내용", "2025-01-20": "메모 내용" } 형태로 변환
        const memoData = {};
        rows.forEach(row => {
            memoData[row.date] = row.content;
        });

        res.json(memoData);
    } catch (error) {
        console.error('메모 조회 오류:', error);
        res.json({});
    }
});

const authMiddleware = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }
    next();
};

router.use(authMiddleware);

// 출석 등록
router.post('/attendance', async (req, res) => {
    try {
        const { year, month, day } = req.body;
        const user_ID = req.session.user.user_ID;

        if (!year || !month || !day) {
            return res.status(400).json({ error: '날짜 정보가 필요합니다.' });
        }

        const attendanceDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 중복 체크
        const checkQuery = `
            SELECT id FROM attendance 
            WHERE user_ID = ? AND attendance_date = ?
        `;
        const [existing] = await database.query(checkQuery, [user_ID, attendanceDate]);

        if (existing.length > 0) {
            return res.status(400).json({ error: '이미 출석한 날짜입니다.' });
        }

        // 출석 등록
        const insertQuery = `
            INSERT INTO attendance (user_ID, attendance_date) 
            VALUES (?, ?)
        `;
        await database.query(insertQuery, [user_ID, attendanceDate]);

        res.json({ 
            success: true, 
            message: '출석이 등록되었습니다.',
            date: attendanceDate 
        });
    } catch (error) {
        console.error('출석 등록 오류:', error);
        res.status(500).json({ error: '출석 등록 실패' });
    }
});

// 메모 저장 (생성 또는 수정)
router.post('/memos', async (req, res) => {
    try {
        const { year, month, day, content } = req.body;
        const user_ID = req.session.user.user_ID;

        if (!year || !month || !day) {
            return res.status(400).json({ error: '날짜 정보가 필요합니다.' });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: '메모 내용이 필요합니다.' });
        }

        const memoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // 오늘 날짜인 경우, 출석 여부 DB 확인
        const today = new Date();
        const isToday = (
            today.getFullYear() === parseInt(year) &&
            (today.getMonth() + 1) === parseInt(month) &&
            today.getDate() === parseInt(day)
        );

        if (isToday) {
            // 해당 날짜에 출석 기록이 있는지 조회
            const checkQuery = `SELECT 1 FROM attendance WHERE user_ID = ? AND attendance_date = ?`;
            const [attResult] = await database.query(checkQuery, [user_ID, memoDate]);

            if (attResult.length === 0) {
                return res.status(403).json({ error: '출석체크를 먼저 해야 메모를 작성할 수 있습니다.' });
            }
        }

        // UPSERT (있으면 업데이트, 없으면 삽입)
        const query = `
            INSERT INTO memos (user_ID, memo_date, content) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            content = VALUES(content),
            updated_at = CURRENT_TIMESTAMP
        `;

        await database.query(query, [user_ID, memoDate, content]);

        res.json({ 
            success: true, 
            message: '메모가 저장되었습니다.',
            date: memoDate 
        });
    } catch (error) {
        console.error('메모 저장 오류:', error);
        res.status(500).json({ error: '메모 저장 실패' });
    }
});

// 메모 삭제
router.delete('/memos/:year/:month/:day', async (req, res) => {
    try {
        const { year, month, day } = req.params;
        const user_ID = req.session.user.user_ID;

        const memoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const query = `
            DELETE FROM memos 
            WHERE user_ID = ? AND memo_date = ?
        `;

        const [result] = await database.query(query, [user_ID, memoDate]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '삭제할 메모가 없습니다.' });
        }

        res.json({ 
            success: true, 
            message: '메모가 삭제되었습니다.',
            date: memoDate 
        });
    } catch (error) {
        console.error('메모 삭제 오류:', error);
        res.status(500).json({ error: '메모 삭제 실패' });
    }
});

module.exports = router;