let selectedGuildName = null;
        let currentUserGuildName = "별의커비"; // 이미 가입된 길드 (예시)

        document.addEventListener("DOMContentLoaded", () => {
            const tableBody = document.querySelector(".guild-search-table tbody");
            const rows = tableBody.querySelectorAll("tr");

            // ✅ 검색 기능
            document.querySelector(".guild-search-button").addEventListener("click", () => {
                const searchValue = document.getElementById("guildNameInput").value.trim();
                let found = false;

                rows.forEach(row => {
                    const guildName = row.querySelector("td:nth-child(2)").textContent.trim();

                    if (searchValue === "" || guildName === searchValue) {
                        row.style.display = "";
                        found = true;
                    } else {
                        row.style.display = "none";
                    }
                });

                selectedGuildName = null;
                document.querySelectorAll(".selected-guild-row").forEach(r => r.classList.remove("selected-guild-row"));

                if (!found) {
                    alert(`"${searchValue}" 길드를 찾을 수 없습니다.`);
                }
            });

            // ✅ 테이블 클릭 → 선택
            rows.forEach(row => {
                row.style.cursor = "pointer";
                row.addEventListener("click", () => {
                    const guildName = row.querySelector("td:nth-child(2)").textContent.trim();

                    if (guildName === currentUserGuildName) {
                        alert(`이미 가입한 길드입니다`);
                        return;
                    }

                    rows.forEach(r => r.classList.remove("selected-guild-row"));
                    row.classList.add("selected-guild-row");
                    selectedGuildName = guildName;
                });
            });

            // ✅ 가입 버튼
            window.joinGuild = function () {
                if (!selectedGuildName) {
                    alert("가입할 길드를 먼저 선택하세요!");
                    return;
                }
                if (selectedGuildName === currentUserGuildName) {
                    alert(`이미 "${selectedGuildName}" 길드에 가입되어 있습니다.`);
                    return;
                }
                alert(`"${selectedGuildName}" 길드에 가입 요청을 보냈습니다!`);
            };
        });

        document.addEventListener("DOMContentLoaded", () => {
            const chatIcons = document.querySelectorAll(".chat-icon");
            const popup = document.getElementById("chatPopup");
            const closeBtn = document.getElementById("closeChatBtn");

            // 여러 말풍선 아이콘 클릭 시 채팅창 열기
            chatIcons.forEach(icon => {
                icon.addEventListener("click", () => {
                    popup.style.display = "block";
                });
            });

            // 닫기 버튼
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    popup.style.display = "none";
                });
            }
        });

        document.addEventListener("DOMContentLoaded", () => {
            const tableView = document.getElementById("table-view");
            const messageView = document.getElementById("guildMessagesSection");
            const buttons = document.querySelectorAll(".guild-message-btn");
            const onlineList = document.querySelector(".online-list");

            // 기본 상태 설정
            if (onlineList) onlineList.style.display = "none";

            window.showGuildView = function (type) {
                if (!tableView || !messageView || !buttons.length || !onlineList) {
                    console.error("필요한 요소를 찾지 못했습니다.");
                    return;
                }

                if (type === "table") {
                    tableView.style.display = "block";
                    messageView.style.display = "none";
                    buttons[0].classList.add("active");
                    buttons[1].classList.remove("active");
                    onlineList.style.display = "none";
                    console.log("[길드원] 접속중 숨김");
                } else {
                    tableView.style.display = "none";
                    messageView.style.display = "block";
                    buttons[0].classList.remove("active");
                    buttons[1].classList.add("active");
                    onlineList.style.display = "block";
                    console.log("[길드 메시지] 접속중 표시");
                }
            };
        });

        document.addEventListener("DOMContentLoaded", () => {
            const themeColors = {
                dark1: '#503E9A',
                dark2: '#3B3FC9',
                dark3: '#3C869C',
                light1: '#8661FF',
                light2: '#FFC5FE',
                light3: '#FFFC94',
                light4: '#8FE7B9'
            };

            const themeKey = localStorage.getItem("theme") || "dark1";
            const color = themeColors[themeKey];

            // CSS 변수로 설정
            document.documentElement.style.setProperty('--main-theme', color);

        });


