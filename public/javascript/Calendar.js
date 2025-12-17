const calendarBody = document.getElementById("calendarBody");
const monthYear = document.getElementById("monthYear");
const memoModal = document.getElementById("memoModal");

let currentDate = new Date();
currentDate.setDate(1);

const TODAY = new Date();

// API 엔드포인트 설정
const API_BASE_URL = '/calendar'; // 실제 API 주소로 변경 필요

let globalAttendanceData = {};

/* 캘린더 */
async function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    calendarBody.innerHTML = "";
    monthYear.textContent = `${date.toLocaleString("default", { month: "long" })} ${year}`;

    // 해당 월의 출석 데이터 조회
    const attendanceData = await fetchMonthlyAttendance(year, month + 1);
    const memoData = await fetchMonthlyMemos(year, month + 1);

    let row = document.createElement("tr");
    const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();
    const todayDate = TODAY.getDate();

    // 1일 시작 전 빈 칸
    for (let i = 0; i < firstDay; i++) {
        row.innerHTML += "<td></td>";
    }

    for (let day = 1; day <= lastDate; day++) {
        const cell = document.createElement("td");

        // 날짜 숫자
        const dayNumberSpan = document.createElement("span");
        dayNumberSpan.classList.add("day-number");
        dayNumberSpan.textContent = day;
        cell.appendChild(dayNumberSpan);

        const currentMonthNum = month + 1;
        const dateKey = getDateKey(year, currentMonthNum, day);

        // 출석 상태 반영 (배경색 변경)
        if (attendanceData[dateKey]) {
            cell.classList.add("attended-day");
        }

        // 메모 아이콘
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("icon-container");

        if (memoData[dateKey]) {
            const memoIcon = document.createElement("i");
            memoIcon.className = "fa-solid fa-note-sticky memo-icon";
            iconContainer.appendChild(memoIcon);
        }

        if (iconContainer.childNodes.length > 0) {
            cell.appendChild(iconContainer);
        }

        // 오늘 날짜 처리
        if (isCurrentMonth && day === todayDate) {
            cell.classList.add("today");

            if (!attendanceData[dateKey]) {
                const controls = document.createElement("div");
                controls.classList.add("attendance-controls");

                const button = document.createElement("button");
                button.classList.add("btn-attended");
                button.textContent = "출석";
                button.addEventListener("click", (e) => {
                    e.stopPropagation();
                    openAttendanceModal(day);
                });

                controls.appendChild(button);
                cell.appendChild(controls);
                cell.addEventListener("click", () => openAttendanceModal(day));
            }
        }

        // 우클릭 메모
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            const isTodayCell = isCurrentMonth && day === todayDate;
            const hasAttended = attendanceData[dateKey];
            
            if (isTodayCell && !hasAttended) {
                alert("오늘 출석체크를 먼저 해주세요!\n출석 후 메모를 작성할 수 있습니다.");
                return; // 함수 종료 (openMemo 실행 안 됨)
            }

            openMemo(day);
        });

        row.appendChild(cell);

        // 주 단위 줄바꿈
        if ((firstDay + day) % 7 === 0 || day === lastDate) {
            calendarBody.appendChild(row);
            row = document.createElement("tr");
        }
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
}

// 로그인 체크
function checkLoginRequired(response) {
    if (response.status === 401) {
        if(confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
            window.location.href = "/sign_in";
        }
        return true; 
    }
    return false;
}

/* API 통신 함수들 */
async function fetchMonthlyAttendance(year, month) {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/${year}/${month}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // 세션 쿠키 포함
        });

        if (checkLoginRequired(response)) return {};

        if (!response.ok) throw new Error('출석 데이터 조회 실패');

        return await response.json();
    } catch (error) {
        console.error('출석 데이터 조회 오류:', error);
        return {};
    }
}

async function fetchMonthlyMemos(year, month) {
    try {
        const response = await fetch(`${API_BASE_URL}/memos/${year}/${month}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (checkLoginRequired(response)) return {};

        if (!response.ok) throw new Error('메모 데이터 조회 실패');
        return await response.json();
    } catch (error) {
        console.error('메모 데이터 조회 오류:', error);
        return {};
    }
}

async function saveAttendanceToServer(year, month, day) {
    try {
        const response = await fetch(`${API_BASE_URL}/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ year, month, day })
        });

        if (checkLoginRequired(response)) return null;

        if (!response.ok) throw new Error('출석 등록 실패');

        return await response.json();
    } catch (error) {
        console.error('출석 등록 오류:', error);
        alert('출석 등록에 실패했습니다.');
        return null;
    }
}

async function saveMemoToServer(year, month, day, content) {
    try {
        const response = await fetch(`${API_BASE_URL}/memos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ year, month, day, content })
        });

        if (checkLoginRequired(response)) return null;

        if (!response.ok) throw new Error('메모 저장 실패');

        return await response.json();
    } catch (error) {
        console.error('메모 저장 오류:', error);
        alert('메모 저장에 실패했습니다.');
        return null;
    }
}

async function deleteMemoFromServer(year, month, day) {
    try {
        const response = await fetch(`${API_BASE_URL}/memos/${year}/${month}/${day}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (checkLoginRequired(response)) return null;

        if (!response.ok) throw new Error('메모 삭제 실패');

        return await response.json();
    } catch (error) {
        console.error('메모 삭제 오류:', error);
        alert('메모 삭제에 실패했습니다.');
        return null;
    }
}

function getDateKey(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function openAttendanceModal(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (confirm(`${month}월 ${day}일 출석을 등록하시겠습니까?`)) {
        const result = await saveAttendanceToServer(year, month, day);
        if (result) {
            await renderCalendar(currentDate);
        }
    }
}

/* 메모 */
async function openMemo(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // 해당 일자의 메모 조회
    const memoData = await fetchMonthlyMemos(year, month);
    const dateKey = getDateKey(year, month, day);

    memoModal.style.display = "flex";
    document.getElementById("memoDate").textContent = `${year}년 ${month}월 ${day}일`;
    document.getElementById("memoContent").value = memoData[dateKey] || "";
    memoModal.dataset.currentDay = day;
}

async function saveMemo() {
    const day = parseInt(memoModal.dataset.currentDay);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const memoContent = document.getElementById("memoContent").value.trim();

    if (memoContent) {
        const result = await saveMemoToServer(year, month, day, memoContent);
        if (result) {
            memoModal.style.display = "none";
            document.getElementById("memoContent").value = "";
            await renderCalendar(currentDate);
        }
    } else {
        // 내용이 비어있으면 삭제
        await deleteMemo();
    }
}

async function deleteMemo() {
    const day = parseInt(memoModal.dataset.currentDay);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (confirm(`${month}월 ${day}일 메모를 삭제하시겠습니까?`)) {
        const result = await deleteMemoFromServer(year, month, day);
        if (result) {
            memoModal.style.display = "none";
            document.getElementById("memoContent").value = "";
            await renderCalendar(currentDate);
        }
    }
}

/* 초기화 및 모달 닫기 */
function closeMemoModal() {
    memoModal.style.display = "none";
    document.getElementById("memoContent").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    renderCalendar(currentDate);

    const closeMemoBtn = document.getElementById("closeMemoBtn");
    if (closeMemoBtn && memoModal) {
        closeMemoBtn.addEventListener("click", () => {
            memoModal.style.display = "none";
            document.getElementById("memoContent").value = "";
        });

        memoModal.addEventListener("click", (e) => {
            if (e.target.id === "memoModal") {
            closeMemoModal();
        }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && memoModal.style.display === "flex") {
            closeMemoModal();
        }
    });
});
