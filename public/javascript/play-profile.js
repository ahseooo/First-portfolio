// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

async function loadUserProfile() {
    try {
        // [Server 통신 가정] 실제 사용자의 ID나 세션 정보를 통해 데이터를 요청합니다.
        // 예: GET /api/user/me
        const response = await fetch('/profile/profile-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('회원 정보를 불러오는데 실패했습니다.');

        const userData = await response.json();
        
        // userData 구조 예시: 
        // { nickname: "코딩몬스터", profile_icon: "https://example.com/img.jpg" }

        renderUserProfile(userData.data);

    } catch (error) {
        console.error("프로필 로드 에러:", error);
        // 에러 발생 시 기본값 처리
        renderUserProfile({ nickname: '게스트', profile_icon: null });
    }
}

function renderUserProfile(data) {
        // console.log("서버 응답 전체:", data);
    const elNickname = document.getElementById('el_nickname');
    const elProfileIcon = document.getElementById('el_profile_icon');

    // 1. 닉네임 설정
    if (elNickname) {
        elNickname.textContent = data.nickname;
    }

    // 2. 프로필 아이콘 설정 (DB 값이 없으면 기본 이미지)
    if (elProfileIcon) {
        // data.profile_icon이 null, undefined, 빈 문자열이면 기본 이미지 사용
        const imgSrc = data.profile_icon ? data.profile_icon : '/images/Logo.png';
        elProfileIcon.src = imgSrc;
    }
}