// 길드 초대
document.querySelector(".guild-invite-button").addEventListener("click", () => {
    const nickname = prompt("초대할 유저 닉네임을 입력하세요:");
    if (!nickname) return;
    alert(`"${nickname}" 님에게 초대장을 보냈습니다.`);
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".guild-leave-button").addEventListener("click", () => {
        if (confirm("정말로 길드를 탈퇴하시겠습니까?")) {
            alert("길드를 탈퇴했습니다!");

            // 길드 정보 영역 숨기고 검색만 보이게 처리
            document.getElementById("table-view").style.display = "none";
            document.getElementById("guildMessagesSection").style.display = "none";
            document.getElementById("guildSearchPage").style.display = "block";

            // 탭 버튼 active 클래스 조정
            document.querySelectorAll(".guild-message-btn, .guild-search-btn")
                .forEach(btn => btn.classList.remove("active"));
            document.querySelector('button[onclick="showGuildView(\'search\')"]')?.classList.add("active");

            // 접속중 리스트 숨기기
            const onlineList = document.querySelector(".online-list");
            if (onlineList) onlineList.style.display = "none";

            // ✅ 길드원/메시지 버튼 비활성화
            document.querySelectorAll(".guild-message-btn").forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.5"; // 시각적으로도 흐리게
                btn.style.cursor = "not-allowed";
            });
        }
    });


});

