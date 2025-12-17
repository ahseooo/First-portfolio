/* =========================================
   메인 대시보드 이벤트 위젯 전용 스크립트
   ========================================= */

// 1. 보상 받기 함수 (HTML onclick 속성에서 호출됨)
function claimReward(button) {
    // 1-1. 사용자 알림
    alert("🎉 보상을 수령했습니다!");

    // 1-2. 버튼 비활성화 처리 (목록에서 삭제하지 않고 '완료' 상태로 변경)
    button.textContent = "수령 완료";
    button.disabled = true;
    button.classList.add("disabled");
    
    // 스타일 변경 (CSS .disabled 클래스 활용)
    button.style.background = "#cbd5e0";
    button.style.cursor = "not-allowed";

    // 만약 목록에서 아예 지우고 싶다면 아래 주석을 해제하세요.
    /*
    const item = button.closest('.event-item');
    if (item) {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300); // 부드럽게 삭제
    }
    */
}

// 2. 검색 기능 및 초기화 (DOM 로드 후 실행)
document.addEventListener("DOMContentLoaded", () => {
    
    const searchInput = document.querySelector(".dashboard-event-widget .event-search");
    const eventList = document.querySelector(".dashboard-event-widget .event-list");
    const eventItems = document.querySelectorAll(".dashboard-event-widget .event-item");

    // 검색창이 존재할 때만 실행
    if (searchInput && eventList) {
        searchInput.addEventListener("keyup", (e) => {
            const searchText = e.target.value.toLowerCase(); // 대소문자 구분 없이 검색

            let hasResult = false;

            eventItems.forEach(item => {
                const text = item.querySelector("span").textContent.toLowerCase();
                
                if (text.includes(searchText)) {
                    item.style.display = "flex"; // 검색어 포함되면 보임
                    hasResult = true;
                } else {
                    item.style.display = "none"; // 포함 안 되면 숨김
                }
            });

            // 검색 결과가 없을 때 메시지 처리 (선택 사항)
            // 기존에 '검색 결과 없음' 메시지가 없다면 생성
            let noResultMsg = eventList.querySelector(".no-result");
            if (!hasResult) {
                if (!noResultMsg) {
                    noResultMsg = document.createElement("div");
                    noResultMsg.className = "no-result";
                    noResultMsg.textContent = "검색 결과가 없습니다.";
                    noResultMsg.style.textAlign = "center";
                    noResultMsg.style.color = "#718096";
                    noResultMsg.style.padding = "20px";
                    noResultMsg.style.fontSize = "14px";
                    eventList.appendChild(noResultMsg);
                }
            } else {
                if (noResultMsg) noResultMsg.remove();
            }
        });
    }
});