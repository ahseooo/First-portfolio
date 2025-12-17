// DB에서 문제 불러오기
let quest_list = [];
let currentIndex = 0;

async function fetchQuests() {
    try {
        const response = await fetch('/levelquest/questList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify ({
                language: currentLanguage
            })
        });

        quest_list = await response.json();
        currentIndex = 0;

        const container = document.getElementById('quest-content');

        if (quest_list.length === 0) {
            container.innerHTML = '<pre>등록된 문제가 없습니다.</pre>';
            return;
        }
        renderQuest(currentIndex);
    }
    catch (error) {
        console.error('문제 불러오기 실패:', error);
        console.log('문제를 불러오는 데 실패했습니다.');
    }
}

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

    const currentProgress = document.getElementById('quest-progress');
    currentProgress.textContent = `QUEST ${i + 1} / ${quest_list.length}`;
}

window.addEventListener('DOMContentLoaded', () => {
    fetchQuests();
});