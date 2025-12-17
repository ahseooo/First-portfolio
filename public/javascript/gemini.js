// 설정 및 상수
const CONFIG = {
    API_URL: {
        STANDARD: '/gemini-api/grade',
        HTML: '/gemini-api/grade-html'
    },
    MESSAGES: {
        NO_EDITOR: "에디터가 초기화되지 않았습니다.",
        NO_CODE: "코드를 입력해주세요.",
        NO_FEEDBACK: "피드백 데이터가 없습니다.",
        LAST_QUEST: "축하드립니다. 현재 티어의 모든 퀘스트를 통과했습니다!",
        DEFAULT_OUTPUT: "여기에 실행 결과가 표시됩니다."
    }
};

// 상태 관리
const state = {
    isGraded: false,
    result: null,
    currentQuestScore: 0,
    badgeAcquired: false,
    badgeImageUrl: null,
    badgeName: null,

    setResult(result) {
        this.result = result;
        this.isGraded = true;
    },

    reset() {
        this.isGraded = false;
        this.result = null;
        // this.currentQuestScore = 0;
        this.badgeAcquired = false;     // 뱃지 획득 퀘스트가 아닌 경우
        this.badgeImageUrl = null;
        this.badgeName = null;
    },

    isPassed() {
        return this.result?.passedCount === this.result?.totalCount;
    }
};

// DOM 요소
const DOM = {
    elements: {},

    init() {
        this.elements = {
            submitBtn: document.getElementById("submit"),
            nextBtn: document.getElementById("next"),
            output: document.getElementById("output"),
            modal: document.getElementById("feedbackModal"),
            loading: document.getElementById("loadingOverlay"),
            feedbackSummary: document.getElementById("feedbackSummary"),
            strengthsList: document.getElementById("strengthsList"),
            improvementsSection: document.getElementById("improvementsSection"),
            improvementsList: document.getElementById("improvementsList"),
            suggestionsList: document.getElementById("suggestionsList"),
            scoreModal: document.getElementById("scoreModal"),
            scoreText: document.getElementById("scoreText"),
            scoreConfirmBtn: document.getElementById("scoreConfirmBtn")
        };
    },
    get(key) {
        return this.elements[key];
    }
};

// 로딩 UI
const Loading = {
    loading: null,
    init() {
        this.loading = DOM.get('loading');
    },
    show() {
        this.loading?.classList.remove("hidden");
    },
    hide() {
        this.loading?.classList.add("hidden");
    }
};

// 버튼 상태 관리
const SubmitButton = {
    submit: null,
    init() {
        this.submit = DOM.get('submitBtn');
    },
    setLoading() {
        if (!this.submit) return;
        this.submit.disabled = true;
        this.submit.textContent = "채점 중...";
    },

    setGrading() {
        if (!this.submit) return;
        this.submit.disabled = false;
        this.submit.textContent = "제출 후 채점하기";
        this.submit.classList.remove("graded");
    },

    setFeedback() {
        if (!this.submit) return;
        this.submit.disabled = false;
        this.submit.textContent = "피드백 보기";
        this.submit.classList.add("graded");
    },

    setRetry() {
        if (!this.submit) return;
        this.submit.disabled = false;
        this.submit.textContent = "재시도";
    }
};

// 점수 모달 관리
const ScoreModal = {
    show(score) {
        const modal = document.getElementById('scoreModal');
        const text = document.getElementById('scoreText');

        if (!modal) {
            console.error("❌ scoreModal 요소를 찾을 수 없습니다.");
            return;
        }

        if (text) text.textContent = score;

        // 강제로 보이기 처리
        modal.classList.add('show');
        modal.style.display = 'flex';
    },

    close() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            // console.log("👋 점수 모달 닫힘");
        }
    }
};

