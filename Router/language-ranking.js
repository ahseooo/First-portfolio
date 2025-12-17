const express = require('express');
const router = express.Router();
const db = require('../mysqlDB');

// 언어별 랭킹 조회
router.get('/api/ranking/:language', async (req, res) => {
    const { language } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        // 퀘스트 점수 합계로 랭킹 계산
        const query = `
            WITH user_scores AS (
                SELECT 
                    ur.user_ID,
                    ur.nickname,
                    ur.language,
                    COALESCE(SUM(lq.quest_score), 0) as total_score
                FROM user_ranking ur
                LEFT JOIN user_quest_progress uqp 
                    ON ur.user_ID = uqp.user_ID 
                    AND ur.language = uqp.language
                LEFT JOIN levelquest lq 
                    ON uqp.language = lq.language 
                    AND lq.quest_num <= uqp.current_quest_num
                WHERE ur.language = ?
                GROUP BY ur.user_ID, ur.nickname, ur.language
            ),
            ranked_users AS (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
                FROM user_scores
            )
            SELECT 
                ru.rank,
                ru.user_ID,
                ru.nickname,
                ui.profile_icon,
                ru.total_score as score,
                -- 레벨 계산 (임시: score/100)
                FLOOR(ru.total_score / 100) as level,
                -- 경험치 (레벨 진행률 %)
                MOD(ru.total_score, 100) as exp,
                -- 티어 계산
                CASE 
                    WHEN ru.total_score >= 4000 THEN 'diamond'
                    WHEN ru.total_score >= 3000 THEN 'platinum'
                    WHEN ru.total_score >= 2000 THEN 'gold'
                    WHEN ru.total_score >= 1000 THEN 'silver'
                    ELSE 'bronze'
                END as tier,
                -- 대표 뱃지
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'badge_name', bm.badge_name,
                            'badge_image_url', bm.badge_image_url
                        )
                    )
                    FROM user_badges ub
                    JOIN badge_master bm ON ub.badge_name = bm.badge_name
                    WHERE ub.user_ID = ru.user_ID 
                        AND ub.is_equipped = 1
                        AND (bm.language = ? OR bm.language = 'total')
                    LIMIT 5
                ) as badges
            FROM ranked_users ru
            JOIN user_info ui ON ru.user_ID = ui.user_ID
            ORDER BY ru.rank
            LIMIT ? OFFSET ?
        `;

        const [rankings] = await db.query(query, [language, language, limit, offset]);

        // 전체 페이지 수 계산
        const [countResult] = await db.query(
            'SELECT COUNT(DISTINCT user_ID) as total FROM user_ranking WHERE language = ?',
            [language]
        );
        const totalPages = Math.ceil(countResult[0].total / limit);

        res.json({
            rankings,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        console.error('랭킹 조회 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 내 랭킹 정보 조회
router.get('/api/myrank/:language', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인 필요' });
    }

    const { language } = req.params;
    const userId = req.session.user.user_ID;

    try {
        const query = `
            WITH user_scores AS (
                SELECT 
                    ur.user_ID,
                    ur.nickname,
                    COALESCE(SUM(lq.quest_score), 0) as total_score
                FROM user_ranking ur
                LEFT JOIN user_quest_progress uqp 
                    ON ur.user_ID = uqp.user_ID AND ur.language = uqp.language
                LEFT JOIN levelquest lq 
                    ON uqp.language = lq.language AND lq.quest_num <= uqp.current_quest_num
                WHERE ur.language = ?
                GROUP BY ur.user_ID, ur.nickname
            ),
            ranked_users AS (
                SELECT *, ROW_NUMBER() OVER (ORDER BY total_score DESC) as rank
                FROM user_scores
            )
            SELECT 
                rank,
                nickname,
                total_score as score,
                FLOOR(total_score / 100) as level,
                CONCAT(MOD(total_score, 100), '%') as exp
            FROM ranked_users
            WHERE user_ID = ?
        `;

        const [result] = await db.query(query, [language, userId]);
        res.json(result[0] || { rank: '-', score: 0, level: 1, exp: '0%' });

    } catch (error) {
        console.error('내 랭킹 조회 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

module.exports = router;