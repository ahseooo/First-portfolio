// ==================== 티어 설정 ====================
const TIER_CONFIG = {
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    images: {
        bronze: '/images/tier/bronze.png',
        silver: '/images/tier/silver.png',
        gold: '/images/tier/gold.png',
        platinum: '/images/tier/platinum.png',
        diamond: '/images/tier/diamond.png'
    }
};

// ==================== 사용자 진행 상황 관리 ====================
const UserProgress = {
    currentProgress: {
        tier: 'bronze',
        currentQuestNum: 1,
        language: 'java'
    },

    async init(language) {
        this.currentProgress.language = language;
        await this.loadProgress();
        await this.loadQuestList();
    },

    async loadProgress() {
        try {
            const response = await fetch('/levelquest/user-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: this.currentProgress.language })
            });
            const data = await response.json();

            this.currentProgress.tier = data.tier;
            this.currentProgress.currentQuestNum = data.currentQuestNum;

            // TierState와 동기화
            TierState.currentTier = this.currentProgress.tier;

            return this.currentProgress;
        } catch (error) {
            console.error('진행 상황 로드 실패:', error);
            return this.currentProgress;
        }
    },

    async loadQuestList() {
        try {
            const response = await fetch('/levelquest/questList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: this.currentProgress.language,
                    tier: this.currentProgress.tier
                })
            });

            quest_list = await response.json();

            if (quest_list.length === 0) {
                document.getElementById('quest-content').innerHTML =
                    '<pre>등록된 문제가 없습니다.</pre>';
                return;
            }

            // 현재 진행중인 문제로 인덱스 설정
            currentIndex = quest_list.findIndex(q => q.quest_num === this.currentProgress.currentQuestNum);
            if (currentIndex === -1) currentIndex = 0;

            renderQuest(currentIndex);
            TierUI.updateDisplay(this.currentProgress.tier);
            this.updateProgressDisplay();
        } catch (error) {
            console.error('문제 불러오기 실패:', error);
        }
    },

    updateProgressDisplay() {
        const currentProgress = document.getElementById('quest-progress');
        if (currentProgress) {
            currentProgress.textContent = `QUEST ${currentIndex + 1} / ${quest_list.length}`;
        }
    },

    async saveProgress(questNum) {
        try {
            await fetch('/levelquest/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: this.currentProgress.language,
                    tier: this.currentProgress.tier,
                    currentQuestNum: questNum
                })
            });
        } catch (error) {
            console.error('진행 상황 저장 실패:', error);
        }
    },

    async updateTier(newTier) {
        this.currentProgress.tier = newTier;
        this.currentProgress.currentQuestNum = 1;
        await this.saveProgress(1);
        // await this.loadQuestList();
    }
};

// ==================== 티어 상태 관리 ====================
const TierState = {
    currentTier: '',

    getCurrentTierIndex() {
        return TIER_CONFIG.tiers.indexOf(this.currentTier);
    },

    getNextTier() {
        const currentIndex = this.getCurrentTierIndex();
        return currentIndex < TIER_CONFIG.tiers.length - 1
            ? TIER_CONFIG.tiers[currentIndex + 1]
            : null;
    },

    async upgrade(nextTier) {
        try {
            const response = await fetch('/levelquest/upgrade-tier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: nextTier, language: currentLanguage })
            });

            if (response.ok) {
                this.currentTier = nextTier;
                return true;
            }
            return false;
        } catch (error) {
            console.error('티어 업그레이드 실패:', error);
            return false;
        }
    }
};

