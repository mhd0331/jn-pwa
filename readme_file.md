# 이우규 후보 공식 홈페이지 PWA

진안을 새롭게, 군민을 이롭게! 이우규 후보의 공식 홈페이지입니다.

## 📱 주요 기능

- **반응형 웹 디자인**: 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- **PWA (Progressive Web App)**: 앱처럼 설치하여 사용 가능
- **9대 핵심 공약**: 분야별 상세 공약 확인
- **면단위 공약**: 진안군 11개 면별 맞춤형 공약
- **후보자 소개**: 경력, 비전, 가치관 소개
- **최신 소식**: 선거 관련 소식과 일정
- **SNS 공유**: 페이스북, 인스타그램, 유튜브 등 공유 기능
- **당원가입 안내**: 더불어민주당 당원가입 안내

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Tailwind CSS
- **PWA**: Service Worker, Web App Manifest
- **Data**: JSON 기반 동적 콘텐츠

## 📁 파일 구조

```
jinan-candidate-website/
├── index.html          # 메인 HTML 파일
├── data.json           # 후보자 정보 및 공약 데이터
├── script.js           # 메인 JavaScript 파일
├── style.css           # 커스텀 스타일시트
├── manifest.json       # PWA 매니페스트
├── sw.js              # 서비스 워커
├── candidate-photo.jpg # 후보자 사진 (또는 SVG 대체)
└── README.md          # 프로젝트 설명서
```

## 🚀 설치 및 실행

### 1. 파일 다운로드
모든 파일을 동일한 폴더에 저장합니다.

### 2. 로컬 서버 실행
PWA 기능을 위해 HTTPS 또는 localhost에서 실행해야 합니다.

#### Python 사용 (Python 3.x)
```bash
python -m http.server 8000
```

#### Node.js 사용
```bash
npx http-server -p 8000
```

#### Live Server (VS Code 확장)
VS Code에서 Live Server 확장을 설치 후 index.html을 우클릭하여 "Open with Live Server" 선택

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## 📱 PWA 설치

### 모바일 (Android/iOS)
1. 웹사이트 접속
2. 브라우저 메뉴에서 "홈 화면에 추가" 선택
3. 설치 완료 후 앱처럼 사용 가능

### 데스크톱 (Chrome/Edge)
1. 주소창 오른쪽의 설치 아이콘 클릭
2. "설치" 버튼 클릭
3. 독립 앱 창으로 실행 가능

## 🛠️ 커스터마이징

### 후보자 정보 수정
`data.json` 파일을 편집하여 후보자 정보를 수정할 수 있습니다:

```json
{
  "candidate": {
    "name": "이우규",
    "position": "진안군수 후보",
    "slogan": "진안을 새롭게, 군민을 이롭게",
    "vision": "국민주권정부 시대, 진안형 기본사회위원회 구축"
  }
}
```

### 공약 추가/수정
`data.json`의 `promiseDetails` 섹션에서 공약을 추가하거나 수정할 수 있습니다:

```json
{
  "promiseDetails": {
    "new_promise": {
      "id": "new_promise",
      "title": "새로운 공약 제목",
      "why": "현황 및 문제점",
      "what": "약속 내용",
      "how": "실천 방안"
    }
  }
}
```

### 소식 업데이트
`data.json`의 `news` 배열에 새로운 소식을 추가할 수 있습니다:

```json
{
  "news": [
    {
      "id": "new_news",
      "title": "새로운 소식 제목",
      "date": "2024-12-20",
      "location": "진안군청",
      "content": "소식 내용...",
      "tags": ["#태그1", "#태그2"],
      "type": "발표"
    }
  ]
}
```

## 🎨 디자인 커스터마이징

### 색상 변경
`style.css` 파일에서 CSS 변수를 수정하여 색상을 변경할 수 있습니다.

### 레이아웃 수정
Tailwind CSS 클래스를 사용하여 `index.html`의 레이아웃을 쉽게 수정할 수 있습니다.

## 🌐 배포

### GitHub Pages
1. GitHub 저장소 생성
2. 파일 업로드
3. Settings > Pages에서 배포 설정

### Netlify
1. 파일을 ZIP으로 압축
2. Netlify에 드래그 앤 드롭
3. 자동 배포 완료

### Vercel
1. GitHub 저장소 연결
2. 자동 빌드 및 배포

## 🔧 개발자 도구

### 디버깅
브라우저 개발자 도구 콘솔에서 다음 명령어를 사용할 수 있습니다:

```javascript
// 모든 버튼 테스트
testAllButtons()

// 섹션 상태 확인
debugSectionStatus()

// 특정 섹션 표시
showSection('promises')

// 데이터 다시 로드
reloadData()
```

## 📊 성능 최적화

### 이미지 최적화
- 후보자 사진: WebP 형식 권장 (최대 500KB)
- 아이콘: SVG 사용 권장

### 캐싱
- Service Worker가 자동으로 캐싱 처리
- 오프라인 상태에서도 기본 기능 사용 가능

## 🔒 보안

### HTTPS 필수
- PWA 기능을 위해 HTTPS 배포 필요
- Let's Encrypt 등 무료 SSL 인증서 사용 가능

### 데이터 보호
- 민감한 정보는 클라이언트 사이드에 저장하지 않음
- 연락처 정보는 공개 정보만 포함

## 📞 지원

### 기술 지원
문제가 발생하거나 기능 추가가 필요한 경우:
1. GitHub Issues 등록
2. 상세한 오류 내용과 브라우저 정보 포함

### 업데이트
- 정기적인 보안 업데이트 권장
- 새로운 기능 추가 시 백업 후 적용

## 📋 체크리스트

배포 전 확인사항:

- [ ] 모든 링크가 정상 작동하는지 확인
- [ ] 다양한 기기에서 반응형 디자인 테스트
- [ ] PWA 설치 기능 테스트
- [ ] 오프라인 모드 테스트
- [ ] 모든 공약 데이터가 정확한지 확인
- [ ] 연락처 정보가 최신인지 확인
- [ ] SNS 링크가 올바른지 확인

## 📝 라이선스

이 프로젝트는 선거 캠페인 목적으로 제작되었으며, 관련 선거법을 준수합니다.

---

**진안을 새롭게, 군민을 이롭게!**  
이우규 후보를 응원해주세요! 🙏