// 뱃지 모달 관리
const BadgeModal = {
    show() {
        const modal = document.getElementById('badgeModal');
        const imgElement = document.getElementById('dynamicBadgeImage');
        const nameBelowImage = modal.querySelector('.badge-display .tier-name');
        const badgeNameElement = document.getElementById('dynamicBadgeName');

        if (imgElement) {
            imgElement.src = state.badgeImageUrl || "/images/logo.png";
            imgElement.alt = state.badgeName || '획득 뱃지';
        }

        if (nameBelowImage && state.badgeName) {
            nameBelowImage.textContent = state.badgeName;
        }

        if (badgeNameElement && state.badgeName) {
            badgeNameElement.textContent = `[${state.badgeName}]`;
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
    },
    close() {
        const modal = document.getElementById('badgeModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
};

const NextButton = {
    next: null,
    init() {
        this.next = DOM.get('nextBtn');
    },
    show() {
        this.next?.classList.remove("hidden");
    },
    hide() {
        this.next?.classList.add("hidden");
    }
};

// 출력 렌더링
const Output = {
    output: null,
    init() {
        this.output = DOM.get('output');
    },
    showResult(result) {
        if (!this.output) return;

        const lines = [
            `📊 채점 결과: ${result.passedCount} / ${result.totalCount} 통과`,
            '',
            ...this._formatTests(result.results),
            '',
            this._getStatusMessage(result)
        ];

        this.output.textContent = lines.join('\n');
        this.output.style.display = 'block';
    },

    showError(message) {
        if (!this.output) return;
        this.output.textContent = `❌ ${message}`;
        this.output.style.display = 'block';
    },

    clear() {
        if (!this.output) return;
        this.output.textContent = CONFIG.MESSAGES.DEFAULT_OUTPUT;
    },

    _formatTests(results) {
        return results.map((test, index) => {
            const icon = test.passed ? '✅' : '❌';
            let text = `${icon} 테스트 ${index + 1}: ${test.description}`;

            if (!test.passed) {
                text += `\n    예상: ${test.expected}\n    실제: ${test.actual}`;
            }

            return text;
        });
    },

    _getStatusMessage(result) {
        return result.passedCount === result.totalCount
            ? '🎉 모든 테스트를 통과했습니다! 피드백을 확인하세요.'
            : '⚠️ 모든 테스트를 통과해야 다음 문제로 넘어갈 수 있습니다!';
    }
};

// 피드백 모달
const FeedbackModal = {
    elements: {
        modal: null,
        summary: null,
        strengths: null,
        improvementsSection: null,
        improvementsList: null,
        suggestions: null,
    },

    init() {
        this.elements.modal = DOM.get('modal');
        this.elements.summary = DOM.get('feedbackSummary');
        this.elements.strengths = DOM.get('strengthsList');
        this.elements.improvementsSection = DOM.get('improvementsSection');
        this.elements.improvementsList = DOM.get('improvementsList');
        this.elements.suggestions = DOM.get('suggestionsList');
    },

    open() {
        const feedback = state.result?.feedback;
        if (!feedback) {
            alert(CONFIG.MESSAGES.NO_FEEDBACK);
            return;
        }

        this.renderSummary(feedback.summary);
        this.renderStrengths(feedback.strengths);
        this.renderImprovements(feedback.improvements);
        this.renderSuggestions(feedback.suggestions);

        this.elements.modal?.classList.remove("hidden");
    },

    close() {
        this.elements.modal?.classList.add("hidden");
    },

    renderSummary(text) {
        if (this.elements.summary) this.elements.summary.textContent = text;
    },

    renderStrengths(items) {
        const list = this.elements.strengths;
        if (!list) return;
        list.innerHTML = "";
        items.forEach(item => {
            list.appendChild(this.createListItem(item, 'check'));
        });
    },

    renderImprovements(items) {
        const section = this.elements.improvementsSection;
        const list = this.elements.improvementsList;
        if (!section || !list) return;

        if (items.length > 0) {
            section.style.display = "block";
            list.innerHTML = "";
            items.forEach(item => {
                list.appendChild(this.createListItem(item, 'info'));
            });
        } else {
            section.classList.add("hidden");
        }
    },

    renderSuggestions(items) {
        const list = this.elements.suggestions;
        if (!list) return;
        list.innerHTML = "";
        items.forEach(item => {
            list.appendChild(this.createListItem(item, 'emoji'));
        });
    },

    createListItem(text, type) {
        const li = document.createElement("li");

        const icons = {
            check: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            info: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            emoji: '<span class="emoji">💡</span>'
        };

        const span = document.createElement("span");
        span.textContent = text;

        li.innerHTML = icons[type];
        li.appendChild(span);

        return li;
    }
};

// API 통신
const API = {
    async gradeHTML(code, testCases, currentLanguage) {
        const response = await fetch(CONFIG.API_URL.HTML, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                testCases: testCases,
                language: currentLanguage
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`서버 오류 (${response.status}): ${errData.error || response.statusText}`);
        }

        // 응답 body가 비어있는지 체크
        // const text = await response.text();
        // if (!text || text.trim() === '') {
        //     throw new Error('서버로부터 빈 응답을 받았습니다.');
        // }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    },

    async gradeStandard(code, testCases, currentLanguage) {
        const response = await fetch(CONFIG.API_URL.STANDARD, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                testCases: testCases,
                language: currentLanguage
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`서버 오류 (${response.status}): ${errData.error || response.statusText}`);
        }

        // const text = await response.text();
        // if (!text || text.trim() === '') {
        //     throw new Error('서버로부터 빈 응답을 받았습니다.');
        // }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    },

    async saveScoreAndProgress(questId, score, language) {
        try {
            const response = await fetch('/levelquest/save-score-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questId: questId,
                    score: score,
                    language: language
                })
            });

            if (!response.ok) {
                throw new Error('점수 및 진행도 저장 실패');
            }
            return await response.json();
        } catch (error) {
            console.error('저장 중 오류:', error);
            throw error;
        }
    }
};

