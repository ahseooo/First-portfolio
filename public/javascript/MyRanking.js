// 1. 데이터 로드 및 API 통신 관련 함수

// 뱃지 데이터 로드 (DB에서 가져오기)
async function loadBadgeImages(languageName = null) {
    try {
        let url = '/badge/api/badges';

        if (languageName) {
            url += `?language=${encodeURIComponent(languageName)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('서버가 JSON이 아닌 응답을 반환했습니다.');
            return [];
        }

        const badges = await response.json();
        console.log('로드된 뱃지:', badges);
        return badges;

    } catch (error) {
        console.error('뱃지 로드 실패:', error);
        return [];
    }
}

// 사용자 ID 가져오기 (세션)
async function getUserId() {
    try {
        const response = await fetch('/badge/api/user/session');
        if (!response.ok) return null;

        const data = await response.json();
        return data.userId; // 이메일 반환
    } catch (error) {
        console.error('사용자 ID 조회 실패:', error);
        return null;
    }
}

// 2. UI 렌더링 관련 함수 (모달)

// 뱃지 선택 그리드 렌더링

function renderBadgeGrid(badges, currentBadgeNames = []) {
    const grid = document.getElementById('badgeSelectionGrid');
    grid.innerHTML = '';

    // 뱃지가 없을 경우 안내 UI 표시
    if (!badges || badges.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-container">
                <i class="fa-solid fa-layer-group empty-state-icon"></i>
                <p class="empty-state-title">선택 가능한 뱃지가 없습니다.</p>
                <p class="empty-state-desc">퀘스트를 완료하여 뱃지를 획득해보세요!</p>
            </div>
        `;
        return;
    }

    // 1. 현재 선택된 뱃지 ID들을 순서대로 관리하는 배열 (문자열로 변환)
    let selectedNames = [...currentBadgeNames];

    badges.forEach(badge => {
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-selection-item';

        // 데이터셋에 ID와 이름을 모두 저장
        badgeItem.dataset.badgeId = badge.id;
        badgeItem.dataset.badgeName = badge.badge_name;

        // HTML 구조 생성 (숫자 표시용 .selection-order 추가)
        badgeItem.innerHTML = `
            <div class="selection-order"></div>
            <img src="${badge.badge_image_url}" alt="${badge.badge_name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><circle cx=%2225%22 cy=%2225%22 r=%2220%22 fill=%22%23ddd%22/></svg>'">
            <span>${badge.badge_name}</span>
        `;

        // 클릭 이벤트
        badgeItem.addEventListener('click', function () {
            const name = this.dataset.badgeName;

            if (selectedNames.includes(name)) {
                // 이미 선택된 경우 -> 배열에서 제거 (선택 해제)
                selectedNames = selectedNames.filter(n => n !== name);
            } else {
                // 선택 안 된 경우 -> 추가 (최대 5개)
                if (selectedNames.length >= 5) {
                    alert('뱃지는 최대 5개까지 선택 가능합니다.');
                    return;
                }
                selectedNames.push(name);
            }

            // ★ 핵심: 데이터가 변경되었으니 화면(Visual)을 갱신
            updateSelectionVisuals(selectedNames);
        });

        grid.appendChild(badgeItem);
    });

    updateSelectionVisuals(selectedNames);
}

// 선택 상태 시각화 (번호 매기기)
function updateSelectionVisuals(selectedNames) {
    const grid = document.getElementById('badgeSelectionGrid');
    const allItems = grid.querySelectorAll('.badge-selection-item');

    allItems.forEach(item => {
        const name = item.dataset.badgeName;
        const orderIndex = selectedNames.indexOf(name); // 배열 내 인덱스 확인

        const orderBadge = item.querySelector('.selection-order');

        if (orderIndex !== -1) {
            // 선택됨: 클래스 추가 및 번호 표시 (1부터 시작)
            item.classList.add('selected');
            orderBadge.textContent = orderIndex + 1;
        } else {
            // 선택 안됨
            item.classList.remove('selected');
            orderBadge.textContent = '';
        }
    });
}

// 3. 모달 제어 함수

// 모달 열기
async function openBadgeModal(editBtn) {
    const modal = document.getElementById('badgeModal');
    const langCard = editBtn.closest('.lang-card');

    // progress_id 검증
    const progressId = langCard.dataset.progressId;
    const langName = langCard.dataset.lang;

    modal.style.display = 'flex';
    modal.dataset.currentCard = progressId;
    modal.dataset.currentLang = langName;

    // if (!progressId || progressId === '' || progressId === 'undefined') {
    //     console.warn(`[${langName}] 언어 데이터(ID)가 아직 로드되지 않았습니다.`);
    // }

    // 현재 장착된 뱃지들의 '이름' 수집
    const currentBadgeSlots = langCard.querySelectorAll('.badge.earned');
    const currentBadgeNames = Array.from(currentBadgeSlots)
        .map(slot => slot.dataset.badgeName) // updateBadgeDisplay에서 심어둔 이름
        .filter(name => name !== undefined);

    // 해당 언어의 뱃지 목록 서버 요청
    const badges = await loadBadgeImages(langName);
    renderBadgeGrid(badges, currentBadgeNames);
}

// 모달 닫기
function closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    modal.style.display = 'none';
}

