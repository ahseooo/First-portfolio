const express = require('express');
const router = express.Router();
const db = require('../mysqlDB');

// 사용자의 언어별 진행률 및 뱃지 조회
router.get('/api/user/:userId/languages', async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT 
                -- 1. 기본 랭킹 정보 (user_ranking)
                ur.ranking_id as progress_id,      
                ur.language as language_name,
                ur.current_rank,           
                ur.score,

                -- 2. 퀘스트 진행률 정보 (user_quest_progress)
                IFNULL(uqp.current_quest_num, 0) as current_quest, -- 현재 깬 문제 수
                IFNULL(uqp.tier, 'bronze') as tier,                -- 현재 티어
                
                -- 백분율 자동 계산 (소수점 1자리까지 반올림)
                -- (현재 깬 문제 / 전체 100문제) * 100
                ROUND((IFNULL(uqp.current_quest_num, 0) / 100) * 100, 1) as progress_percent,

                -- 장착된 뱃지 목록
                (
                    SELECT 
                        GROUP_CONCAT(
                            JSON_OBJECT(
                                'badge_name', bm.badge_name,
                                'badge_image_url', bm.badge_image_url,
                                'category', bm.category
                            )
                        )
                    FROM user_badges ub
                    JOIN badge_master bm ON ub.badge_name = bm.badge_name
                    WHERE ub.user_ID = ur.user_ID
                        AND ub.is_equipped = 1
                        AND bm.language = ur.language
                ) as badges

            FROM user_ranking ur

            -- [JOIN 1] 퀘스트 진행 상황 가져오기 (점수판과 진척도 합치기)
            LEFT JOIN user_quest_progress uqp 
                ON ur.user_ID = uqp.user_ID
                AND ur.language = uqp.language

            -- [JOIN 2] 장착된 뱃지 가져오기 (card_type = language 매칭)
            LEFT JOIN user_badges ub 
                ON ur.user_ID = ub.user_ID 
                AND ur.language = ub.card_type
            
            -- [JOIN 3] 뱃지 상세 정보 가져오기 (이미지 등)
            LEFT JOIN badge_master bm 
                ON ub.badge_name = bm.badge_name

            WHERE ur.user_ID = ?

            GROUP BY 
                ur.ranking_id, 
                ur.language, 
                ur.current_rank, 
                ur.score, 
                uqp.current_quest_num, 
                uqp.tier
        `;

        const [results] = await db.query(query, [userId]);

        const [totalBadges] = await db.query(`
            SELECT 
                0 as progress_id,
                'total' as language_name,
                NULL as current_rank,
                0 as score,
                0 as current_quest,
                'bronze' as tier,
                0 as progress_percent,
                (
                    SELECT GROUP_CONCAT(JSON_OBJECT(
                        'badge_name', bm.badge_name,
                        'badge_image_url', bm.badge_image_url,
                        'category', bm.category
                    ))
                    FROM user_badges ub
                    JOIN badge_master bm ON ub.badge_name = bm.badge_name
                    WHERE ub.user_ID = ? AND ub.is_equipped = 1 AND bm.language = 'total'
                ) as badges
        `, [userId]);

        // 합치기
        if (totalBadges[0]) {
            totalBadges[0].badges = totalBadges[0].badges ? JSON.parse(`[${totalBadges[0].badges}]`) : [];
            results.push(totalBadges[0]);
        }

        // JSON 파싱
        results.forEach(row => {
            if (row.badges) {
                row.badges = JSON.parse(`[${row.badges}]`);
            } else {
                row.badges = [];
            }
        });

        res.json(results);

    } catch (error) {
        console.error('언어 진행률 조회 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 획득한 뱃지 목록 조회
router.get('/api/badges', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const userId = req.session.user.user_ID;
    const cardType = req.query.language || req.query.cardType;

    try {
        let query = `
            SELECT 
                bm.*, 
                ub.is_equipped -- 현재 장착 중인지 확인 (1 or 0)
            FROM user_badges ub
            JOIN badge_master bm ON ub.badge_name = bm.badge_name
            WHERE ub.user_ID = ?
        `;
        let params = [userId];

        if (cardType) {
            // total 카드는 모든 획득 뱃지 허용
            query += ' AND bm.language = ? ORDER BY bm.id';
            params.push(cardType);
        } else {
            query += ' ORDER BY bm.id';
        }

        const [badges] = await db.query(query, params);
        res.json(badges);

    } catch (error) {
        console.error('뱃지 조회 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 사용자 언어별 뱃지 업데이트 (최대 5개)
router.post('/api/user/language/:rankingId/badges', async (req, res) => {
    const { rankingId } = req.params;
    const { badgeIds } = req.body; // 배열로 전달

    // 유효성 검사
    if (!Array.isArray(badgeIds)) {
        return res.status(400).json({ error: '잘못된 데이터 형식입니다.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [rankInfo] = await connection.query(
            'SELECT user_ID, language FROM user_ranking WHERE ranking_id = ?',
            [rankingId]
        );

        if (rankInfo.length === 0) {
            throw new Error('랭킹 정보를 찾을 수 없습니다.');
        }

        const { user_ID, language } = rankInfo[0];
        const cardType = language;

        // 기존 뱃지 삭제
        await connection.query(`
            UPDATE user_badges ub
            JOIN badge_master bm ON ub.badge_name = bm.badge_name
            SET ub.is_equipped = 0
            WHERE ub.user_ID = ? AND bm.language = ?
        `, [user_ID, language]);

        // 새 뱃지 추가
        if (badgeIds.length > 0) {
            // badgeIds는 badge_master의 ID 배열이므로, 서브쿼리로 이름 매칭
            await connection.query(`
                UPDATE user_badges ub
                SET ub.is_equipped = 1
                WHERE ub.user_ID = ? 
                    AND ub.badge_name IN (
                        SELECT badge_name FROM badge_master WHERE id IN (?)
                    )
            `, [user_ID, badgeIds]);
        }

        await connection.commit();
        res.json({ success: true, message: '뱃지가 업데이트되었습니다.' });

    } catch (error) {
        await connection.rollback();
        console.error('뱃지 업데이트 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        connection.release();
    }
});

// 언어 진행률 업데이트
router.put('/api/user/language/:rankingId', async (req, res) => {
    const { rankingId } = req.params;
    const { questProgress, score } = req.body; // level 대신 score를 받음

    try {
        await connection.beginTransaction();

        const [rankInfo] = await connection.query(
            'SELECT user_ID, language FROM user_ranking WHERE ranking_id = ?',
            [rankingId]
        );

        if (rankInfo.length === 0) {
            throw new Error('랭킹 정보를 찾을 수 없습니다.');
        }

        const { user_ID, language } = rankInfo[0];

        if (score !== undefined) {
            await connection.query(
                'UPDATE user_ranking SET score = ? WHERE ranking_id = ?',
                [score, rankingId]
            );
        }

        if (questProgress !== undefined) {
            await connection.query(
                'UPDATE user_quest_progress SET current_quest_num = ? WHERE user_ID = ? AND language = ?',
                [questProgress, user_ID, language]
            );
        }

        await connection.commit();
        res.json({ success: true, message: '진행률이 업데이트되었습니다.' });

    } catch (error) {
        await connection.rollback();
        console.error('진행률 업데이트 실패:', error);
        res.status(500).json({ error: '서버 오류' });
    } finally {
        connection.release();
    }
});

// 세션에서 사용자 ID 조회
router.get('/api/user/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ userId: req.session.user.user_ID });
    } else {
        res.status(401).json({ error: '로그인이 필요합니다.' });
    }
});

module.exports = router;