// ==================== 티어 UI 관리 ====================
const TierUI = {
    container: null,

    init() {
        this.createTierDisplay();
        this.bindEvents();
    },

    bindEvents() {
        const modal = document.getElementById('upgradeModal');
        const closeBtn = modal.querySelector('.upgrade-close-btn');

        // 기존 이벤트 제거 후 새로 등록 (중복 방지)
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);

        newBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    },

    createTierDisplay() {
        const containerTarget = document.getElementById('quest-header-tier-container');

        if (!containerTarget) return;

        this.container = document.createElement('div');
        this.container.className = 'tier-display';
        this.container.innerHTML = `
            <img src="${TIER_CONFIG.images.bronze}" alt="tier" class="tier-image" id="tierImage">
            <span class="tier-name" id="tierName">BRONZE</span>
        `;
        containerTarget.appendChild(this.container);
    },

    updateDisplay(tier) {
        const image = document.getElementById('tierImage');
        const name = document.getElementById('tierName');

        if (image) image.src = TIER_CONFIG.images[tier];
        if (name) name.textContent = tier.toUpperCase();
    },

    async playUpgradeAnimation(oldTier, newTier) {
        const image = document.getElementById('tierImage');
        const name = document.getElementById('tierName');

        if (!image || !name) return;

        // 1단계: 현재 티어 페이드아웃 + 확대
        image.style.transition = 'all 0.6s ease-out';
        image.style.transform = 'scale(1.3)';
        image.style.opacity = '0';
        name.style.opacity = '0';

        await this.wait(300);

        // 2단계: 이미지 교체
        image.src = TIER_CONFIG.images[newTier];
        name.textContent = newTier.toUpperCase();

        // 3단계: 새 티어 등장 (작게 시작 → 정상 크기)
        image.style.transition = 'none';
        image.style.transform = 'scale(0.5)';
        image.style.opacity = '0';

        await this.wait(50);

        image.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        image.style.transform = 'scale(1)';
        image.style.opacity = '1';
        name.style.transition = 'opacity 0.5s ease-in 0.3s';
        name.style.opacity = '1';

        await this.wait(400);

        // 4단계: 반짝임 효과
        image.style.transition = 'filter 0.3s ease';
        for (let i = 0; i < 2; i++) {
            image.style.filter = 'brightness(1.5) drop-shadow(0 0 20px gold)';
            await this.wait(300);
            image.style.filter = 'brightness(1)';
            await this.wait(300);
        }
    },

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    async showUpgradeModal(newTier) {
        const modal = document.getElementById('upgradeModal');
        const imageContainer = document.querySelector('.upgrade-tier-display');
        const name = document.getElementById('upgradeTierName');

        if (!modal || !imageContainer || !name) {
            console.error("❌ 모달 요소 없음");
            return;
        }

        const tierKey = String(newTier).toLowerCase();
        const imagePath = TIER_CONFIG.images[tierKey];

        if (!imagePath) {
            console.error("❌ 이미지 경로 없음:", tierKey);
            return;
        }

        // 1. 먼저 모달 표시
        modal.classList.add('show');

        // 2. 이미지를 직접 생성하고 기다림
        imageContainer.innerHTML = `
                <img src="${imagePath}" alt="${tierKey}" class="upgrade-tier-image">
            `;
        name.textContent = tierKey.toUpperCase();

    }
};

// ==================== 승급 체크 로직 ====================
const TierUpgrade = {
    async checkUpgrade(questId, language) {
        try {
            const response = await fetch('/levelquest/check-tier-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId, language })
            });

            const result = await response.json();

            if (result.shouldUpgrade) {
                await this.performUpgrade(result.nextTier);
            }
        } catch (error) {
            console.error('승급 체크 실패:', error);
        }
    },

    async performUpgrade(nextTier) {
        const oldTier = TierState.currentTier;

        const success = await TierState.upgrade(nextTier);

        if (success) {
            await TierUI.playUpgradeAnimation(oldTier, nextTier);

            TierUI.showUpgradeModal(nextTier);

            await UserProgress.updateTier(nextTier);
        }
    }
};

async function fetchQuestsWithProgress() {
    try {
        await UserProgress.init(currentLanguage);
    } catch (error) {
        console.error('초기화 실패:', error);
    }
}

// renderQuest 대체
function renderQuest(i) {
    const quest = quest_list[i];

    const container = document.getElementById('quest-content');
    container.innerHTML = '';
    const pre = document.createElement('pre');
    pre.innerHTML = `⚔️ <strong>퀘스트 ${quest.quest_num}:</strong> ${quest.quest_title || ''}
📍 <strong>위치:</strong> ${quest.quest_location || ''}

<hr>
🧩 <strong>스토리</strong>
 ${quest.quest_story || ''}

<hr>
🎯 <strong>미션</strong>
 ${quest.quest_mission || ''}

<strong>입력 예시 :</strong>
${quest.input_example || ''}

<strong>출력 예시 :</strong>
${quest.language === 'html'
            ? `<img src="${quest.output_example || ''}" />`
            : `${quest.output_example || ''}`}`;
    container.appendChild(pre);

    UserProgress.updateProgressDisplay();
}

// 다음 문제
// function moveToNextQuest() {

//     const currentQuest = quest_list[currentIndex];

//     state.reset();
//     SubmitButton.setGrading();
//     NextButton.hide();
//     Output.clear();

//     if (currentIndex < quest_list.length - 1) {
//         currentIndex++;
//         const nextQuest = quest_list[currentIndex];

//         UserProgress.saveProgress(nextQuest.quest_num);
//         renderQuest(currentIndex);
//         editor.setValue(getDefaultCode(currentLanguage));

//         // 승급 체크
//         TierUpgrade.checkUpgrade(currentQuest.quest_ID, currentLanguage);
//     } else {
//         TierUpgrade.checkUpgrade(currentQuest.quest_ID, currentLanguage);
//         alert(CONFIG.MESSAGES.LAST_QUEST);
//     }
// }

// ==================== 초기화 ====================
window.addEventListener('DOMContentLoaded', () => {
    TierUI.init();
    fetchQuestsWithProgress();
});

// 전역 함수 (HTML onclick용)
window.closeUpgradeModal = () => {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.remove('show');
};