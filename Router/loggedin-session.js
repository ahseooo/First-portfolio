const express = require('express');
const router = express.Router();
const path = require('path');

function isLoggedIn(req, res, next) {
    if(req.session.user) {
        return next();
    }
    else {
        res.status(401).send(`
            <script>
                alert("로그인이 필요한 서비스입니다.");
                location.href="/sign_in";
            </script>`);
    }
}

// router.use(isLoggedIn);

const protectedPages = [
    'Play_on',
    'LevelQuestMap',
    'LevelQuest',
    'TotalRanking',
    'LanguageRanking',
    'MyRanking',
    'Community',
    'Guild',
    'Event',
    'Setting'
];

protectedPages.forEach(page => {
    router.get(`/${page}`, isLoggedIn, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'protected', `${page}.html`));
    });
});

module.exports = router;