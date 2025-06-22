# 이우규 후보 PWA (Progressive Web App) v2.0

> 진안을 새롭게, 군민을 이롭게 - 이우규 후보의 공식 PWA 웹앱

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-blue.svg)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
[![Offline](https://img.shields.io/badge/Offline-Support-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
[![JSON](https://img.shields.io/badge/Data-JSON%20Managed-yellow.svg)](https://www.json.org/)

## 📱 프로젝트 소개

이우규 후보의 공식 PWA(Progressive Web App) v2.0입니다. **섹션 겹침 문제를 완전히 해결**하고, **모든 데이터를 JSON으로 관리**하여 유지보수성을 크게 향상시켰습니다.

### 🌟 v2.0 주요 업데이트

- **✅ 섹션 겹침 문제 완전 해결**: CSS와 JavaScript를 완전히 재구성하여 페이지 전환 시 겹침 현상 제거
- **📄 JSON 데이터 관리**: 모든 공약, 후보자 정보, 뉴스 등을 `data.json` 파일로 중앙 관리
- **🔄 동적 콘텐츠 로딩**: 서버에서 JSON 데이터를 불러와 실시간으로 UI 렌더링
- **📱 향상된 반응형 디자인**: 모든 디바이스에서 완벽한 사용자 경험
- **⚡ 성능 최적화**: 더 빠른 로딩과 부드러운 애니메이션

### 🌟 기존 특징 (유지)

- **📱 PWA**: 모바일 기기에 앱으로 설치 가능
- **🔄 오프라인 지원**: 인터넷 연결 없이도 콘텐츠 열람 가능
- **📱 반응형**: 모든 디바이스에서 최적화된 UI/UX
- **⚡ 빠른 로딩**: 서비스 워커를 통한 캐시 최적화
- **🔗 SNS 공유**: 각종 SNS 플랫폼으로 쉬운 공유
- **♿ 접근성**: 웹 접근성 지침 준수

## 🚀 빠른 시작

### 1. 파일 준비

모든 파일을 웹 서버의 루트 디렉토리에 업로드합니다:

```
your-domain.com/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트 (섹션 겹침 문제 해결)
├── script.js           # JavaScript (JSON 데이터 로딩)
├── data.json           # 📄 모든 데이터 중앙 관리 (NEW!)
├── manifest.json       # PWA 매니페스트
├── sw.js              # 서비스 워커
├── candidate-photo.jpg # 후보자 사진 (준비 필요)
└── README.md          # 이 파일
```

### 2. 후보자 사진 설정

`candidate-photo.jpg` 파일을 루트 디렉토리에 업로드하세요:

- **크기**: 400x400 픽셀 이상 (정사각형 권장)
- **형식**: JPG 또는 PNG
- **용량**: 500KB 이하
- **파일명**: 정확히 `candidate-photo.jpg`

### 3. 데이터 커스터마이징

**v2.0의 핵심 기능**: 모든 콘텐츠는 `data.json` 파일에서 관리됩니다.

```json
{
  "candidate": {
    "name": "이우규",
    "position": "진안군수 후보",
    "slogan": "진안을 새롭게, 군민을 이롭게",
    "vision": "국민주권정부 시대, 진안형 기본사회위원회 구축"
  },
  "corePromises": [...],
  "promiseDetails": {...},
  "news": [...],
  "socialMedia": {...}
}
```

## 📄 JSON 데이터 관리 가이드

### 데이터 구조 개요

`data.json` 파일은 다음과 같은 구조로 되어 있습니다:

```json
{
  "candidate": {          // 후보자 기본 정보
    "name": "이우규",
    "position": "진안군수 후보",
    "slogan": "슬로건",
    "vision": "비전",
    "description": "설명",
    "experience": [...],   // 경력 정보
    "values": [...]        // 핵심 가치
  },
  "corePromises": [...],          // 홈 화면 핵심 공약 (9개)
  "integratedPromises": [...],    // 통합 공약 페이지
  "townshipPromises": [...],      // 면단위 공약 목록
  "promiseDetails": {...},       // 각 공약의 상세 내용
  "townshipDetails": {...},      // 면단위 공약 상세 정보
  "news": [...],                 // 뉴스/소식 데이터
  "socialMedia": {...}           // SNS 계정 정보
}
```

### 후보자 정보 수정

```json
{
  "candidate": {
    "name": "이우규",
    "position": "진안군수 후보",
    "slogan": "진안을 새롭게, 군민을 이롭게",
    "vision": "국민주권정부 시대, 진안형 기본사회위원회 구축",
    "description": "진안군민께서 84.4%라는 높은 투표율과...",
    "experience": [
      {
        "title": "제8대 진안군의회 의원",
        "period": "전",
        "description": "진안군 발전을 위한 의정활동...",
        "color": "blue"  // blue, green, purple 등
      }
    ],
    "values": [
      {
        "title": "국민주권",
        "description": "모든 정책에 주민 참여를 기본 원칙으로 합니다"
      }
    ]
  }
}
```

### 공약 추가/수정

#### 1. 핵심 공약 (홈 화면)

```json
{
  "corePromises": [
    {
      "id": "new_promise",      // 고유 ID
      "title": "새로운 공약",   // 표시될 제목
      "icon": "🆕"             // 이모지 아이콘
    }
  ]
}
```

#### 2. 공약 상세 내용

```json
{
  "promiseDetails": {
    "new_promise": {
      "id": "new_promise",
      "title": "새로운 공약의 전체 제목",
      "category": "분야",
      "why": "현황 및 문제점 설명",
      "what": "공약 내용 설명", 
      "how": "실천 방안 설명"
    }
  }
}
```

#### 3. 면단위 공약

```json
{
  "townshipPromises": [
    {
      "id": "new_area",
      "name": "새로운 지역"
    }
  ],
  "townshipDetails": {
    "new_area": {
      "id": "new_area",
      "name": "새로운 지역",
      "population": "약 1,000명",
      "characteristics": "지역 특성",
      "keyProjects": ["프로젝트1", "프로젝트2"],
      "budget": "총 50억원 (4년간)",
      "timeline": "2025-2028년"
    }
  }
}
```

### 뉴스/소식 관리

```json
{
  "news": [
    {
      "id": "1",
      "title": "뉴스 제목",
      "date": "2024-07-20",
      "time": "오후 7시",           // 선택사항
      "location": "장소",           // 선택사항
      "content": "뉴스 내용",
      "tags": ["#태그1", "#태그2"], // 선택사항
      "type": "발표",              // 발표, 행사 등
      "status": "예정"             // 예정, 완료 등 (선택사항)
    }
  ]
}
```

### SNS 계정 연결

```json
{
  "socialMedia": {
    "facebook": "https://www.facebook.com/your-page",
    "instagram": "https://www.instagram.com/your-account",
    "youtube": "https://www.youtube.com/@your-channel",
    "blog": "https://blog.naver.com/your-blog"
  }
}
```

## 🔧 섹션 겹침 문제 해결

### v2.0에서 해결된 문제들

1. **페이지 전환 시 섹션이 겹쳐 보이는 문제**
2. **이전 섹션이 완전히 숨겨지지 않는 문제**
3. **모바일에서 스크롤 위치가 엉키는 문제**
4. **애니메이션 중 깜빡임 현상**

### 해결 방법

#### 1. CSS 구조 개선

```css
/* 페이지 컨테이너 설정 */
#page-container {
    position: relative;
    width: 100%;
    min-height: 50vh;
    overflow: hidden; /* 핵심: 넘치는 요소 숨김 */
}

/* 기본 섹션 스타일 */
.page-section {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    opacity: 0;
    visibility: hidden;
    transform: translateX(100%);
    transition: all 0.3s ease-in-out;
    pointer-events: none;
}

/* 활성 섹션 */
.page-section.section-active {
    position: relative !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(0) !important;
    pointer-events: auto !important;
    z-index: 10 !important;
}

/* 숨겨진 섹션 */
.page-section.section-hidden {
    position: absolute !important;
    opacity: 0 !important;
    visibility: hidden !important;
    transform: translateX(-100%) !important;
    pointer-events: none !important;
    z-index: -1 !important;
    display: none !important;
}
```

#### 2. JavaScript 섹션 관리

```javascript
function showSection(sectionId) {
    // 1단계: 모든 섹션 강제로 숨기기
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('section-active');
        section.classList.add('section-hidden', 'force-hidden');
        // 추가 강제 스타일 적용...
    });
    
    // 2단계: 요청된 섹션만 표시 (약간의 지연)
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.remove('section-hidden', 'force-hidden');
            targetSection.classList.add('section-active');
            // 스타일 복원...
        }
    }, 50);
}
```

## 🌐 배포 및 설정

### 웹 서버 설정

#### Apache (.htaccess)

```apache
# JSON 파일 MIME 타입 설정
AddType application/json .json

# HTTPS 리다이렉션 (PWA 필수)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# JSON 파일 캐시 설정
<Files "data.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>

# 서비스 워커 캐시 제어
<Files "sw.js">
    Header set Cache-Control "no-cache"
</Files>
```

#### Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    # JSON 파일 MIME 타입
    location ~ \.json$ {
        add_header Content-Type application/json;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # PWA 지원
    location /manifest.json {
        add_header Content-Type application/manifest+json;
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

### 개발 환경 설정

로컬에서 테스트할 때는 HTTP 서버가 필요합니다 (JSON 파일 로딩을 위해):

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

## 🔧 커스터마이징 가이드

### 1. 색상 테마 변경

`style.css`에서 CSS 변수를 수정:

```css
:root {
    --primary-color: #2563eb;    /* 메인 색상 */
    --secondary-color: #059669;  /* 보조 색상 */
    --accent-color: #f59e0b;     /* 강조 색상 */
}
```

### 2. 공약 데이터 대량 수정

`data.json` 파일을 직접 편집하거나, JSON 편집 도구를 사용:

```bash
# jq를 사용한 JSON 검증
cat data.json | jq '.'

# 특정 공약만 추출
cat data.json | jq '.promiseDetails.welfare'
```

### 3. 새로운 페이지 섹션 추가

1. `index.html`에 새 섹션 추가:
```html
<section id="new-section" class="page-section section-hidden">
    <h2>새로운 페이지</h2>
    <!-- 내용 -->
</section>
```

2. `script.js`에 네비게이션 함수 수정:
```javascript
function getSectionName(sectionId) {
    const sectionNames = {
        'home': '홈',
        'promises': '공약',
        'profile': '후보자 소개',
        'news': '소식/일정',
        'membership': '당원가입안내',
        'new': '새로운 페이지'  // 추가
    };
    return sectionNames[sectionId] || '';
}
```

## 📊 성능 최적화

### 이미지 최적화

```bash
# ImageMagick을 사용한 이미지 최적화
magick candidate-photo.jpg -resize 400x400^ -gravity center -extent 400x400 -quality 85 candidate-photo.jpg

# WebP 형식으로 변환 (최신 브라우저용)
magick candidate-photo.jpg -quality 80 candidate-photo.webp
```

### JSON 데이터 압축

```bash
# jq를 사용한 JSON 압축 (공백 제거)
cat data.json | jq -c '.' > data.min.json
```

### Lighthouse 점수 목표

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+
- **PWA**: 100

## 🔍 디버깅 도구

### 브라우저 콘솔 명령어

개발 중 유용한 디버깅 명령어들:

```javascript
// 섹션 상태 확인
debugSectionStatus()

// 모든 섹션 전환 테스트
testAllButtons()

// 데이터 다시 로드
reloadData()

// 특정 섹션으로 이동
showSection('promises')

// 섹션 초기화
initializeSections()
```

### 일반적인 문제 해결

#### JSON 데이터가 로드되지 않을 때

1. **브라우저 개발자도구 → Network 탭 확인**
   - `data.json` 파일이 404 에러인지 확인
   - CORS 에러가 발생하는지 확인

2. **JSON 문법 검증**
   ```bash
   # JSON 문법 검증
   cat data.json | jq '.'
   ```

3. **웹 서버 설정 확인**
   - JSON 파일에 대한 MIME 타입 설정
   - 파일 읽기 권한 확인

#### 섹션이 제대로 전환되지 않을 때

1. **CSS 충돌 확인**
   ```javascript
   // 현재 섹션 상태 확인
   debugSectionStatus()
   ```

2. **강제 섹션 초기화**
   ```javascript
   // 섹션 강제 초기화
   initializeSections()
   showSection('home')
   ```

## 📱 모바일 최적화

### 터치 인터페이스

```css
/* 터치 영역 확대 */
button {
    min-height: 44px;
    min-width: 44px;
}

/* 터치 피드백 */
.promise-card:active {
    transform: scale(0.98);
    opacity: 0.9;
}
```

### 모바일 성능

```javascript
// 모바일에서 애니메이션 단순화
if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile-device');
}
```

```css
.mobile-device .page-section {
    transition: none; /* 모바일에서 애니메이션 비활성화 */
}
```

## 🔒 보안 고려사항

### HTTPS 필수

PWA는 HTTPS에서만 작동합니다:

```javascript
// HTTPS 리다이렉션 확인
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

### 콘텐츠 보안 정책 (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self';
">
```

## 🚀 배포 체크리스트

### 배포 전 확인사항

- [ ] `data.json` 파일이 올바른 형식인지 검증
- [ ] 후보자 사진(`candidate-photo.jpg`)이 업로드되었는지 확인
- [ ] 모든 링크와 버튼이 정상 작동하는지 테스트
- [ ] 섹션 전환이 부드럽게 작동하는지 확인
- [ ] 반응형 디자인 테스트 (모바일/태블릿/데스크톱)
- [ ] PWA 설치 기능 테스트
- [ ] 오프라인 모드 테스트
- [ ] 다양한 브라우저에서 테스트
- [ ] Lighthouse 점수 확인
- [ ] SSL 인증서 설정
- [ ] 도메인 연결 확인
- [ ] JSON 파일 MIME 타입 설정
- [ ] 캐시 설정 확인

### 성능 테스트

```bash
# Lighthouse CLI 설치 및 실행
npm install -g lighthouse
lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html
```

## 📞 지원 및 업데이트

### 데이터 업데이트 방법

1. **일반 업데이트**: `data.json` 파일만 수정
2. **디자인 변경**: CSS 파일 수정
3. **기능 추가**: JavaScript 파일 수정
4. **구조 변경**: HTML 파일 수정

### 버전 관리

```json
{
  "version": "2.0.0",
  "lastUpdated": "2024-07-20",
  "changelog": [
    "섹션 겹침 문제 완전 해결",
    "JSON 데이터 관리 시스템 도입",
    "성능 최적화"
  ]
}
```

### 기술 지원

- **JSON 문법**: [JSON.org](https://www.json.org/)
- **PWA 가이드**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- **Tailwind CSS**: [공식 문서](https://tailwindcss.com/docs)
- **웹 표준**: [W3C](https://www.w3.org/)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 상업적 이용이 가능하며, 자유롭게 수정하여 사용하실 수 있습니다.

---

**v2.0 업데이트로 더욱 안정적이고 관리하기 쉬운 PWA가 되었습니다!** 

**진안을 새롭게, 군민을 이롭게!** 🌟

이우규 후보를 응원해주세요! 💪