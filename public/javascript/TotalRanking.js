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

// 통합 랭킹에서는 모든 뱃지 이미지를 골고루 사용
const badgeImages = {
    all: ['/images/badges/first-attendance.png'],
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
// 2. 유틸리티 함수 (LanguageRanking과 로직 통일)
// ==========================================

const tierValue = {
    'Diamond': 5,
    'Platinum': 4,
    'Gold': 3,
    'Silver': 2,
    'Bronze': 1
};

function getTierByScore(score) {
    if (score >= 4000) return { name: 'Diamond', image: tierImages.diamond };
    if (score >= 3000) return { name: 'Platinum', image: tierImages.platinum };
    if (score >= 2000) return { name: 'Gold', image: tierImages.gold };
    if (score >= 1000) return { name: 'Silver', image: tierImages.silver };
    return { name: 'Bronze', image: tierImages.bronze };
}

// 4개 언어 점수 중 가장 높은 티어 반환
function getHighestTier(scores) {
    let maxTierVal = 0;
    let bestTier = getTierByScore(0); 

    Object.values(scores).forEach(score => {
        const currentTier = getTierByScore(score);
        const currentVal = tierValue[currentTier.name];
        
        if (currentVal > maxTierVal) {
            maxTierVal = currentVal;
            bestTier = currentTier;
        }
    });
    
    return bestTier;
}

// [통일] 통합 레벨 계산 (총점 500점당 1레벨)
function calculateTotalLevel(totalScore) {
    const POINTS_PER_LEVEL = 500; 
    return Math.floor(totalScore / POINTS_PER_LEVEL) + 1;
}

// [통일] 통합 경험치 계산 (LanguageRanking.js와 동일한 공식 사용)
function calculateTotalExp(totalScore) {
    const multiplier = 45;
    const baseExp = totalScore * multiplier;
    const fixedJunk = (totalScore * 17) % 491; // 491로 통일
    
    const finalExp = totalScore === 0 ? 0 : baseExp + fixedJunk;
    return `${finalExp.toLocaleString()} XP`;
}

function getProfileImageByLevel(level) {
    if (level >= 51) return profileImages.fourth;
    if (level >= 26) return profileImages.third;
    if (level >= 15) return profileImages.second;
    return profileImages.first;
}

// ==========================================
// 3. 데이터 로드 및 가공
// ==========================================

const STORAGE_KEY = 'coding_monster_ranking_data_v4'; 

function loadTotalRankingData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return []; 

    const users = JSON.parse(savedData);

    const processedUsers = users.map(user => {
        // 1. 총점 계산 (모든 언어 점수 합산)
        const totalScore = Object.values(user.scores).reduce((a, b) => a + b, 0);
        
        // 2. 통합 레벨 & 경험치 계산 (총점 기준)
        const level = calculateTotalLevel(totalScore);
        const expStr = calculateTotalExp(totalScore);

        // 3. 최고 티어 계산
        const highestTier = getHighestTier(user.scores);

        return {
            nickname: user.nickname,
            score: totalScore,
            level: level,
            badges: user.badgesCount,
            tier: highestTier,
            character: getProfileImageByLevel(level),
            exp: expStr
        };
    });

    // 총점 기준 내림차순 정렬
    return processedUsers.sort((a, b) => b.score - a.score);
}

const totalRankingData = loadTotalRankingData();

// ==========================================
// 4. 내 정보 (My Info) 계산
// ==========================================

// LanguageRanking.js와 동일한 점수 데이터 사용
const myRawScores = {
    java: 1850,
    python: 4800,
    js: 850,
    html: 2100
};

function calculateMyTotalInfo() {
    // 1. 내 총점 계산
    const totalScore = Object.values(myRawScores).reduce((a, b) => a + b, 0);
    
    // 2. 레벨 & 경험치 계산 (통일된 공식 적용)
    const level = calculateTotalLevel(totalScore);
    const exp = calculateTotalExp(totalScore);
    
    const highestTier = getHighestTier(myRawScores);

    // 내 등수 계산
    const myRank = totalRankingData.filter(u => u.score > totalScore).length + 1;

    return {
        nickname: "코코몽",
        score: totalScore,
        level: level,
        rank: myRank,
        tier: highestTier,
        character: profileImages.third,
        exp: exp
    };
}

const myInfo = calculateMyTotalInfo();

// ==========================================
// 5. 렌더링 로직 (UI)
// ==========================================

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
function createBadges(count) {
    const fragment = document.createDocumentFragment();
    const displayCount = Math.min(count, 5); // 최대 5개

    for (let i = 0; i < displayCount; i++) {
        const template = badgeTemplate.content.cloneNode(true);
        const iconEl = template.querySelector('.badge-icon');
        const img = document.createElement('img');
        img.className = 'badge-icon';
        
        // 1. 'all'에 있는 이미지를 우선 사용
        if (i < badgeImages.all.length) {
            img.src = badgeImages.all[i];
        } 
        // 2. 나머지는 'common' 이미지로 채움 (순환)
        else {
            const commonIndex = i - badgeImages.all.length;
            // common 배열이 비어있지 않은 경우에만 접근
            if (badgeImages.common.length > 0) {
                img.src = badgeImages.common[commonIndex % badgeImages.common.length];
            } else {
                // 안전 장치: common도 없으면 all 재사용
                img.src = badgeImages.all[i % badgeImages.all.length];
            }
        }
        
        img.alt = 'badge';
        iconEl.replaceWith(img);
        fragment.appendChild(template);
    }
    return fragment;
}

function updateMyRankCard() {
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
    const isMe = realRank === myInfo.rank;
    const row = rankRowTemplate.content.cloneNode(true);
    const tr = row.querySelector('tr');

    if (isMe) tr.classList.add('my-rank-row');

    tr.querySelector('.rank-display').appendChild(createRankDisplay(realRank));
    tr.querySelector('.user-nickname').textContent = isMe ? myInfo.nickname : user.nickname;
    tr.querySelector('.user-character').src = isMe ? myInfo.character : user.character;

    const badgesContainer = tr.querySelector('.badges-container');
    badgesContainer.appendChild(createBadges(user.badges));

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
    const totalPages = Math.ceil(totalRankingData.length / ROWS_PER_PAGE);
    
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageUsers = totalRankingData.slice(startIdx, endIdx);

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
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const totalPages = Math.ceil(totalRankingData.length / ROWS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    updateMyRankCard();
    renderTable();
});