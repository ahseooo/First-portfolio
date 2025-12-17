const express = require('express');
const router = express.Router();
const database = require('../mysqlDB');

// 로그인 체크 미들웨어
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    next();
}

// ============================================
// 게시글 목록 조회
// ============================================
router.get('/posts', async (req, res) => {
    const { page = 1, limit = 7 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const [posts] = await database.query(
            `SELECT p.*, p.nickname as author
             FROM community_posts p
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)]
        );

        const [[{ total }]] = await database.query(
            'SELECT COUNT(*) as total FROM community_posts'
        );

        res.json({ posts, total });
    } catch (err) {
        console.error('게시글 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 게시글 상세 조회
// ============================================
router.get('/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 조회수 증가
        await database.query(
            'UPDATE community_posts SET views = views + 1 WHERE id = ?',
            [id]
        );

        const [posts] = await database.query(
            `SELECT p.*, p.nickname as author
             FROM community_posts p
             WHERE p.id = ?`,
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        res.json(posts[0]);
    } catch (err) {
        console.error('게시글 상세 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 게시글 작성
// ============================================
router.post('/posts', requireLogin, async (req, res) => {
    const { title, content } = req.body;
    const nickname = req.session.user.nickname;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    try {
        const [result] = await database.query(
            'INSERT INTO community_posts (nickname, title, content) VALUES (?, ?, ?)',
            [nickname, title, content]
        );

        const [newPost] = await database.query(
            `SELECT p.*, p.nickname as author
             FROM community_posts p
             WHERE p.id = ?`,
            [result.insertId]
        );

        res.status(201).json(newPost[0]);
    } catch (err) {
        console.error('게시글 작성 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 게시글 삭제
// ============================================
router.delete('/posts/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const nickname = req.session.user.nickname;

    try {
        const [posts] = await database.query(
            'SELECT nickname FROM community_posts WHERE id = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (posts[0].nickname !== nickname) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        await database.query('DELETE FROM community_posts WHERE id = ?', [id]);
        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (err) {
        console.error('게시글 삭제 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 게시글 수정
// ============================================
router.put('/posts/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const nickname = req.session.user.nickname;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    try {
        const [posts] = await database.query(
            'SELECT nickname FROM community_posts WHERE id = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (posts[0].nickname !== nickname) {
            return res.status(403).json({ message: '수정 권한이 없습니다.' });
        }

        await database.query(
            'UPDATE community_posts SET title = ?, content = ? WHERE id = ?',
            [title, content, id]
        );

        const [updatedPost] = await database.query(
            'SELECT p.*, p.nickname as author FROM community_posts p WHERE p.id = ?',
            [id]
        );

        res.json(updatedPost[0]);
    } catch (err) {
        console.error('게시글 수정 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 댓글 조회
// ============================================
router.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;

    try {
        const [comments] = await database.query(
            `SELECT c.*, c.nickname as author
             FROM community_comments c
             WHERE c.post_id = ? AND c.parent_id IS NULL
             ORDER BY c.created_at DESC`,
            [postId]
        );

        // 각 댓글의 답글 조회
        for (let comment of comments) {
            const [replies] = await database.query(
                `SELECT r.*, r.nickname as author
                 FROM community_comments r
                 WHERE r.parent_id = ?
                 ORDER BY r.created_at ASC`,
                [comment.id]
            );
            comment.replies = replies;
        }

        res.json(comments);
    } catch (err) {
        console.error('댓글 조회 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 댓글 작성
// ============================================
router.post('/posts/:postId/comments', requireLogin, async (req, res) => {
    const { postId } = req.params;
    const { content, parentId = null } = req.body;
    const nickname = req.session.user.nickname;

    if (!content) {
        return res.status(400).json({ message: '내용을 입력해주세요.' });
    }

    try {
        const [result] = await database.query(
            'INSERT INTO community_comments (post_id, nickname, content, parent_id) VALUES (?, ?, ?, ?)',
            [postId, nickname, content, parentId]
        );

        const [newComment] = await database.query(
            `SELECT c.*, c.nickname as author
             FROM community_comments c
             WHERE c.id = ?`,
            [result.insertId]
        );

        if (!parentId) {
            newComment[0].replies = [];
        }

        res.status(201).json(newComment[0]);
    } catch (err) {
        console.error('댓글 작성 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// ============================================
// 댓글 삭제
// ============================================
router.delete('/comments/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const nickname = req.session.user.nickname;

    try {
        const [comments] = await database.query(
            'SELECT nickname FROM community_comments WHERE id = ?',
            [id]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        if (comments[0].nickname !== nickname) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        // 답글도 함께 삭제
        await database.query('DELETE FROM community_comments WHERE id = ? OR parent_id = ?', [id, id]);
        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (err) {
        console.error('댓글 삭제 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    }
});

// community.js 라우터에 추가
router.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ 
            loggedIn: true, 
            user: req.session.user 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;