let isVerified = false;
let timerInterval = null;
const join = document.getElementById('join');

join.addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const pw_confirm = document.getElementById('password_confirm').value;

    if(!nickname || !email || !password || !pw_confirm){
        alert('모든 항목을 입력하세요.');
        return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        alert("유효한 이메일 주소를 입력하세요.");
        return;
    }
    
    if(!isVerified){
        alert('이메일 인증을 완료해주세요.');
        return;
    }

    // 비밀번호 확인
    if(password !== pw_confirm){
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    // 약관 동의 여부 체크
    const age = document.getElementById('agree-age').checked;
    const service = document.getElementById('agree-service').checked;
    const privacy = document.getElementById('agree-privacy').checked;

    if(!age || !service || !privacy){
        alert('모든 필수 약관에 동의하셔야 가입 가능합니다.');
        return;
    }

    try {
        const response = await fetch('/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname, email, password })
        });

        const result = await response.json();

        if(response.ok){
            alert(`${result.nickname}님, 가입을 환영합니다!`);
            window.location.href = '/sign_in';
        }
        else{
            alert(result.message);
        }
    }
    catch (error) {
        console.error('회원가입 실패: ', error);
        alert('서버 오류가 발생했습니다.');
    }
});

// 닉네임 중복 확인
const nickname_confirm = document.getElementById('nickname_confirm');

nickname_confirm.addEventListener('click', async () => {
    const nickname = document.getElementById('nickname').value.trim();

    if(!nickname){
        alert('닉네임을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/user/check-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nickname })
        });

        const result = await response.json();
        alert(result.message);
    }
    catch (error) {
        console.log('중복 확인 오류: ', error);
        alert('서버 오류가 발생했습니다.');
    }
});

// 타이머 시작 함수 (5분)
function startTimer() {
    let timeLeft = 300; // 5분 = 300초
    const timerEl = document.getElementById('emailTimer');
    
    // 기존 타이머가 있으면 제거
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // 타이머 요소에 남은 시간 표시
        if(timerEl) {
            timerEl.textContent = `남은 시간: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            if(timerEl) {
                timerEl.textContent = '인증 시간이 만료되었습니다.';
            }
            
            // 이메일 인증 버튼 재활성화
            const auth_btn = document.getElementById('email-auth');
            auth_btn.disabled = false;
            auth_btn.style.opacity = '1';
            auth_btn.style.cursor = 'pointer';
            
            alert('인증 시간이 만료되었습니다. 인증코드를 재전송해주세요.');
            
            // 인증코드 입력창 초기화
            document.getElementById('code').value = '';
        }
    }, 1000);
}

// 이메일 인증
const auth_btn = document.getElementById('email-auth');

auth_btn.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if(!email) return alert('이메일을 입력해주세요.');

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        alert("유효한 이메일 주소를 입력하세요.");
        return;
    }

    // 1. 이메일 중복 확인
    try {
        const checkResponse = await fetch('/user/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const checkResult = await checkResponse.json();
        
        if(!checkResponse.ok){
            alert(checkResult.message);
            return;
        }
    } catch (error) {
        console.error('이메일 확인 오류:', error);
        alert('서버 오류가 발생했습니다.');
        return;
    }

    // 2. 버튼 비활성화 및 로딩 표시
    const originalText = auth_btn.textContent;
    auth_btn.textContent = '전송 중...';
    auth_btn.disabled = true;
    auth_btn.style.opacity = '0.6';
    auth_btn.style.cursor = 'default';

    try {
        const response = await fetch('/user/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        
        if(response.ok){
            alert(result.message);
            startTimer();
            // auth_btn.textContent = '전송 완료';
        } else {
            alert(result.message || '이메일 전송에 실패했습니다.');

            auth_btn.textContent = originalText;
            auth_btn.disabled = false;
            auth_btn.style.opacity = '1';
            auth_btn.style.cursor = 'pointer';
        }
    } catch (error) {
        console.error('이메일 전송 오류:', error);
        alert('서버 오류가 발생했습니다.');

        auth_btn.textContent = originalText;
        auth_btn.disabled = false;
        auth_btn.style.opacity = '1';
        auth_btn.style.cursor = 'pointer';
    } finally {
        // 버튼 복구
        auth_btn.textContent = '인증코드 재전송';
        auth_btn.disabled = false;
        auth_btn.style.opacity = '1';
        auth_btn.style.cursor = 'pointer';
    }
});

// 인증코드 확인
const verifyCodes = document.getElementById('verify-code');
const codeInput = document.getElementById('code');

verifyCodes.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const code = codeInput.value.trim();
    if(!code) return alert('인증코드를 입력해주세요.');

    const response = await fetch('/user/verify-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
    });

    const result = await response.json();
    alert(result.message);

    if(response.ok){
        isVerified = true;

        // 타이머 중지
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        
        // 타이머 표시 제거
        const timerEl = document.getElementById('emailTimer');
        if(timerEl) {
            timerEl.textContent = '';
        }
        
        // 3. 인증 완료 시 입력창과 버튼 비활성화
        auth_btn.disabled = true;
        auth_btn.style.cursor = 'default';
        auth_btn.style.opacity = '0.6';

        codeInput.disabled = true;
        codeInput.style.opacity = '0.6';
        codeInput.style.cursor = 'default';
        
        verifyCodes.textContent = '인증 완료!';
        verifyCodes.style.color = '#35A545';
        verifyCodes.style.cursor = 'default';
        verifyCodes.disabled = true;
        verifyCodes.style.opacity = '0.6';
    }
});

// 약관 전체 동의 체크
const agreeAll = document.getElementById('agree-all');
const agreeEach = document.querySelectorAll('.agree-each');

// 전체 동의 체크 >>> 개별 체크박스 체크
agreeAll.addEventListener('change', () => {
    agreeEach.forEach(checkbox => {
        checkbox.checked = agreeAll.checked;
    });
});

// 개별 체크박스 체크 >>> 전체 체크 설정/해제
agreeEach.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const allChecked = [...agreeEach].every(cb => cb.checked);
        agreeAll.checked = allChecked;
    });
});