// 4. 데이터 저장 및 업데이트

// 뱃지 업데이트
async function saveBadges(progressId, selectedBadgeIds) {
    // progressId 검증
    if (!progressId || progressId === 'undefined') {
        alert('언어 정보가 올바르지 않습니다.');
        return;
    }

    try {
        // 서버에는 ID 배열을 전송 (백엔드가 ID로 이름을 찾아 저장하도록 되어 있음)
        const response = await fetch(`/badge/api/user/language/${progressId}/badges`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ badgeIds: selectedBadgeIds })
        });

        const result = await response.json();

        if (response.ok) {
            alert('뱃지가 업데이트되었습니다!');

            await loadUserBadges();
        } else {
            alert(result.error || '뱃지 업데이트 실패');
        }
    } catch (error) {
        console.error('뱃지 업데이트 실패:', error);
        alert('서버 오류가 발생했습니다.');
    }
}

// 뱃지 표시 업데이트
async function updateBadgeDisplay(langCard, badgeList) {
    const badgeGrid = langCard.querySelector('.badge-grid');
    if (!badgeGrid) return;

    // 모든 뱃지 초기화
    const badges = badgeGrid.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.classList.remove('earned');
        badge.innerHTML = '';
        delete badge.dataset.badgeName;
    });

    // 뱃지 데이터가 없으면 리턴
    if (!badgeList || badgeList.length === 0) return;

    // 선택된 뱃지만 표시
    // const allBadges = await loadBadgeImages();
    // const selectedBadges = badgeIds
    //     .map(id => selectedBadges.find(b => String(b.id) === String(id)))
    //     .filter(b => b !== undefined);

    // 3. 이미지 태그 생성 및 삽입
    badgeList.forEach((badgeData, index) => {
        if (index < badges.length) {
            const badgeSlot = badges[index];
            badgeSlot.classList.add('earned');
            badgeSlot.dataset.badgeName = badgeData.badge_name;

            const img = document.createElement('img');
            img.src = badgeData.badge_image_url;
            img.alt = badgeData.badge_name;

            img.onerror = function () {
                this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2250%22><circle cx=%2225%22 cy=%2225%22 r=%2220%22 fill=%22%23ddd%22/></svg>';
            };

            badgeSlot.appendChild(img);
        }
    });
}

// 5. 메인 로직 (페이지 로드)
async function loadUserBadges() {
    const userId = await getUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    try {
        // 서버에서 데이터 가져오기 (점수, 백분율, 뱃지 포함)
        const response = await fetch(`/badge/api/user/${userId}/languages`);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const languages = await response.json();

        if (languages.length === 0) {
            console.warn('저장된 언어 진행률이 없습니다.');
            return;
        }

        for (const lang of languages) {
            const langName = lang.language_name;
            const langCard = document.querySelector(`.lang-card[data-lang="${langName}"]`);

            if (langCard) {
                // 1. progress_id 주입 (뱃지 저장 시 사용)
                langCard.dataset.progressId = lang.progress_id;

                // 2. 레벨/등수 텍스트 업데이트 (있는 경우)
                const rankText = langCard.querySelector('.lang-rank');
                if (rankText) {
                    // current_rank가 있으면 등수, 없으면 Unranked
                    rankText.textContent = lang.current_rank ? `${lang.current_rank} 위` : 'Unranked';
                }

                // 3. 퀘스트 진행률 업데이트
                const percentText = langCard.querySelector('.progress-value');
                const progressBar = langCard.querySelector('.progress-bar-fill');

                if (percentText) percentText.textContent = `${lang.progress_percent}%`;
                if (progressBar) progressBar.style.width = `${lang.progress_percent}%`;

                // 4. 뱃지 표시 (JSON 객체 배열을 그대로 전달)
                if (lang.badges && lang.badges.length > 0) {
                    await updateBadgeDisplay(langCard, lang.badges);
                }
            }
        }
    } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', async function () {
    // 페이지 로드 시 저장된 뱃지 표시
    await loadUserBadges();

    // 편집 버튼 클릭 이벤트
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openBadgeModal(this);
        });
    });

    // 모달 닫기 이벤트
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('close-btn') ||
            e.target.classList.contains('cancel-btn') ||
            e.target.id === 'badgeModal') {
            closeBadgeModal();
        }
    });

    // 저장 버튼
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('confirm-btn')) {

            // 선택된 아이템들 수집
            const selectedItems = Array.from(document.querySelectorAll('.badge-selection-item.selected'));

            if (selectedItems.length > 0) {
                // 순서 정렬: selection-order 안의 텍스트(숫자)를 기준으로 오름차순 정렬
                selectedItems.sort((a, b) => {
                    const numA = parseInt(a.querySelector('.selection-order').textContent);
                    const numB = parseInt(b.querySelector('.selection-order').textContent);
                    return numA - numB;
                });

                const modal = document.getElementById('badgeModal');
                const progressId = modal.dataset.currentCard;
                const badgeIds = selectedItems.map(badge => badge.dataset.badgeId);

                saveBadges(progressId, badgeIds);
                closeBadgeModal();
            } else {
                alert('뱃지를 1개 이상 선택해주세요.');
            }
        }
    });
});