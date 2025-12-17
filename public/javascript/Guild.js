document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll('.tab-menu button');
  const tabContents = document.querySelectorAll('.tab-content');
  const input = document.getElementById("friendChatInput");
  const chatBody = document.getElementById("friendChatBody");
  const popup = document.getElementById("chatPopup");
  const openBtn = document.getElementById("openChatBtn");
  const closeBtn = document.getElementById("closeChatBtn");
  const chatIcons = document.querySelectorAll(".chat-icon");
  const chatTitle = document.querySelector(".chat-title");
  

  // ✅ showGuildView 함수
  window.showGuildView = function(type) {
    const tableView = document.getElementById("table-view");
    const messageView = document.getElementById("guildMessagesSection");
    const searchView = document.getElementById("guildSearchPage");
    const onlineList = document.querySelector(".online-list");

    document.querySelectorAll(".guild-message-btn, .guild-search-btn")
      .forEach(btn => btn.classList.remove("active"));

    if (tableView) tableView.style.display = "none";
    if (messageView) messageView.style.display = "none";
    if (searchView) searchView.style.display = "none";
    if (onlineList) onlineList.style.display = "none";

    if (type === "table") {
      if (tableView) tableView.style.display = "block";
      document.querySelector('button[onclick="showGuildView(\'table\')"]').classList.add("active");
    } else if (type === "message") {
      if (messageView) messageView.style.display = "block";
      if (onlineList) onlineList.style.display = "block";
      document.querySelector('button[onclick="showGuildView(\'message\')"]').classList.add("active");
    } else if (type === "search") {
      if (searchView) searchView.style.display = "block";
      document.querySelector('button[onclick="showGuildView(\'search\')"]').classList.add("active");
    }
  }

  let currentTarget = "";
  let chatHistory = {};

  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    try {
      chatHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error("불러오기 실패", e);
    }
  }
  

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-tab');

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
              <td>
                <select>
                  <option>길드 마스터</option>
                  <option>부길드 마스터</option>
                  <option>길드원</option>
                  <option>신입 길드원</option>
                </select>
              </td>
            </tr>
          `;
          tbody.insertAdjacentHTML("beforeend", row);
        });

        const emptyCount = itemsPerPage - pageItems.length;
        for (let i = 0; i < emptyCount; i++) {
          const emptyRow = `<tr><td colspan="9" style="height: 48px;"></td></tr>`;
          tbody.insertAdjacentHTML("beforeend", emptyRow);
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
        const totalPages = Math.ceil(members.length / itemsPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage;
          renderTable(currentPage);
          setActivePageButton();
        }
      }

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

      if (typeof onlineList !== "undefined") {
        onlineList.style.setProperty("display", "none", "important");
      }
    });
  });

  if (chatIcons.length > 0) {
    chatIcons.forEach(icon => {
      icon.addEventListener("click", () => {
        const friendItem = icon.closest("li");
        const nickname = friendItem.querySelector(".friends-nickname").textContent.trim();
        currentTarget = nickname;

        popup.style.display = "flex";

        if (chatTitle) {
          chatTitle.textContent = nickname;
        }

        const history = chatHistory[currentTarget] || [];
        chatBody.innerHTML = history.map(msg =>
          `<div class="message ${msg.from === 'me' ? 'user' : ''}">${msg.text}</div>`
        ).join("");

        setTimeout(() => {
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 0);
      });
    });
  }

  if (input && chatBody) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || !currentTarget) return;

        if (!chatHistory[currentTarget]) chatHistory[currentTarget] = [];
        chatHistory[currentTarget].push({ from: "me", text });

        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

        const msg = document.createElement("div");
        msg.className = "message user";
        msg.textContent = text;
        chatBody.appendChild(msg);

        input.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    });
  }

  if (openBtn && popup) {
    openBtn.addEventListener("click", () => {
      if (chatTitle && currentTarget) {
        chatTitle.textContent = currentTarget;
      }
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 0);
    });
  }

  if (closeBtn && popup) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  const joinRequestBtn = document.querySelector(".join-request-btn");
const joinRequestModal = document.getElementById("joinRequestModal");
const closeJoinModalBtn = document.getElementById("closeJoinRequestModal");
const requestList = document.getElementById("join-request-list");

const loadJoinRequests = () => {
  const data = JSON.parse(localStorage.getItem("guildJoinRequests")) || [];
  requestList.innerHTML = "";
  if (data.length === 0) {
    requestList.innerHTML = "신청 내역이 없습니다.";
  } else {
    data.forEach(req => {
      const li = document.createElement("li");
      li.textContent = `"${req.guildName}" 길드 신청일: ${req.date}`;
      requestList.appendChild(li);
    });
  }
};

joinRequestBtn?.addEventListener("click", () => {
  loadJoinRequests();
  joinRequestModal.style.display = "flex";
});

closeJoinModalBtn?.addEventListener("click", () => {
  joinRequestModal.style.display = "none";
});

});

// ✅ 검색 기능 이벤트 연결
window.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("guildSearchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const keyword = document.getElementById("guildSearchInput").value.trim();
      const searchResults = document.getElementById("searchGuildList");
      const noResults = document.getElementById("noResultsMessage");

      const guilds = ["코딩짱", "파이썬마스터", "HTML천재"];
      const matched = guilds.filter(name => name.includes(keyword));

      document.getElementById("guildListContainer").style.display = "none";
      document.getElementById("searchResultsContainer").style.display = "block";

      searchResults.innerHTML = "";
      if (matched.length === 0) {
        noResults.style.display = "block";
      } else {
        noResults.style.display = "none";
        matched.forEach(name => {
          const li = document.createElement("li");
          li.textContent = name;
          searchResults.appendChild(li);
        });
      }
    });
  }
});

