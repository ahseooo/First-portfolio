document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-friend-close");
  const input = document.querySelector(".add-friends input");
  const friendList = document.getElementById("f-list");

  const popup = document.getElementById("chatPopup");
  const chatBody = document.getElementById("friendChatBody");
  const chatTitle = document.querySelector(".chat-title");
  const chatInput = document.getElementById("friendChatInput");
  const closeBtn = document.getElementById("closeChatBtn");
  const sendBtn = document.getElementById("sendChatBtn");

  let currentTarget = "";
  let chatHistory = {};
  let friends = JSON.parse(localStorage.getItem("friendList")) || [];

  const saveFriends = () => {
    localStorage.setItem("friendList", JSON.stringify(friends));
  };

  const saveChat = () => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  };

  const renderFriend = (friend) => {
    const li = document.createElement("li");

    li.innerHTML = `
  <div class="friend-left">
    <span class="onOff-dot"><i class="fa-solid fa-circle-dot"></i></span>
    <span class="friends-nickname">${friend.nickname}</span>
    <span class="favorite-icon">${friend.favorite ? '⭐' : '☆'}</span>
  </div>
  <div class="friend-right">
    <span class="chat-icon"><i class="fa-solid fa-message"></i></span>
    <span class="delete-icon"><i class="fa-solid fa-xmark"></i></span>
  </div>
`;




    // 즐겨찾기 버튼 클릭 이벤트
    li.querySelector(".favorite-icon").addEventListener("click", () => {
      friend.favorite = !friend.favorite;
      saveFriends();
      renderAllFriends();
    });

    // 삭제 버튼 기능
    li.querySelector(".delete-icon").addEventListener("click", () => {
      const confirmDelete = confirm(`${friend.nickname}님을 삭제하시겠습니까?`);
      if (confirmDelete) {
        friendList.removeChild(li);
        friends = friends.filter(f => f.nickname !== friend.nickname);
        saveFriends();
      }
    });

    // 채팅 버튼 기능
    li.querySelector(".chat-icon").addEventListener("click", () => {
      currentTarget = friend.nickname;
      popup.style.display = "flex";
      if (chatTitle) chatTitle.textContent = friend.nickname;

      const history = chatHistory[currentTarget] || [];
      chatBody.innerHTML = history.map(msg =>
        `<div class="message ${msg.from === 'me' ? 'user' : ''}">${msg.text}</div>`
      ).join("");

      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 0);
    });

    friendList.appendChild(li);
  };

  const renderAllFriends = () => {
    friendList.innerHTML = "";
    const sorted = [
      ...friends.filter(f => f.favorite),
      ...friends.filter(f => !f.favorite)
    ];
    sorted.forEach(renderFriend);
  };

  const addFriend = () => {
    const nickname = input.value.trim();
    if (!nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (friends.some(f => f.nickname === nickname)) {
      alert("이미 추가된 친구입니다.");
      return;
    }

    const newFriend = { nickname, favorite: false };
    friends.push(newFriend);
    saveFriends();

    chatHistory[nickname] = [];
    saveChat();

    renderAllFriends();
    input.value = "";
  };

  // 이벤트 핸들러
  addBtn?.addEventListener("click", addFriend);
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFriend();
  });

  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || !currentTarget) return;

      if (!chatHistory[currentTarget]) chatHistory[currentTarget] = [];
      chatHistory[currentTarget].push({ from: "me", text });
      saveChat();

      const msg = document.createElement("div");
      msg.className = "message user";
      msg.textContent = text;
      chatBody.appendChild(msg);

      chatInput.value = "";
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  });

  sendBtn?.addEventListener("click", () => {
    const text = chatInput.value.trim();
    if (!text || !currentTarget) return;

    if (!chatHistory[currentTarget]) chatHistory[currentTarget] = [];
    chatHistory[currentTarget].push({ from: "me", text });
    saveChat();

    const msg = document.createElement("div");
    msg.className = "message user";
    msg.textContent = text;
    chatBody.appendChild(msg);

    chatInput.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;
  });

  closeBtn?.addEventListener("click", () => {
    popup.style.display = "none";
  });

  document.querySelectorAll(".fa-user-plus").forEach(icon => {
    icon.addEventListener("click", () => {
      const container = icon.closest(".friends");
      container?.classList.toggle("openSearching");
    });
  });

  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    try {
      chatHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error("채팅 기록 불러오기 실패", e);
    }
  }

  renderAllFriends();
});