document.addEventListener("DOMContentLoaded", () => {
    const rows = document.querySelectorAll(".guild-search-table tbody tr");

    // 검색 버튼 클릭 시 실행
    document.querySelector(".guild-search-button").addEventListener("click", () => {
        const searchValue = document.getElementById("guildNameInput").value.trim();

        rows.forEach(row => {
            const guildName = row.querySelector("td:nth-child(2)").textContent.trim();
            if (searchValue === "" || guildName === searchValue) {
                row.style.display = "";  // 보여줌
            } else {
                row.style.display = "none";  // 숨김
            }
        });

        // 선택된 상태 초기화
        document.querySelectorAll(".selected-guild-row").forEach(row => row.classList.remove("selected-guild-row"));
        selectedGuildName = null;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openChatBtn");
    const closeBtn = document.getElementById("closeChatBtn");
    const popup = document.getElementById("chatPopup");

    openBtn.addEventListener("click", () => {
        popup.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openChatBtn");
    const closeBtn = document.getElementById("closeChatBtn");
    const popup = document.getElementById("chatPopup");

    openBtn.addEventListener("click", () => {
        popup.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("sendMessageBtn");
    const input = document.getElementById("messageInput");
    const log = document.getElementById("messageLog");
    const currentUser = "지우"; // 원하는 이름으로 변경 가능

    sendBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) return;

        const lastItem = log.lastElementChild;
        const isMine = (el) =>
            el?.classList.contains("message-item") &&
            el.querySelector(".nickname")?.textContent === currentUser;

        if (isMine(lastItem)) {
            const bubble = document.createElement("div");
            bubble.className = "bubble";
            bubble.textContent = text;
            lastItem.appendChild(bubble);
        } else {
            const item = document.createElement("div");
            item.className = "message-item me";
            item.innerHTML = `
          <div class="nickname">${currentUser}</div>
          <div class="bubble">${text}</div>
        `;
            log.appendChild(item);
        }

        log.scrollTop = log.scrollHeight;
        input.value = "";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // 위 코드 여기 안에 넣어도 됨
});

function showGuildView(type) {
    const tableView = document.getElementById("table-view");
    const messageView = document.getElementById("guildMessagesSection");
    const buttons = document.querySelectorAll(".guild-message-btn");

    if (type === "table") {
        tableView.style.display = "block";
        messageView.style.display = "none";
        buttons[0].classList.add("active");
        buttons[1].classList.remove("active");
    } else {
        tableView.style.display = "none";
        messageView.style.display = "block";
        buttons[0].classList.remove("active");
        buttons[1].classList.add("active");
    }
}

function toggleView() {
    // 기존 메시지 토글 함수
}

const members = [
    { name: '코딩 짱', status: '접속 중', msg: '안녕하세요!', level: 27, java: 12, py: 16, js: 31, html: 22 },
    { name: '파이썬 천재', status: '5시간 전', msg: '파이썬은 사랑입니다', level: 33, java: 20, py: 77, js: 5, html: 44 },
    { name: '자바 조아', status: '1시간 전', msg: '파이팅', level: 46, java: 67, py: 11, js: 9, html: 13 },
    { name: '와플 먹고 싶다', status: '접속 중', msg: '', level: 6, java: 4, py: 9, js: 8, html: 1 },
    { name: '강아지', status: '접속 중', msg: '', level: 6, java: 4, py: 9, js: 8, html: 1 },
    { name: '고양이', status: '접속 중', msg: '', level: 6, java: 4, py: 9, js: 8, html: 1 },
    { name: '늑대', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '여우', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '곰', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '사슴', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '토끼', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '다람쥐', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '페럿', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '고양이', status: '접속 중', msg: '', level: 6, java: 4, py: 9, js: 8, html: 1 },
    { name: '늑대', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '여우', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '곰', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '사슴', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '토끼', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '다람쥐', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
    { name: '페럿', status: '접속 중', msg: '', level: 9, java: 5, py: 7, js: 10, html: 3 },
];

const itemsPerPage = 9;
let currentPage = 1;
const totalPages = Math.ceil(members.length / itemsPerPage);

function renderTable(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = members.slice(start, end);

    const tbody = document.querySelector(".guild-table tbody");
    tbody.innerHTML = "";

    pageItems.forEach(member => {
        const row = `
          <tr>
            <td>${member.name}</td>
            <td>${member.status}</td>
            <td>${member.msg}</td>
            <td>${member.level}</td>
            <td>${member.java}</td>
            <td>${member.py}</td>
            <td>${member.js}</td>
            <td>${member.html}</td>
            <td><select><option>길드원</option></select></td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
    });

    const emptyCount = itemsPerPage - pageItems.length;
    for (let i = 0; i < emptyCount; i++) {
        tbody.insertAdjacentHTML("beforeend", `<tr><td colspan="9" style="height:48px;"></td></tr>`);
    }
}

function setActivePageButton() {
    document.querySelectorAll(".page-btn").forEach(btn => {
        btn.classList.remove("active");
        const val = btn.dataset.page;
        if (!isNaN(val) && parseInt(val) === currentPage) {
            btn.classList.add("active");
        }
    });
}

function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderTable(currentPage);
        setActivePageButton();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".page-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const val = btn.dataset.page;
            if (val === "prev") {
                changePage(currentPage - 1);
            } else if (val === "next") {
                changePage(currentPage + 1);
            } else if (!isNaN(val)) {
                changePage(parseInt(val));
            }
        });
    });

    renderTable(currentPage);
    setActivePageButton();
});


renderTable(currentPage); // 첫 로딩 시 실행

document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const clickedPage = e.target.textContent;
        console.log('클릭된 페이지:', clickedPage);

        // 기존 active 제거
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        // 현재 버튼에 active 추가
        e.target.classList.add('active');

        const editBtn = document.getElementById("editBtn");
        const saveBtn = document.getElementById("saveBtn");
        const noticeDisplay = document.getElementById("noticeDisplay");
        const noticeEdit = document.getElementById("noticeEdit");
        const textarea = document.getElementById("noticeTextarea");

        editBtn.addEventListener("click", () => {
            noticeDisplay.style.display = "none";
            noticeEdit.style.display = "block";
        });

        saveBtn.addEventListener("click", () => {
            // 저장 내용 적용
            const lines = textarea.value.split("\n");
            noticeDisplay.innerHTML = lines.map(line => `<p>${line}</p>`).join("");
            noticeDisplay.style.display = "block";
            noticeEdit.style.display = "none";

            document.addEventListener("DOMContentLoaded", () => {
                const theme = localStorage.getItem("theme");
                if (theme) {
                    document.documentElement.style.setProperty('--main-theme', theme);

                    // 추가: 주요 섹션에도 배경색 직접 적용
                    document.body.style.backgroundColor = theme;
                    const home = document.querySelector(".home-section");
                    const sidebar = document.querySelector(".sidebar");
                    const header = document.querySelector(".header-section");
                    if (home) home.style.backgroundColor = theme;
                    if (sidebar) sidebar.style.backgroundColor = theme;
                    if (header) header.style.backgroundColor = theme;

                    
                }
            });
        }
        )
    }
    )
}
);
