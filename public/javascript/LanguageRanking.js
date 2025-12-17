// ==========================================
// 1. 이미지 및 상수 데이터 정의
// ==========================================

const tierImages = {
    diamond: '/images/tier/diamond.png',
    platinum: '/images/tier/platinum.png',
    gold: '/images/tier/gold.png',
    silver: '/images/tier/silver.png',
    bronze: '/images/tier/bronze.png'
};

const profileImages = {
    first: '/images/profile/comon.png',
    second: '/images/profile/buffer-overflow.png',
    third: '/images/profile/database.png',
    fourth: '/images/profile/debugging.png',
};

const badgeImages = {
    java: ['/images/badges/levelquest-java-beginner.png', '/images/badges/levelquest-java-fin.png'],
    python: ['/images/badges/levelquest-py-beginner.png', '/images/badges/levelquest-py-fin.png'],
    js: ['/images/badges/levelquest-js-beginner.png', '/images/badges/levelquest-js-fin.png'],
    html: ['/images/badges/levelquest-html-beginner.png', '/images/badges/levelquest-html-fin.png'],
    common: [
        '/images/logo.png',
        '/images/tier/bronze.png',
        '/images/tier/silver.png',
        '/images/tier/gold.png',
        '/images/tier/platinum.png',
        '/images/tier/diamond.png'
    ]
};

// ==========================================
// 2. 유틸리티 함수
// ==========================================

// [수정] 통합 레벨 계산 (총점 500점당 1레벨 - TotalRanking과 기준 통일)
function calculateTotalLevel(totalScore) {
    const POINTS_PER_LEVEL = 500; 
    return Math.floor(totalScore / POINTS_PER_LEVEL) + 1;
}

// [수정] 통합 경험치 계산 (총점 기준)
function calculateTotalExp(totalScore) {
    const multiplier = 45;
    const baseExp = totalScore * multiplier;
    const fixedJunk = (totalScore * 17) % 491; 
    
    const finalExp = totalScore === 0 ? 0 : baseExp + fixedJunk;
    return `${finalExp.toLocaleString()} %`;
}

function getTierByScore(score) {
    if (score >= 4000) return { name: 'Diamond', image: tierImages.diamond };
    if (score >= 3000) return { name: 'Platinum', image: tierImages.platinum };
    if (score >= 2000) return { name: 'Gold', image: tierImages.gold };
    if (score >= 1000) return { name: 'Silver', image: tierImages.silver };
    return { name: 'Bronze', image: tierImages.bronze };
}

function getProfileImageByLevel(level) {
    if (level >= 51) return profileImages.fourth;
    if (level >= 26) return profileImages.third;
    if (level >= 15) return profileImages.second;
    return profileImages.first;
}

// ==========================================
// 3. 30명 고정 유저 데이터 (LocalStorage)
// ==========================================

const STORAGE_KEY = 'coding_monster_ranking_data_v4'; 

const userNames = [
    "킹받는무지개", "어쩔티비", "알빠노", "중꺾마", "맑은눈의광인",
    "내꿈은건물주", "공부빼고다잘함", "야자째고코딩", "벼락치기장인", "민초단장",
    "반민초파", "찍신강림", "다이아갈사람", "브론즈탈출기", "마라탕후루",
    "방구석여포", "침대밖은위험해", "엄마나1등먹었어", "존버는승리한다", "탈주닌자",
    "내가캐리함", "너만오면고", "즐겜유저", "빡겜모드", "치킨사줘",
    "탕후루중독", "마라탕수혈", "인생은실전", "급식체마스터", "제로투장인"
];

const getRandomScore = () => Math.floor(Math.random() * 101) * 50;

function loadOrGenerateUsers() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        return JSON.parse(savedData);
    } else {
        const newUsers = userNames.map((name, index) => {
            // 언어별 점수 생성
            const scores = {
                java: getRandomScore(),
                python: getRandomScore(),
                js: getRandomScore(),
                html: getRandomScore()
            };

            // [추가] 언어별 총 경험치 생성 (점수와 비례하지만 다른 큰 값으로 저장)
            const exps = {
                java: calculateTotalExp(scores.java),
                python: calculateTotalExp(scores.python),
                js: calculateTotalExp(scores.js),
                html: calculateTotalExp(scores.html)
            };

            return {
                id: index + 1,
                nickname: name,
                scores: scores,
                exps: exps, // 경험치 데이터 별도 저장
                badgesCount: Math.floor(Math.random() * 6)
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));
        return newUsers;
    }
}

