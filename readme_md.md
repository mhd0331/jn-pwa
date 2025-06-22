# 이우규 후보 PWA (Progressive Web App)

> 진안을 새롭게, 군민을 이롭게 - 이우규 후보의 공식 PWA 웹앱

[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Responsive](https://img.shields.io/badge/Responsive-Mobile%20First-blue.svg)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
[![Offline](https://img.shields.io/badge/Offline-Support-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 📱 프로젝트 소개

이우규 후보의 공식 PWA(Progressive Web App)입니다. 진안군수 후보의 9대 핵심 공약, 면단위 공약, 후보자 소개, 당원가입안내 등을 모바일과 데스크톱에서 네이티브 앱처럼 사용할 수 있습니다.

### 🌟 주요 특징

- **📱 PWA**: 모바일 기기에 앱으로 설치 가능
- **🔄 오프라인 지원**: 인터넷 연결 없이도 콘텐츠 열람 가능
- **📱 반응형**: 모든 디바이스에서 최적화된 UI/UX
- **⚡ 빠른 로딩**: 서비스 워커를 통한 캐시 최적화
- **🔗 SNS 공유**: 각종 SNS 플랫폼으로 쉬운 공유
- **♿ 접근성**: 웹 접근성 지침 준수

## 🚀 빠른 시작

### 1. 파일 다운로드

모든 파일을 웹 서버의 루트 디렉토리에 업로드합니다:

```
your-domain.com/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
└── README.md
```

### 2. 웹 서버 설정

#### Apache (.htaccess)

```apache
# PWA 지원을 위한 MIME 타입 설정
AddType application/manifest+json .webmanifest
AddType application/manifest+json .json

# HTTPS 리다이렉션 (PWA 필수)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 서비스 워커 캐시 제어
<Files "sw.js">
    Header set Cache-Control "no-cache"
</Files>

# Gzip 압축
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL 설정
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/html;
    index index.html;
    
    # PWA 지원
    location /manifest.json {
        add_header Content-Type application/manifest+json;
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # Gzip 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 🌐 배포 플랫폼

### 1. GitHub Pages (무료)

1. GitHub 저장소 생성
2. 모든 파일 업로드
3. Settings > Pages에서 활성화
4. Custom domain 설정 (선택)

```bash
# 배포 스크립트 예시
git add .
git commit -m "Deploy PWA"
git push origin main
```

### 2. Netlify (무료/유료)

1. [Netlify](https://netlify.com) 회원가입
2. 저장소 연결 또는 파일 드래그&드롭
3. 자동 HTTPS 적용
4. Custom domain 설정

### 3. Vercel (무료/유료)

1. [Vercel](https://vercel.com) 회원가입
2. 저장소 import 또는 파일 업로드
3. 자동 배포 및 HTTPS 적용

### 4. Firebase Hosting (무료/유료)

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 배포
firebase deploy
```

### 5. 전용 서버

- VPS, 클라우드 서버 사용
- Apache/Nginx 웹 서버 설정
- SSL 인증서 필수 (Let's Encrypt 추천)

## 📁 파일 구조

```
project/
├── 📄 index.html          # 메인 HTML 파일
├── 🎨 style.css           # 스타일시트
├── ⚙️ script.js           # 메인 JavaScript
├── 📱 manifest.json       # PWA 매니페스트
├── 🔧 sw.js              # 서비스 워커
└── 📖 README.md          # 프로젝트 문서
```

### 핵심 파일 설명

#### `index.html`
- 메인 HTML 구조
- 모든 페이지 섹션 포함
- PWA 메타태그 설정

#### `style.css`
- 반응형 CSS 스타일
- 애니메이션 및 트랜지션
- 접근성 고려 스타일

#### `script.js`
- 페이지 네비게이션 로직
- PWA 설치 관리
- SNS 공유 기능
- 오프라인 데이터 관리

#### `manifest.json`
- PWA 설정 파일
- 앱 아이콘, 이름, 테마 색상
- 설치 및 실행 옵션

#### `sw.js`
- 서비스 워커
- 캐시 관리
- 오프라인 지원
- 백그라운드 동기화

## 🔧 커스터마이징

### 1. 브랜딩 변경

#### 색상 테마 수정 (`style.css`)

```css
:root {
    --primary-color: #2563eb;    /* 메인 색상 */
    --secondary-color: #059669;  /* 보조 색상 */
    --accent-color: #f59e0b;     /* 강조 색상 */
}
```

#### 로고 및 아이콘 (`manifest.json`)

```json
{
    "icons": [
        {
            "src": "icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

### 2. 콘텐츠 수정

#### 후보자 정보 (`script.js`)

```javascript
const candidateInfo = {
    name: "이우규",
    position: "진안군수 후보",
    slogan: "진안을 새롭게, 군민을 이롭게"
};
```

#### 공약 데이터 (`script.js`)

```javascript
const offlineData = {
    corePromises: [
        {id: 'new_promise', title: '새로운 공약', icon: '🆕'},
        // 추가 공약들...
    ]
};
```

### 3. SNS 계정 연결

#### Facebook 페이지 연결 (`script.js`)

```javascript
function shareToFacebook() {
    const facebookPageUrl = 'https://facebook.com/your-page';
    window.open(facebookPageUrl, '_blank');
}
```

#### 유튜브 채널 연결 (`script.js`)

```javascript
function shareToYoutube() {
    const youtubeChannelUrl = 'https://youtube.com/@your-channel';
    window.open(youtubeChannelUrl, '_blank');
}
```

## 📱 PWA 기능

### 설치 가능

사용자가 브라우저에서 "홈 화면에 추가" 또는 "앱 설치"를 통해 네이티브 앱처럼 설치할 수 있습니다.

### 오프라인 지원

- 한 번 방문한 페이지는 오프라인에서도 열람 가능
- 서비스 워커가 자동으로 리소스 캐싱
- 네트워크 복구 시 자동 동기화

### 푸시 알림 (확장 가능)

```javascript
// 푸시 알림 권한 요청
Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
        // 알림 구독 로직
    }
});
```

## 🌍 브라우저 호환성

| 브라우저 | 버전 | PWA 지원 | 설치 가능 |
|---------|------|---------|-----------|
| Chrome | 67+ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ |
| Firefox | 58+ | ✅ | ⚠️ |
| Safari | 11.1+ | ✅ | ✅ |
| Samsung Internet | 7.2+ | ✅ | ✅ |

⚠️ Firefox는 PWA 기능을 지원하지만 자동 설치 프롬프트는 없음

## 📊 성능 최적화

### Lighthouse 점수 목표

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+
- **PWA**: 100

### 최적화 체크리스트

- [x] 서비스 워커 구현
- [x] 매니페스트 파일 설정
- [x] HTTPS 적용
- [x] 반응형 디자인
- [x] 이미지 최적화
- [x] 코드 압축
- [x] 캐시 전략 구현
- [x] 접근성 개선

## 🔍 SEO 최적화

### 메타태그 설정

```html
<meta name="description" content="이우규 후보의 9대 핵심 공약과 면단위 공약을 확인하세요">
<meta name="keywords" content="이우규, 진안군수, 공약, 더불어민주당">
<meta property="og:title" content="이우규 후보 - 진안을 새롭게, 군민을 이롭게">
<meta property="og:description" content="국민주권정부 시대, 진안형 기본사회위원회 구축">
<meta property="og:image" content="https://your-domain.com/og-image.png">
```

### 구조화된 데이터

```json
{
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "이우규",
    "jobTitle": "진안군수 후보",
    "affiliation": "더불어민주당"
}
```

## 🛠 문제해결

### 일반적인 문제

#### PWA가 설치되지 않을 때

1. HTTPS 확인
2. 매니페스트 파일 유효성 검사
3. 서비스 워커 등록 확인
4. 브라우저 호환성 확인

#### 오프라인에서 작동하지 않을 때

1. 서비스 워커 등록 상태 확인
2. 캐시 정책 검토
3. 네트워크 탭에서 요청 확인

#### 성능이 느릴 때

1. 이미지 최적화
2. 코드 압축
3. CDN 사용 고려
4. 캐시 전략 개선

### 디버깅 도구

- **Chrome DevTools**: Application 탭에서 PWA 상태 확인
- **Lighthouse**: 성능 및 PWA 점수 측정
- **PWA Builder**: Microsoft의 PWA 검증 도구

## 📈 분석 및 모니터링

### Google Analytics 연동

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 사용자 행동 추적

```javascript
// 공약 조회 추적
function trackPromiseView(promiseId) {
    gtag('event', 'promise_view', {
        'promise_id': promiseId,
        'event_category': 'engagement'
    });
}

// SNS 공유 추적
function trackSocialShare(platform) {
    gtag('event', 'share', {
        'method': platform,
        'event_category': 'social'
    });
}
```

## 🔒 보안

### HTTPS 필수

PWA는 HTTPS에서만 작동합니다. 프로덕션 환경에서는 반드시 SSL 인증서를 설정해주세요.

### 콘텐츠 보안 정책 (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src https://fonts.gstatic.com;
    img-src 'self' data:;
">
```

## 🚀 배포 체크리스트

배포 전에 다음 항목들을 확인해주세요:

- [ ] 모든 링크와 버튼이 정상 작동
- [ ] 반응형 디자인 테스트 (모바일/태블릿/데스크톱)
- [ ] PWA 설치 기능 테스트
- [ ] 오프라인 모드 테스트
- [ ] 다양한 브라우저에서 테스트
- [ ] Lighthouse 점수 확인
- [ ] SSL 인증서 설정
- [ ] 도메인 연결 확인
- [ ] 분석 도구 연동
- [ ] 메타태그 및 SEO 설정

## 📞 지원

### 기술 지원

- 웹 표준 및 PWA 관련: [MDN Web Docs](https://developer.mozilla.org/)
- Tailwind CSS: [공식 문서](https://tailwindcss.com/docs)
- PWA 테스트: [PWA Builder](https://www.pwabuilder.com/)

### 업데이트

새로운 기능이나 버그 수정이 필요한 경우:

1. 파일 수정
2. 서비스 워커 버전 업데이트 (`sw.js`의 `CACHE_NAME`)
3. 배포
4. 사용자는 다음 방문 시 자동 업데이트

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 상업적 이용이 가능하며, 자유롭게 수정하여 사용하실 수 있습니다.

---

**진안을 새롭게, 군민을 이롭게!** 🌟

이우규 후보를 응원해주세요! 💪