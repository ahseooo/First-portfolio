const loadInnerHTML = async (id, url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`${url} 불러오기 실패: ${res.status}`);
        }
        const html = await res.text();
        document.getElementById(id).innerHTML = html;


    } catch (err) {
        console.log(err);
    }
};

loadInnerHTML('main-frame', "main_frame.html");

loadInnerHTML('side-bar', "sidebar.html")
.then(() => {
    let arrows = document.querySelectorAll(".arrow");       // 세부메뉴 열기

    arrows.forEach(arrow => {
        arrow.addEventListener("click", (e) => {
            const li = e.target.closest("li");
            li.classList.toggle("showCategory");

            e.target.style.transform = li.classList.contains("showCategory")
                ? "rotate(-180deg)"
                : "rotate(0deg)";
        });
    });

    let sidebar = document.querySelector(".sidebar");           // 사이드바 토글
    let sidebarBtn = document.querySelector(".fa-bars");

    sidebarBtn.addEventListener("click", () => {
        if (!sidebar.classList.contains("close")) {
            sidebar.classList.add("is-closing");
            setTimeout(() => sidebar.classList.remove("is-closing"), 100);
        }
        else {
            sidebar.classList.remove("is-closing");
        }

        sidebar.classList.toggle("close");
    });
});

// loadInnerHTML('friendsList', "friendList.html");
// loadInnerHTML('header', "Header.html");