const allUsers = loadOrGenerateUsers();

// ==========================================
// 4. 렌더링용 DB 변환
// ==========================================

const db = {};
const languages = ['java', 'python', 'js', 'html'];

languages.forEach(lang => {
    const langUsers = allUsers.map(user => {
        // 1. 해당 언어 점수 (랭킹 산정용)
        const currentLangScore = user.scores[lang];
        
        // 2. [수정] 유저의 총점 계산 (레벨/경험치용)
        const totalScore = Object.values(user.scores).reduce((sum, s) => sum + s, 0);
        
        // 3. 총점을 기준으로 레벨과 경험치 계산
        const level = calculateTotalLevel(totalScore);
        const expStr = calculateTotalExp(totalScore);

        return {
            nickname: user.nickname,
            score: currentLangScore, // 표시는 해당 언어 점수
            level: level,            // 레벨은 통합 레벨
            badges: user.badgesCount,
            tier: getTierByScore(currentLangScore), // 티어는 해당 언어 점수 기준
            character: getProfileImageByLevel(level), // 캐릭터는 통합 레벨 기준
            exp: expStr              // 경험치는 통합 경험치
        };
    });

    // 정렬: 해당 언어 점수 높은 순
    langUsers.sort((a, b) => b.score - a.score);

    db[lang] = langUsers;
});

// ==========================================
// 5. 내 정보 (My Info) 계산
// ==========================================

const myInfos = {
    java: { nickname: "코코몽", score: 1850, character: profileImages.third },
    python: { nickname: "코코몽", score: 4800, character: profileImages.third },
    js: { nickname: "코코몽", score: 850, character: profileImages.third },
    html: { nickname: "코코몽", score: 2100, character: profileImages.third }
};



Object.keys(myInfos).forEach(lang => {
    const info = myInfos[lang];
    const myScore = info.score;
    const myTotalScore = Object.values(myInfos).reduce((sum, info) => sum + info.score, 0);
    
    // 1. 레벨 계산
    info.level = calculateTotalLevel(myTotalScore);
    
    // 2. 경험치 자동 계산 (고정 수식 적용 -> 새로고침해도 동일)
    const myTotalExp = calculateTotalExp(myTotalScore);
    info.exp = `${myTotalExp.toLocaleString()}`;

    // 3. 티어 계산
    info.tier = getTierByScore(myScore);

    // 4. 랭킹 계산
    let rank = 1;
    if (db[lang]) {
        rank = db[lang].filter(u => u.score > myScore).length + 1;
    }
    info.rank = rank;
});

// ==========================================
// 6. 렌더링 로직 (UI)
// ==========================================

const savedLang = sessionStorage.getItem('ranking_lang');
let currentLang = savedLang ? savedLang : 'java';
let currentPage = 1;
const ROWS_PER_PAGE = 10;

const rankRowTemplate = document.getElementById('rank-row-template');
const medalTemplate = document.getElementById('medal-template');
const rankNumberTemplate = document.getElementById('rank-number-template');
const badgeTemplate = document.getElementById('badge-template');

function createRankDisplay(rank) {
    let template;
    if (rank <= 3) {
        template = medalTemplate.content.cloneNode(true);
        template.querySelector('.rank-medal').textContent = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    } else {
        template = rankNumberTemplate.content.cloneNode(true);
        template.querySelector('.rank-number').textContent = rank;
    }
    return template;
}

