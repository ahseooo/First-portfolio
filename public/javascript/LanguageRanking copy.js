// --- 헬퍼: 활동 점수에 따른 티어 계산 (5구간) ---
function getTierByScore(score) {
    if (score >= 4000) return { name: 'Diamond', class: 'tier-diamond', icon: 'fa-solid fa-gem' };
    if (score >= 3000) return { name: 'Platinum', class: 'tier-platinum', icon: 'fa-solid fa-crown' };
    if (score >= 2000) return { name: 'Gold', class: 'tier-gold', icon: 'fa-solid fa-trophy' };
    if (score >= 1000) return { name: 'Silver', class: 'tier-silver', icon: 'fa-solid fa-medal' };
    return { name: 'Bronze', class: 'tier-bronze', icon: 'fa-solid fa-chess-pawn' };
}

// 1. 데이터 생성
const createUsers = (prefix, count) => Array.from({ length: count }, (_, i) => {
    const score = Math.floor(Math.random() * 5000) + 100;
    const tierInfo = getTierByScore(score);
    
    return {
        nickname: `${prefix}_user_${i+1}`,
        score: score,
        tier: tierInfo,
        badges: Math.floor(Math.random() * 5) + 1,
        character: `https://api.dicebear.com/9.x/avataaars/svg?seed=${prefix}_${i}`
    };
});

// 언어별 데이터베이스
const db = {
    java: createUsers('Java', 120),
    python: createUsers('Py', 200),
    js: createUsers('JS', 180),
    html: createUsers('HTML', 80)
};

const myInfos = {
    java: { nickname: "코몬", rank: 15, level: 37, exp: "20%", score: 1500, character: "https://api.dicebear.com/9.x/avataaars/svg?seed=Komon" },
    python: { nickname: "코몬", rank: 1, level: 37, exp: "80%", score: 4800, character: "https://api.dicebear.com/9.x/avataaars/svg?seed=Komon" },
    js: { nickname: "코몬", rank: 55, level: 37, exp: "10%", score: 800, character: "https://api.dicebear.com/9.x/avataaars/svg?seed=Komon" },
    html: { nickname: "코몬", rank: 8, level: 37, exp: "90%", score: 2100, character: "https://api.dicebear.com/9.x/avataaars/svg?seed=Komon" }
};


// 상태 관리
const savedLang = sessionStorage.getItem('ranking_lang');
let currentLang = savedLang ? savedLang : 'java';
let currentPage = 1;
const ROWS_PER_PAGE = 10;

// 템플릿 참조
const rankRowTemplate = document.getElementById('rank-row-template');
const medalTemplate = document.getElementById('medal-template');
const rankNumberTemplate = document.getElementById('rank-number-template');
const badgeTemplate = document.getElementById('badge-template');

// 순위 표시 요소 생성
function createRankDisplay(rank) {
    let template;

    if (rank === 1 || rank === 2 || rank === 3) {
        template = medalTemplate.content.cloneNode(true);
        const medal = template.querySelector('.rank-medal');
        medal.textContent = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
    } else {
        template = rankNumberTemplate.content.cloneNode(true);
        template.querySelector('.rank-number').textContent = rank;
    }

    return template;
}

// 뱃지 생성
function createBadges(count) {
    const fragment = document.createDocumentFragment();
    const badgeCount = Math.min(count, 5);

    for (let i = 0; i < badgeCount; i++) {
        const badge = badgeTemplate.content.cloneNode(true);
        fragment.appendChild(badge);
    }

    return fragment;
}

function getMyInfoSafe() {
    let info = myInfos[currentLang];
    // 데이터가 없으면 'all'로 대체하여 오류 방지
    if (!info) {
        console.warn(`'${currentLang}' 데이터를 찾을 수 없어 'java'로 대체합니다.`);
        info = myInfos['java'];
    }
    return info;
}

// 내 랭킹 카드 업데이트
function updateMyRankCard() {
    const myInfo = getMyInfoSafe(); // 안전한 함수 사용
    if (!myInfo) return;

    const myCardImg = document.querySelector('.my-rank-card .character img');
    if (myCardImg && myInfo.character) myCardImg.src = myInfo.character;

    document.getElementById('my-nickname').textContent = myInfo.nickname;
    document.getElementById('my-level').textContent = myInfo.level;
    document.getElementById('my-rank').textContent = myInfo.rank;
    document.getElementById('my-score').textContent = myInfo.score.toLocaleString();
    document.getElementById('my-exp').textContent = myInfo.exp;
}