// 언어 타입 판별
function getGradingType(language) {
    return language.toLowerCase() === 'html' ? 'html' : 'standard';
}

// 채점 로직
async function runGrading() {
    if (!editor) {
        alert(CONFIG.MESSAGES.NO_EDITOR);
        return;
    }

    const code = editor.getValue().trim();
    if (!code) {
        alert(CONFIG.MESSAGES.NO_CODE);
        return;
    }

    const currentQuest = quest_list[currentIndex];
    const testCases = currentQuest.test_cases;

    if (!testCases || testCases.length === 0) {
        alert('이 문제에는 테스트케이스가 설정되어 있지 않습니다.');
        return;
    }

    SubmitButton.setLoading();
    Loading.show();

    try {
        const gradeType = getGradingType(currentLanguage);
        let result;

        if (gradeType === 'html') {
            result = await API.gradeHTML(code, testCases, currentLanguage);
        }
        else {
            result = await API.gradeStandard(code, testCases, currentLanguage);
        }

        state.setResult(result);
        Output.showResult(result);

        if (state.isPassed()) {
            const currentQuest = quest_list[currentIndex];
            // const tier = currentQuest.tier || 'bronze';
            const score = currentQuest.quest_score || 0;

            // console.log("저장 요청:", tier, currentLanguage);

            const response = await API.saveScoreAndProgress(currentQuest.quest_ID, score, currentLanguage);

            state.badgeAcquired = response.badgeAcquired;
            state.badgeImageUrl = response.badgeImageUrl || null;
            state.badgeName = response.badgeName || '코딩의 첫걸음';

            SubmitButton.setFeedback();
            NextButton.show();

            // 점수 모달 표시
            ScoreModal.show(score);
        } else {
            SubmitButton.setGrading();
            NextButton.hide();
        }

    } catch (error) {
        console.error("채점 오류:", error);
        Output.showError(`채점 중 오류가 발생했습니다: ${error.message}`);
        SubmitButton.setRetry();
    } finally {
        Loading.hide();
    }
}

// 점수 획득 버튼 클릭 핸들러
async function handleScoreConfirm() {
    try {
        const currentQuest = quest_list[currentIndex];

        await API.saveScoreAndProgress(
            currentQuest.quest_ID,
            state.currentQuestScore,
            currentLanguage
        );

        ScoreModal.close();

        // 승급 체크
        TierUpgrade.checkUpgrade(currentQuest.quest_ID, currentLanguage);

    } catch (error) {
        console.error('점수 저장 오류:', error);
        alert('점수 저장 중 오류가 발생했습니다.');
    }
}

// 다음 문제 이동 (렌더링만)
function moveToNextQuest() {
    state.reset();
    SubmitButton.setGrading();
    NextButton.hide();
    Output.clear();

    if (currentIndex < quest_list.length - 1) {
        currentIndex++;
        // const nextQuest = quest_list[currentIndex];

        renderQuest(currentIndex);
        editor.setValue(getDefaultCode(currentLanguage));
    } else {
        alert(CONFIG.MESSAGES.LAST_QUEST);
    }
}

// 이벤트 핸들러
async function handleSubmit() {
    if (state.isGraded && state.isPassed()) {
        FeedbackModal.open();
    } else {
        await runGrading();
    }
}

function handleNextQuest() {
    moveToNextQuest();
}

function handleModalClick(e) {
    if (e.target === FeedbackModal.elements.modal) {
        FeedbackModal.close();
    }
}

// 초기화
function initialize() {
    DOM.init();
    Loading.init();
    SubmitButton.init();
    NextButton.init();
    Output.init();
    FeedbackModal.init();

    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'scoreConfirmBtn') {
            e.preventDefault(); // 기본 동작 방지
            // console.log('🖱️ 점수 획득 버튼 클릭 감지됨! (전역 리스너)');
            ScoreModal.close();

            if (state.badgeAcquired) {
                setTimeout(() => {
                    BadgeModal.show();
                    state.badgeAcquired = false; // 띄웠으니 상태 초기화 (중복 방지)
                }, 300);
            }
        }

        if (e.target && e.target.id === 'badgeConfirmBtn') {
            e.preventDefault();
            BadgeModal.close();
        }
    });

    SubmitButton.submit?.addEventListener("click", handleSubmit);
    NextButton.next?.addEventListener("click", handleNextQuest);
    FeedbackModal.elements.modal?.addEventListener("click", handleModalClick);

    // 점수 확인 버튼 이벤트
    scoreConfirmBtn?.addEventListener('click', handleScoreConfirm);

    console.log('✅ Gemini 채점 시스템 초기화 완료');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

window.closeFeedback = () => FeedbackModal.close();