// [핵심 수정] 뱃지 로직: 언어 뱃지 소진 시 공통 뱃지로 채움
function createBadges(count, lang) {
    const fragment = document.createDocumentFragment();
    
    // 1. 해당 언어의 뱃지 목록
    const langBadges = badgeImages[lang] || [];
    // 2. 공통 뱃지 목록
    const commonBadges = badgeImages['common'] || [];

    // 최대 5개까지만 표시
    const totalCount = Math.min(count, 5);

    for (let i = 0; i < totalCount; i++) {
        const template = badgeTemplate.content.cloneNode(true);
        const iconEl = template.querySelector('.badge-icon');
        const img = document.createElement('img');
        img.className = 'badge-icon';

        // 이미지 소스 결정 로직
        if (i < langBadges.length) {
            // A. 언어 뱃지가 남아있으면 사용
            img.src = langBadges[i];
        } else {
            // B. 언어 뱃지가 떨어지면 공통 뱃지 사용
            // 공통 뱃지 인덱스 계산 (현재 인덱스 - 이미 사용한 언어뱃지 수)
            const commonIndex = i - langBadges.length;
            
            // 공통 뱃지도 떨어지면 처음부터 순환(%)
            if (commonBadges.length > 0) {
                img.src = commonBadges[commonIndex % commonBadges.length];
            } else {
                // 만약 공통 뱃지도 없다면 언어 뱃지라도 순환 (안전장치)
                img.src = langBadges[i % langBadges.length];
            }
        }
        
        img.alt = 'badge';
        iconEl.replaceWith(img);
        fragment.appendChild(template);
    }
    return fragment;
}

function getMyInfoSafe() {
    let info = myInfos[currentLang] || myInfos['java'];
    return info;
}

function updateMyRankCard() {
    const myInfo = getMyInfoSafe();
    if (!myInfo) return;

    const myCardImg = document.querySelector('.my-rank-card .character img');
    if (myCardImg && myInfo.character) myCardImg.src = myInfo.character;

    document.getElementById('my-nickname').textContent = myInfo.nickname;
    document.getElementById('my-level').textContent = myInfo.level;
    document.getElementById('my-rank').textContent = myInfo.rank;
    document.getElementById('my-score').textContent = myInfo.score.toLocaleString();
    document.getElementById('my-exp').textContent = myInfo.exp;
}

function createTableRow(user, realRank) {
    const myInfo = getMyInfoSafe();
    const isMe = realRank === myInfo.rank;
    const row = rankRowTemplate.content.cloneNode(true);
    const tr = row.querySelector('tr');

    if (isMe) tr.classList.add('my-rank-row');

    tr.querySelector('.rank-display').appendChild(createRankDisplay(realRank));
    tr.querySelector('.user-nickname').textContent = isMe ? myInfo.nickname : user.nickname;
    tr.querySelector('.user-character').src = isMe ? myInfo.character : user.character;
    
    const badgesContainer = tr.querySelector('.badges-container');
    badgesContainer.appendChild(createBadges(user.badges, currentLang));

    tr.querySelector('.user-level').textContent = `Lv.${isMe ? myInfo.level : user.level}`;

    const tierWrapper = tr.querySelector('.tier-wrapper');
    const tierIcon = tierWrapper.querySelector('.tier-icon');
    const tierData = isMe ? myInfo.tier : user.tier;

    if (tierData) {
        const img = document.createElement('img');
        img.className = 'tier-icon';
        img.src = tierData.image;
        img.alt = tierData.name;
        tierIcon.replaceWith(img);
    }

    tr.querySelector('.user-exp').textContent = isMe ? myInfo.exp : user.exp;
    tr.querySelector('.user-score').textContent = (isMe ? myInfo.score : user.score).toLocaleString();

    return row;
}

function renderTable() {
    let currentData = db[currentLang] || db['java'];
    const sortedUsers = [...currentData];
    const totalPages = Math.ceil(sortedUsers.length / ROWS_PER_PAGE);
    
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageUsers = sortedUsers.slice(startIdx, endIdx);

    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = "";

    const fragment = document.createDocumentFragment();
    pageUsers.forEach((user, index) => {
        fragment.appendChild(createTableRow(user, startIdx + index + 1));
    });
    tbody.appendChild(fragment);

    document.getElementById('page-info').textContent = `${currentPage} / ${totalPages}`;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        const lang = btn.dataset.lang ? btn.dataset.lang.toLowerCase() : 'java';
        
        if (lang === currentLang) btn.classList.add('active');
        else btn.classList.remove('active');

        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentLang = lang;
            currentPage = 1;
            sessionStorage.setItem('ranking_lang', currentLang);
            
            updateMyRankCard();
            renderTable();
        });
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
        const currentData = db[currentLang];
        const totalPages = Math.ceil(currentData.length / ROWS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    updateMyRankCard();
    renderTable();
});