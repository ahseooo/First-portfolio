const express = require('express');
const router = express.Router();
const path = require('path');

function isLoggedout(req, res, next) {
    if(req.session.user) {
        return res.redirect('/Play_on');
    }
    return next();
}

router.use('/public-learning', express.static(path.join(__dirname, '..', 'public', 'learning-contents')));

const publicPages = {
    '/': 'Play_off.html',
    '/sign_in': 'sign_in.html',
    '/sign_up': 'sign_up.html',
    '/Social_login_callback': 'Social_login_callback.html'
};

const framePages = {
    '/main_frame': 'main_frame.html',
    '/Sidebar': 'sidebar.html'
};

// 로그아웃 상태에서만 접근 가능
Object.entries(publicPages).forEach(([route, file]) => {
    router.get(route, isLoggedout, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', file));
    });
});

// 로그인 여부 무관
Object.entries(framePages).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.sendFile(path.join(__dirname, '..', file));
    });
});

module.exports = router;