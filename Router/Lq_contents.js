const express = require('express');
const router = express.Router();
const database = require('../mysqlDB');

const TIER_SCORES = {
    'bronze': 100,
    'silver': 200,
    'gold': 300,
    'platinum': 500,
    'diamond': 1000
};

// 모든 문제 조회
router.post('/questList', async (req, res) => {
    try {
        const { language, tier } = req.body;

        let query = 'SELECT * FROM levelquest WHERE language = ?';
        let params = [language];

        if (tier) {
            query += ' AND tier = ?';
            params.push(tier);
        }

        query += ' ORDER BY quest_num ASC';

        const [rows] = await database.query(query, params);

        const questlist = rows.map(quest => ({
            ...quest,
            test_cases: quest.test_cases || []
        }));

        res.status(200).json(questlist);
    } catch (err) {
        console.error('문제 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 사용자 진행 상황 조회
router.post('/user-progress', async (req, res) => {
    try {
        const { language } = req.body;
        const userId = req.session.user.user_ID;

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        const [progressRows] = await database.query(
            `SELECT tier, current_quest_num 
             FROM user_quest_progress 
             WHERE user_ID = ? AND language = ?`,
            [userId, language]
        );

        if (progressRows.length > 0) {
            res.json({
                tier: progressRows[0].tier,
                currentQuestNum: progressRows[0].current_quest_num
            });
        } else {
            await database.query(
                `INSERT INTO user_quest_progress (user_ID, language, tier, current_quest_num) 
                 VALUES (?, ?, 'bronze', 1)`,
                [userId, language]
            );

            res.json({
                tier: 'bronze',
                currentQuestNum: 1
            });
        }
    } catch (err) {
        console.error('진행 상황 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 진행 상황 저장
router.post('/save-progress', async (req, res) => {
    try {
        const { language, tier, currentQuestNum } = req.body;
        const userId = req.session.user.user_ID;

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        await database.query(
            `INSERT INTO user_quest_progress (user_ID, language, tier, current_quest_num, updated_at) 
             VALUES (?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
                tier = VALUES(tier),
                current_quest_num = VALUES(current_quest_num),
                updated_at = NOW()`,
            [userId, language, tier, currentQuestNum]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('진행 상황 저장 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 점수 업데이트 API
// 점수 및 진행도 업데이트 API (확실한 로직으로 변경)
router.post('/update-score', async (req, res) => {
    try {
        const { tier, language } = req.body;
        const userId = req.session.user.user_ID;

        console.log(`[API 요청] ID: ${userId}, Tier: ${tier}, Lang: ${language}`);

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        const scoreToAdd = TIER_SCORES[tier.toLowerCase()] || 0;
        const lang = language.toLowerCase();

        // 1. 먼저 user_info에서 닉네임을 가져옵니다. (이게 없으면 랭킹 등록 불가)
        const [userInfo] = await database.query(
            'SELECT nickname FROM user_info WHERE user_ID = ?', 
            [userId]
        );

        if (userInfo.length === 0) {
            console.error(`❌ 오류: user_info 테이블에 ID(${userId})가 존재하지 않습니다.`);
            return res.json({ success: false, message: '유저 정보를 찾을 수 없습니다.' });
        }

        const nickname = userInfo[0].nickname;

        // 2. 랭킹 테이블에 저장 (ON DUPLICATE KEY UPDATE 사용)
        // - 처음 저장될 때: score = 점수, quest_progress = 1
        // - 이미 있을 때: score = 기존점수 + 점수, quest_progress = 기존진행도 + 1
        const query = `
            INSERT INTO user_ranking (user_ID, nickname, language, score, quest_progress, updated_at)
            VALUES (?, ?, ?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE 
                score = score + ?,
                quest_progress = quest_progress + 1,
                updated_at = NOW()
        `;

        // 파라미터 순서: 
        // INSERT용: [userId, nickname, lang, scoreToAdd]
        // UPDATE용: [scoreToAdd]
        const [result] = await database.query(query, [
            userId, 
            nickname, 
            lang, 
            scoreToAdd, 
            scoreToAdd 
        ]);

        console.log(`✅ DB 업데이트 성공! (${result.affectedRows}행 처리됨)`);

        // 3. 업데이트된 최신 정보 조회 (프론트엔드 갱신용)
        const [updatedRows] = await database.query(
            'SELECT score, quest_progress FROM user_ranking WHERE user_ID = ? AND language = ?',
            [userId, lang]
        );

        res.json({ 
            success: true, 
            addedScore: scoreToAdd, 
            totalScore: updatedRows[0]?.score || scoreToAdd,
            currentProgress: updatedRows[0]?.quest_progress || 1
        });

    } catch (err) {
        console.error('랭킹 점수 업데이트 치명적 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

router.post('/save-score-progress', async (req, res) => {
    try {
        const { questId, score, language } = req.body;
        const userId = req.session.user.user_ID;

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        const lang = language.toLowerCase();

        // 1. 현재 퀘스트 번호 조회
        const [questRows] = await database.query(
            'SELECT quest_num, tier FROM levelquest WHERE quest_ID = ?',
            [questId]
        );

        if (questRows.length === 0) {
            return res.status(404).json({ message: '퀘스트를 찾을 수 없습니다.' });
        }

        const currentQuestNum = questRows[0].quest_num;
        const currentTier = questRows[0].tier;
        const nextQuestNum = currentQuestNum + 1; 

        // 2. 닉네임 조회
        const [userRows] = await database.query(
            'SELECT nickname FROM user_info WHERE user_ID = ?',
            [userId]
        );
        const nickname = userRows[0].nickname;

        // 3. 랭킹 테이블 업데이트 (점수 + 푼 문제 수)
        const rankingQuery = `
            INSERT INTO user_ranking (user_ID, nickname, language, score, quest_progress, updated_at)
            VALUES (?, ?, ?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE 
                score = score + ?,
                quest_progress = quest_progress + 1,
                updated_at = NOW()
        `;
        await database.query(rankingQuery, [userId, nickname, lang, score, score]);

        // 4. 진행도 테이블 업데이트 (다음 문제 번호)
        await database.query(`
            INSERT INTO user_quest_progress (user_ID, language, tier, current_quest_num, updated_at)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                current_quest_num = GREATEST(current_quest_num, VALUES(current_quest_num)),
                updated_at = NOW()
        `, [userId, lang, currentTier, nextQuestNum]);

        // console.log(`✅ [저장 완료] ID:${userId} / Score:+${score} / NextQuest:${nextQuestNum}`);


        
        // 뱃지 획득 로직
        let badgeImageUrl = null;
        let badgeAcquired = false;
        let badgeName = null;
        
        if (currentTier === 'bronze' && currentQuestNum === 1) {
            
            // 언어별 뱃지 이름 매핑 (DB의 badge_master에 이 이름들이 있어야 함)
            const badgeNameMap = {
                'java': 'Java 첫걸음',
                'python': 'Python 첫걸음',
                'javascript': 'Javascript 첫걸음',
                'html': 'HTML 첫걸음'
            };

            badgeName = badgeNameMap[lang] || '코딩의 첫걸음';

            // user_badges 테이블에 추가
            const badgeQuery = `
                INSERT INTO user_badges (user_ID, card_type, badge_name, is_equipped, acquired_at)
                VALUES (?, ?, ?, 0, NOW())
                ON DUPLICATE KEY UPDATE user_ID = user_ID
            `;
            
            await database.query(badgeQuery, [userId, lang, badgeName]);

            const [badgeMasterRows] = await database.query(
                'SELECT badge_image_url FROM badge_master WHERE badge_name = ?',
                [badgeName]
            );

            badgeImageUrl = badgeMasterRows[0]?.badge_image_url || null;
            if (badgeImageUrl) {
                badgeAcquired = true;
            }
            console.log(`🏅 뱃지 획득 저장: ${badgeName} (${userId})`);
        }
        // ============================================================


        console.log(`✅ [저장 완료] ID:${userId} / Quest:${currentQuestNum} -> ${nextQuestNum} / Score:+${score}`);

        res.json({ 
            success: true, 
            nextQuestNum, 
            badgeAcquired, 
            badgeImageUrl: badgeImageUrl, // 이미지 없을 때 기본값
            badgeName: badgeName // 뱃지 이름 전달
        });


    } catch (err) {
        console.error('점수 저장 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 티어 업그레이드
router.post('/upgrade-tier', async (req, res) => {
    try {
        const { tier, language } = req.body;
        const userId = req.session.user.user_ID;

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        await database.query(
            `UPDATE user_quest_progress 
             SET tier = ?, current_quest_num = 1, updated_at = NOW()
             WHERE user_ID = ? AND language = ?`,
            [tier, userId, language]
        );

        res.json({ success: true, tier });
    } catch (err) {
        console.error('티어 업그레이드 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 승급 가능 여부 체크
router.post('/check-tier-upgrade', async (req, res) => {
    try {
        const { questId, language } = req.body;
        const userId = req.session.user.user_ID;

        if (!userId) {
            return res.status(401).json({ message: '로그인이 필요합니다.' });
        }

        // 1. 현재 문제 정보 조회
        const [questRows] = await database.query(
            'SELECT tier, quest_num FROM levelquest WHERE quest_ID = ?',
            [questId]
        );

        if (questRows.length === 0) {
            return res.json({ shouldUpgrade: false });
        }

        const currentQuest = questRows[0];
        const currentTier = currentQuest.tier;

        // 2. 해당 티어의 마지막 문제 번호 확인
        const [maxQuestRows] = await database.query(
            'SELECT MAX(quest_num) as maxNum FROM levelquest WHERE language = ? AND tier = ?',
            [language, currentTier]
        );

        const maxQuestNum = maxQuestRows[0]?.maxNum;

        // 3. 마지막 문제가 아니면 승급 불가
        if (currentQuest.quest_num !== maxQuestNum) {
            return res.json({ shouldUpgrade: false });
        }

        // 4. 다음 티어 확인
        const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const currentTierIndex = tierOrder.indexOf(currentTier);
        
        if (currentTierIndex === -1 || currentTierIndex === tierOrder.length - 1) {
            return res.json({ shouldUpgrade: false });
        }

        const nextTier = tierOrder[currentTierIndex + 1];

        // 5. 사용자의 현재 티어 확인
        const [userRows] = await database.query(
            'SELECT tier FROM user_quest_progress WHERE user_ID = ? AND language = ?',
            [userId, language]
        );

        const userCurrentTier = userRows[0]?.tier || 'bronze';

        // 6. 이미 다음 티어 이상이면 승급 불필요
        if (tierOrder.indexOf(userCurrentTier) >= tierOrder.indexOf(nextTier)) {
            return res.json({ shouldUpgrade: false });
        }

        res.json({ 
            shouldUpgrade: true, 
            nextTier,
            currentTier 
        });
    } catch (err) {
        console.error('승급 체크 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 배치 테스트용 문제 조회 (2-2-2-1-1 구성)
router.post('/placement-test', async (req, res) => {
    try {
        const { language } = req.body;

        // 5개 티어에서 정해진 개수만큼 랜덤으로 문제를 뽑아 하나로 합치는 쿼리
        // bronze(2), silver(2), gold(2), platinum(1), diamond(1)
        const sql = `
            (SELECT * FROM levelquest WHERE language = ? AND tier = 'bronze' ORDER BY RAND() LIMIT 2)
            UNION ALL
            (SELECT * FROM levelquest WHERE language = ? AND tier = 'silver' ORDER BY RAND() LIMIT 2)
            UNION ALL
            (SELECT * FROM levelquest WHERE language = ? AND tier = 'gold' ORDER BY RAND() LIMIT 2)
            UNION ALL
            (SELECT * FROM levelquest WHERE language = ? AND tier = 'platinum' ORDER BY RAND() LIMIT 1)
            UNION ALL
            (SELECT * FROM levelquest WHERE language = ? AND tier = 'diamond' ORDER BY RAND() LIMIT 1)
        `;

        // language 변수를 5번 전달해야 합니다.
        const params = [language, language, language, language, language];

        const [rows] = await database.query(sql, params);

        // (추천) 8개의 문제를 quest_ID 순으로 정렬해서 프론트엔드가 쓰기 편하게 만듭니다.
        rows.sort((a, b) => a.quest_ID - b.quest_ID);

        res.status(200).json(rows);

    } catch (err) {
        console.error('배치 테스트 문제 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

module.exports = router;