// 테이블 행 생성
function createTableRow(user, realRank) {
    const myInfo = getMyInfoSafe();
    const isMe = realRank === myInfo.rank;
    const row = rankRowTemplate.content.cloneNode(true);
    const tr = row.querySelector('tr');

    // 내 랭킹 하이라이트
    if (isMe) {
        tr.classList.add('my-rank-row');
    }

    // 순위 표시
    const rankDisplay = tr.querySelector('.rank-display');
    const rankElement = createRankDisplay(realRank);
    rankDisplay.appendChild(rankElement);


    // 닉네임
    const nicknameSpan = tr.querySelector('.user-nickname');
    nicknameSpan.textContent = isMe ? myInfo.nickname : user.nickname;

    const charImg = tr.querySelector('.user-character');
    // 내가 랭킹에 있으면 내 이미지를, 아니면 유저 이미지를 표시
    charImg.src = isMe ? myInfo.character : user.character;

    // 활동 뱃지
    const badgesContainer = tr.querySelector('.badges-container');
    const badges = createBadges(user.badges);
    badgesContainer.appendChild(badges);

    // 레벨
    const levelSpan = tr.querySelector('.user-level');
    levelSpan.textContent = `Lv.${isMe ? myInfo.level : Math.floor(Math.random() * 99) + 1}`;

    const tierWrapper = tr.querySelector('.tier-wrapper');
    const tierIcon = tr.querySelector('.tier-icon');
    
    const tierData = isMe ? myInfo.tier : user.tier;
    const safeTierData = tierData || getTierByScore(isMe ? myInfo.score : user.score);
    
    if (tierIcon) {
        // 아이콘 클래스 설정 (예: fa-solid fa-gem tier-diamond-text)
        tierIcon.className = `tier-icon ${safeTierData.icon} ${safeTierData.class}-text`;
    }

    // 경험치
    const expSpan = tr.querySelector('.user-exp');
    expSpan.textContent = isMe ? myInfo.exp : Math.floor(Math.random() * 100) + '%';

    // 활동 점수
    const scoreSpan = tr.querySelector('.user-score');
    scoreSpan.textContent = user.score.toLocaleString();

    return row;
}

// 메인 테이블 렌더링
function renderTable() {
    let currentData = db[currentLang];

    if (!currentData) {
        currentData = db['java'];
    }

    const sortedUsers = [...currentData].sort((a, b) => b.score - a.score);

    const totalPages = Math.ceil(sortedUsers.length / ROWS_PER_PAGE);
    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageUsers = sortedUsers.slice(startIdx, endIdx);

    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = "";

    const fragment = document.createDocumentFragment();

    pageUsers.forEach((user, index) => {
        const realRank = startIdx + index + 1;
        const row = createTableRow(user, realRank);
        fragment.appendChild(row);
    });

    tbody.appendChild(fragment);

    // 페이지 정보 업데이트
    document.getElementById('page-info').textContent = `${currentPage} / ${totalPages}`;

    // 버튼 상태 업데이트
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// DB에서 데이터 로드
async function loadRankingData(language, page = 1) {
    try {
        const response = await fetch(`/ranking/api/ranking/${language}?page=${page}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('랭킹 로드 실패:', error);
        return { rankings: [], currentPage: 1, totalPages: 1 };
    }
}

// 내 랭킹 로드
async function loadMyRank(language) {
    try {
        const response = await fetch(`/ranking/api/myrank/${language}`);
        return await response.json();
    } catch (error) {
        console.error('내 랭킹 로드 실패:', error);
        return null;
    }
}

// 메인 렌더링 함수
async function renderTable() {
    const data = await loadRankingData(currentLang, currentPage);
    const myRank = await loadMyRank(currentLang);

    if (myRank) {
        updateMyRankCard(myRank);
    }

    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = "";

    data.rankings.forEach((user, index) => {
        const row = createTableRow(user, user.rank);
        tbody.appendChild(row);
    });

    document.getElementById('page-info').textContent = `${currentPage} / ${data.totalPages}`;
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        const lang = btn.dataset.lang ? btn.dataset.lang.toLowerCase() : 'java';

        if (lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', () => {
            // 1. 버튼 스타일 초기화 및 활성화
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. 언어 변경 (소문자로 변환하여 매칭)
            currentLang = btn.dataset.lang ? btn.dataset.lang.toLowerCase() : 'java';
            currentPage = 1; // 페이지 초기화

            sessionStorage.setItem('ranking_lang', currentLang);

            // 3. 화면 갱신
            updateMyRankCard();
            renderTable();
        });
    });

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const currentData = db[currentLang] || db['java'];
        const totalPages = Math.ceil(currentData.length / ROWS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // 초기 실행
    updateMyRankCard();
    renderTable();
});