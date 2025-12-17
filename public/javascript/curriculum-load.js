function loadChapter(chapterId) {
    const data = chapterContents[chapterId];
    if (!data) return alert("준비 중인 콘텐츠입니다.");

    const container = document.getElementById('content-container');
    const pageTitle = document.getElementById('page-title');

    // 1. 헤더 제목 변경
    pageTitle.innerText = data.title;

    // 2. 콘텐츠 HTML 생성
    let html = '';

    // 타입 A: 인트로 페이지 (1-1 스타일)
    if (data.type === 'intro') {
        let objectivesHtml = data.objectives.map(item => `<li>${item}</li>`).join('');
        
        html = `
            <div class="hero-section">
                <div class="hero-content">
                    <h2>${data.hero.title}</h2>
                    <p>${data.hero.desc}</p>
                    <button class="start-button" onclick="nextChapter('${chapterId}')">${data.hero.btnText}</button>
                </div>
                <div class="hero-image">
                    <div class="mascot"><img src="/images/Logo.png" class="mascot-img"></div>
                </div>
            </div>
            <div class="objectives-section">
                <div class="objective-card">
                    <h3><i class="fa-solid fa-bullseye"></i> 학습 목표</h3>
                    <ul>${objectivesHtml}</ul>
                </div>
            </div>`;
    } 
    // 타입 B: 카드 리스트 페이지 (1-2, 1-3, 1-4 스타일)
    else if (data.type === 'cards') {
        let cardsHtml = data.cards.map((card, index) => `
            <div class="feature-card" style="align-self: ${index % 2 === 0 ? 'flex-start' : 'flex-end'}">
                <h3>${card.title}</h3>
                <p>${card.desc}</p>
            </div>
        `).join('');

        html = `
            <div class="chapter-box">
                <div class="feature-header">
                    <h1>${data.headerTitle}</h1>
                    <p>${data.headerDesc}</p>
                </div>
                <div class="container" style="display:flex; flex-direction:column; gap:20px;">
                    ${cardsHtml}
                </div>
                <div style="margin-top:30px; display:flex; gap:20px;">
                     <button class="prev-button" onclick="prevChapter('${chapterId}')">←</button>
                     <button class="next-button" onclick="nextChapter('${chapterId}')">→</button>
                </div>
            </div>`;
    }

    // 3. 화면 주입
    container.innerHTML = html;
}