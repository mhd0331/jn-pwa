# 후보자 사진 설정 가이드

## 📸 이미지 파일 준비

첨부해주신 이우규 후보의 사진을 웹사이트에 적용하는 방법을 안내드립니다.

### 1. 이미지 파일 생성

1. **첨부된 사진을 다운로드**하여 컴퓨터에 저장합니다.

2. **이미지 편집 도구**를 사용하여 다음과 같이 편집합니다:
   - **크기**: 400x400 픽셀 이상 (정사각형 권장)
   - **형식**: JPG 또는 PNG
   - **파일명**: `candidate-photo.jpg`
   - **용량**: 500KB 이하 (웹 최적화)

### 2. 온라인 이미지 편집 도구 활용

#### 무료 온라인 도구들:
- **[Canva](https://canva.com)**: 크기 조정 및 배경 제거
- **[Photopea](https://photopea.com)**: 포토샵과 유사한 기능
- **[Remove.bg](https://remove.bg)**: 배경 제거 (선택사항)
- **[TinyPNG](https://tinypng.com)**: 이미지 용량 압축

#### 편집 순서:
1. 이미지를 400x400 픽셀로 크기 조정
2. 얼굴이 중앙에 위치하도록 자르기
3. 필요시 밝기/대비 조정
4. JPG 형식으로 저장 (품질: 80-90%)
5. 파일명을 `candidate-photo.jpg`로 변경

### 3. 파일 업로드

편집된 이미지 파일을 웹사이트 파일들과 함께 서버에 업로드합니다:

```
웹사이트 루트 폴더/
├── index.html
├── style.css
├── script.js
├── manifest.json
├── sw.js
├── candidate-photo.jpg  ← 여기에 업로드
└── README.md
```

### 4. 파일 경로 확인

웹사이트에서 이미지가 올바르게 표시되는지 확인:
- `https://your-domain.com/candidate-photo.jpg` 직접 접속
- 이미지가 표시되면 성공!

## 🎨 고급 설정

### 다양한 해상도 지원

더 나은 성능을 위해 여러 크기의 이미지를 준비할 수 있습니다:

```
candidate-photo-400.jpg    # 400x400 (기본)
candidate-photo-200.jpg    # 200x200 (모바일)
candidate-photo-800.jpg    # 800x800 (고해상도)
```

### WebP 형식 지원

최신 브라우저를 위한 WebP 형식도 함께 준비:

```html
<picture>
  <source srcset="candidate-photo.webp" type="image/webp">
  <img src="candidate-photo.jpg" alt="이우규 후보" class="candidate-photo">
</picture>
```

## 🔧 문제해결

### 이미지가 보이지 않을 때

1. **브라우저 개발자도구 확인** (F12)
   - Console 탭에서 404 에러 확인
   - Network 탭에서 이미지 로딩 상태 확인

2. **파일명 대소문자 확인**
   - `candidate-photo.jpg` (정확한 파일명)
   - `Candidate-Photo.JPG` (잘못된 예시)

3. **서버 권한 확인**
   - 이미지 파일에 읽기 권한이 있는지 확인
   - 웹 서버가 이미지 파일에 접근할 수 있는지 확인

### 이미지 품질 최적화

```css
/* CSS에서 이미지 품질 개선 */
.candidate-photo {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}
```

## 📱 모바일 최적화

### 반응형 이미지

```css
/* 다양한 화면 크기 대응 */
@media (max-width: 768px) {
    .hero-candidate-image {
        width: 4rem;
        height: 4rem;
    }
}

@media (min-width: 1024px) {
    .profile-candidate-image {
        width: 10rem;
        height: 10rem;
    }
}
```

### 로딩 성능 개선

```html
<!-- 지연 로딩 -->
<img src="candidate-photo.jpg" 
     alt="이우규 후보" 
     class="candidate-photo"
     loading="lazy">
```

## ✅ 최종 체크리스트

- [ ] 이미지 파일이 400x400 픽셀 이상인가?
- [ ] 파일 크기가 500KB 이하인가?
- [ ] 파일명이 `candidate-photo.jpg`인가?
- [ ] 웹서버에 파일이 업로드되었는가?
- [ ] 브라우저에서 이미지가 표시되는가?
- [ ] 모바일에서도 정상 표시되는가?
- [ ] 원형으로 잘려서 표시되는가?

---

이 가이드를 따라하시면 첨부해주신 이우규 후보의 사진이 웹사이트에 완벽하게 적용됩니다! 🎯