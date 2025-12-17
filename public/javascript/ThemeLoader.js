const ThemeLoader = {
    colors: {
        // 다크 테마
        dark1: { 
            main: '#2a2d56', 
            isLight: false,
            sidebar: '#333',
            sidebarHover: '#666',
            sidebarText: '#e0e0e0'
        },
        dark2: { 
            main: '#2c3e50', 
            isLight: false,
            sidebar: '#333',
            sidebarHover: '#666',
            sidebarText: '#e0e0e0'
        },
        dark3: { 
            main: '#244b56', 
            isLight: false,
            sidebar: '#333',
            sidebarHover: '#666',
            sidebarText: '#e0e0e0'
        },
        
        // 라이트 테마
        light1: { 
            main: '#f7fafc', 
            isLight: true,
            sidebar: 'linear-gradient(180deg, #f3f0f8 0%, #e8e3f0 100%)',
            sidebarHover: '#e0e0e0',
            sidebarText: '#333'
        },
        light2: { 
            main: '#e5dff7', 
            isLight: true,
            sidebar: 'linear-gradient(180deg, #f3f0f8 0%, #e8e3f0 100%)',
            sidebarHover: '#e0e0e0',
            sidebarText: '#333'
        },
        light3: { 
            main: '#fffef3', 
            isLight: true,
            sidebar: 'linear-gradient(180deg, #f3f0f8 0%, #e8e3f0 100%)',
            sidebarHover: '#e0e0e0',
            sidebarText: '#333'
        },
        light4: { 
            main: '#ebf7f3', 
            isLight: true,
            sidebar: 'linear-gradient(180deg, #f3f0f8 0%, #e8e3f0 100%)',
            sidebarHover: '#e0e0e0',
            sidebarText: '#333'
        }
    },

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light1';
        this.applyTheme(savedTheme);
    },

    applyTheme(themeId) {
        const themeData = this.colors[themeId];
        if (!themeData) return;

        // body 배경
        const color = themeData.main;
        const darkColor = this.adjustBrightness(color, -20);
        document.body.style.background = `linear-gradient(135deg, ${color} 80%, ${darkColor} 100%)`;
        
        // 라이트/다크 모드 클래스
        if (themeData.isLight) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }

        // CSS 변수로 사이드바 제어
        document.documentElement.style.setProperty('--sidebar-bg', themeData.sidebar);
        document.documentElement.style.setProperty('--sidebar-hover', themeData.sidebarHover);
        document.documentElement.style.setProperty('--sidebar-text', themeData.sidebarText);

        // 메인 프레임 헤더 테마
        if (themeData.isLight) {
            document.documentElement.style.setProperty('--header-bg', 'rgba(255, 255, 255, 0.95)');
            document.documentElement.style.setProperty('--header-text', '#2d3748');
        } else {
            document.documentElement.style.setProperty('--header-bg', 'rgba(45, 55, 72, 0.95)');
            document.documentElement.style.setProperty('--header-text', '#e0e0e0');
        }
    },

    // 밝기 조절 헬퍼 함수
    adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, Math.max(0, (num >> 16) + amt));
        const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
        
        return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }
};

// 페이지 로드 시 자동 실행 (Setting.js가 없는 페이지를 위함)
document.addEventListener('DOMContentLoaded', () => {
    ThemeLoader.init();
});