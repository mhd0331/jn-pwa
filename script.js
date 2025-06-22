// 이우규 후보 PWA 메인 스크립트 - data.json 로드 버전

// 전역 변수
let currentPromiseData = null;
let deferredPrompt = null;
let appData = null;
let currentSection = 'home';

// 브라우저 확장 프로그램 간섭 방지 및 에러 처리 개선
window.addEventListener('error', function(event) {
    if (event.filename && (
        event.filename.includes('chrome-extension://') ||
        event.filename.includes('moz-extension://') ||
        event.filename.includes('content.js') ||
        event.filename.includes('content_script')
    )) {
        console.log('[EXTENSION] 브라우저 확장 프로그램 에러 무시:', event.message);
        event.preventDefault();
        return false;
    }
    console.error('[WEBSITE ERROR]:', event.error);
});

// data.json 로드 함수
async function loadAppData() {
    try {
        console.log('[DATA] data.json 로드 시작...');
        const response = await fetch('./data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[DATA] data.json 로드 성공:', data);
        
        return data;
    } catch (error) {
        console.error('[DATA] data.json 로드 실패:', error);
        
        // 폴백 데이터 - 최소한의 기본 데이터
        return {
            candidate: {
                name: "이우규",
                position: "진안군수 후보",
                party: "더불어민주당",
                slogan: "진안을 새롭게, 군민을 이롭게",
                vision: "국민주권정부 시대, 진안형 기본사회위원회 구축",
                description: "진안군민께서 84.4%라는 높은 투표율과 83.69%의 압도적 지지로 보여주신 국민주권정부에 대한 염원을 진안군 차원에서 실현하겠습니다.",
                experience: [],
                values: []
            },
            corePromises: [
                {id: 'participation', title: '주민참여행정', icon: '🤝', color: 'blue'},
                {id: 'welfare', title: '삶의 질 향상 및 공동체 활력', icon: '💝', color: 'emerald'},
                {id: 'economy', title: '지속가능한 경제 성장', icon: '💼', color: 'green'},
                {id: 'administration', title: '미래 100년 행정 혁신', icon: '🏛️', color: 'indigo'},
                {id: 'infrastructure', title: '주거 및 산업 인프라', icon: '🚌', color: 'orange'},
                {id: 'population', title: '미래 100년 인구 유입', icon: '🏡', color: 'purple'}
            ],
            townshipPromises: [
                {id: 'jinan', name: '진안읍', population: '약 9,605명', characteristics: '군청 소재지, 상업·행정 중심지'},
                {id: 'donghyang', name: '동향면', population: '약 1,200명', characteristics: '수려한 자연환경, 생태관광 잠재력'},
                {id: 'maryeong', name: '마령면', population: '약 1,800명', characteristics: '농업 중심지, 인삼 특산지'},
                {id: 'baegun', name: '백운면', population: '약 1,400명', characteristics: '농기계 임대사업소 운영, 고령화 진행'},
                {id: 'bugui', name: '부귀면', population: '약 1,100명', characteristics: '고랭지 농업, 금강·섬진강 발원지'},
                {id: 'sangjeon', name: '상전면', population: '약 919명', characteristics: '용담댐 수몰지역, 교육시설 부족'},
                {id: 'seongsu', name: '성수면', population: '약 1,693명', characteristics: '의료 취약지, 고산 협곡 지역'},
                {id: 'ancheon', name: '안천면', population: '약 1,055명', characteristics: '전북 최소 인구, 용담댐 수몰 영향'},
                {id: 'yongdam', name: '용담면', population: '약 1,800명', characteristics: '용담호 관광자원, 수변 레저 잠재력'},
                {id: 'jeongcheon', name: '정천면', population: '약 2,100명', characteristics: '수몰민 최대 지역, 아토피 치유마을'},
                {id: 'jucheon', name: '주천면', population: '약 902명', characteristics: '인구 소멸 위기, 운일암반일암 관광지'}
            ],
            promiseDetails: {},
            news: []
        };
    }
}

// 로딩 표시/숨김 함수
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// 페이지 로드 시 초기화 - 수정된 버전
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[APP] 초기화 시작');
    
    try {
        // 로딩 표시
        showLoading();
        
        // 1단계: 네비게이션 바 수정 (최우선)
        console.log('[APP] 1단계: 네비게이션 바 수정');
        fixNavigationVisibility();
        
        // 짧은 지연 후 네비게이션 이벤트 설정
        setTimeout(() => {
            setupNavigationEvents();
        }, 100);
        
        // 2단계: 섹션 초기화
        console.log('[APP] 2단계: 섹션 초기화');
        initializeSections();
        
        // 3단계: 데이터 로드
        console.log('[APP] 3단계: 데이터 로드');
        appData = await loadAppData();
        
        if (!appData) {
            throw new Error('앱 데이터 로드 실패');
        }
        
        // 4단계: 데이터 렌더링
        console.log('[APP] 4단계: 데이터 렌더링');
        loadCorePromises();
        loadTownshipPromises();
        loadCandidateProfile();
        loadLatestNews();
        
        // 5단계: 홈 섹션 표시
        console.log('[APP] 5단계: 홈 섹션 표시');
        showSection('home');
        
        // 6단계: 네비게이션 재확인
        setTimeout(() => {
            console.log('[APP] 6단계: 네비게이션 재확인');
            fixNavigationVisibility();
        }, 200);
        
        console.log('[APP] 초기화 완료');
    } catch (error) {
        console.error('[APP] 초기화 오류:', error);
        showErrorFallback();
    } finally {
        // 로딩 숨김
        setTimeout(() => {
            hideLoading();
        }, 300);
    }
});

// 네비게이션 바 가시성 문제 해결
function fixNavigationVisibility() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const desktopMenu = document.querySelector('nav .nav-desktop-menu');
    const mobileMenuButton = document.querySelector('nav > button:last-child');
    
    if (!header) {
        console.error('[NAV] 헤더 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    if (!nav) {
        console.error('[NAV] 네비게이션 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    // 헤더 강제 표시
    header.style.display = 'block';
    header.style.visibility = 'visible';
    header.style.opacity = '1';
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.zIndex = '50';
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    header.style.backdropFilter = 'blur(4px)';
    header.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
    
    // 네비게이션 강제 표시
    nav.style.display = 'flex';
    nav.style.visibility = 'visible';
    nav.style.opacity = '1';
    nav.style.alignItems = 'center';
    nav.style.justifyContent = 'space-between';
    nav.style.padding = '0.75rem 1rem';
    nav.style.maxWidth = '1024px';
    nav.style.margin = '0 auto';
    
    // 로고 버튼 강제 표시
    const logoButton = nav.querySelector('button:first-child');
    if (logoButton) {
        logoButton.style.display = 'flex';
        logoButton.style.visibility = 'visible';
        logoButton.style.opacity = '1';
        logoButton.style.alignItems = 'center';
        logoButton.style.color = '#1d4ed8';
        logoButton.style.fontWeight = '700';
        logoButton.style.fontSize = '1.25rem';
    }
    
    // 화면 크기에 따른 처리
    const isDesktop = window.innerWidth >= 768;
    
    if (isDesktop) {
        // 데스크톱: 메뉴 표시, 햄버거 버튼 숨김
        if (desktopMenu) {
            desktopMenu.style.display = 'flex';
            desktopMenu.style.visibility = 'visible';
            desktopMenu.style.opacity = '1';
            desktopMenu.style.gap = '1.5rem';
            desktopMenu.style.alignItems = 'center';
        }
        
        if (mobileMenuButton) {
            mobileMenuButton.style.display = 'none';
        }
    } else {
        // 모바일: 메뉴 숨김, 햄버거 버튼 표시
        if (desktopMenu) {
            desktopMenu.style.display = 'none';
        }
        
        if (mobileMenuButton) {
            mobileMenuButton.style.display = 'block';
            mobileMenuButton.style.visibility = 'visible';
            mobileMenuButton.style.opacity = '1';
        }
    }
    
    // 모든 네비게이션 버튼 스타일 적용
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
    });
    
    console.log('[NAV] 네비게이션 가시성 수정 완료 - ' + (isDesktop ? '데스크톱' : '모바일') + ' 모드');
}

// 화면 크기 변경 시 네비게이션 다시 조정
function handleResize() {
    fixNavigationVisibility();
}

// 리사이즈 이벤트 리스너 추가
window.addEventListener('resize', handleResize);

// 네비게이션 이벤트 설정
function setupNavigationEvents() {
    // 데스크톱 네비게이션 버튼들
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                try {
                    // onclick 내용 실행
                    eval(onclick);
                } catch (error) {
                    console.error('[NAV] 버튼 클릭 오류:', error);
                }
            }
        });
    });
    
    // 모바일 메뉴 토글 버튼 - 다양한 방법으로 찾기
    let mobileMenuToggle = document.querySelector('[onclick="toggleMobileMenu()"]');
    if (!mobileMenuToggle) {
        mobileMenuToggle = document.querySelector('nav > button:last-child');
    }
    if (!mobileMenuToggle) {
        mobileMenuToggle = document.querySelector('button[onclick*="toggleMobileMenu"]');
    }
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMobileMenu();
        });
        console.log('[NAV] 모바일 메뉴 토글 버튼 이벤트 설정 완료');
    } else {
        console.warn('[NAV] 모바일 메뉴 토글 버튼을 찾을 수 없습니다');
    }
    
    // 로고 클릭 이벤트 - 다양한 방법으로 찾기
    let logoButton = document.querySelector('[onclick="showSection(\'home\')"]');
    if (!logoButton) {
        logoButton = document.querySelector('nav > button:first-child');
    }
    
    if (logoButton) {
        logoButton.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('home');
        });
        console.log('[NAV] 로고 버튼 이벤트 설정 완료');
    } else {
        console.warn('[NAV] 로고 버튼을 찾을 수 없습니다');
    }
    
    console.log('[NAV] 네비게이션 이벤트 설정 완료');
}

// 섹션 초기화 - 개선된 버전
function initializeSections() {
    const sections = document.querySelectorAll('.page-section');
    if (sections.length === 0) {
        console.warn('[SECTION] 섹션 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    sections.forEach(section => {
        section.classList.remove('section-active');
        section.classList.add('section-hidden');
        section.style.display = 'none';
        section.style.opacity = '0';
        section.style.visibility = 'hidden';
    });
    
    console.log('[SECTION] 섹션 초기화 완료:', sections.length);
}

// 6대 핵심 공약 로드 - 에러 처리 추가
function loadCorePromises() {
    const gridElement = document.getElementById('core-promises-grid');
    if (!gridElement) {
        console.warn('[PROMISE] core-promises-grid 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    if (!appData || !appData.corePromises) {
        console.warn('[PROMISE] 앱 데이터 또는 핵심 공약 데이터가 없습니다');
        gridElement.innerHTML = '<p class="text-gray-500 col-span-full text-center">공약 데이터를 불러오는 중...</p>';
        return;
    }
    
    try {
        gridElement.innerHTML = appData.corePromises.map(promise => {
            // Tailwind 정적 클래스 사용
            let bgClass = 'bg-gray-50 hover:bg-gray-100';
            let textClass = 'text-gray-800';
            
            switch(promise.color) {
                case 'blue': bgClass = 'bg-blue-50 hover:bg-blue-100'; textClass = 'text-blue-800'; break;
                case 'emerald': bgClass = 'bg-emerald-50 hover:bg-emerald-100'; textClass = 'text-emerald-800'; break;
                case 'green': bgClass = 'bg-green-50 hover:bg-green-100'; textClass = 'text-green-800'; break;
                case 'indigo': bgClass = 'bg-indigo-50 hover:bg-indigo-100'; textClass = 'text-indigo-800'; break;
                case 'orange': bgClass = 'bg-orange-50 hover:bg-orange-100'; textClass = 'text-orange-800'; break;
                case 'purple': bgClass = 'bg-purple-50 hover:bg-purple-100'; textClass = 'text-purple-800'; break;
            }
            
            return `
                <div class="promise-card text-center flex flex-col justify-center items-center cursor-pointer transform transition-all duration-300 hover:scale-105 ${bgClass}" 
                     onclick="showPromiseDetail('${promise.id}')">
                    <div class="text-3xl mb-3">${promise.icon}</div>
                    <p class="font-bold text-sm md:text-base ${textClass}">${promise.title}</p>
                </div>
            `;
        }).join('');
        
        console.log('[PROMISE] 6대 핵심 공약 로드 완료');
    } catch (error) {
        console.error('[PROMISE] 6대 공약 로드 오류:', error);
        gridElement.innerHTML = '<p class="text-red-500 col-span-full text-center">공약 로딩 중 오류가 발생했습니다.</p>';
    }
}

// 면단위 공약 로드 - 에러 처리 추가
function loadTownshipPromises() {
    const gridElement = document.getElementById('township-grid-content');
    if (!gridElement) {
        console.warn('[TOWNSHIP] township-grid-content 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    if (!appData || !appData.townshipPromises) {
        console.warn('[TOWNSHIP] 면단위 공약 데이터가 없습니다');
        gridElement.innerHTML = '<p class="text-gray-500 col-span-full text-center">면단위 공약 데이터를 불러오는 중...</p>';
        return;
    }
    
    try {
        gridElement.innerHTML = appData.townshipPromises.map(township => `
            <div class="promise-card text-center hover:bg-blue-500 hover:text-white transition-all cursor-pointer" 
                 onclick="showPromiseDetail('${township.id}')">
                <div class="font-bold text-lg mb-2">${township.name}</div>
                <div class="text-xs text-gray-600 mb-1">${township.population}</div>
                <div class="text-xs text-gray-500">${township.characteristics}</div>
            </div>
        `).join('');
        
        console.log('[TOWNSHIP] 면단위 공약 로드 완료');
    } catch (error) {
        console.error('[TOWNSHIP] 면단위 공약 로드 오류:', error);
        gridElement.innerHTML = '<p class="text-red-500 col-span-full text-center">면단위 공약 로딩 중 오류가 발생했습니다.</p>';
    }
}

// 후보자 프로필 로드 - 에러 처리 추가
function loadCandidateProfile() {
    if (!appData || !appData.candidate) {
        console.warn('[PROFILE] 후보자 데이터가 없습니다');
        return;
    }
    
    const candidate = appData.candidate;
    const profileElement = document.getElementById('candidate-profile');
    const experienceElement = document.getElementById('candidate-experience');
    const visionElement = document.getElementById('candidate-vision');
    
    if (!profileElement) {
        console.warn('[PROFILE] candidate-profile 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    try {
        // 기본 프로필
        profileElement.innerHTML = `
            <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div class="profile-candidate-image flex-shrink-0">
                    <div class="image-fallback">${candidate.name}</div>
                </div>
                <div class="text-center md:text-left flex-1">
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">${candidate.name}</h3>
                    <p class="text-blue-600 font-semibold text-lg mb-3">${candidate.position}</p>
                    <p class="text-gray-700 text-lg italic mb-4">"${candidate.slogan}"</p>
                    <p class="text-gray-600 text-base">${candidate.description}</p>
                </div>
            </div>
        `;
        
        // 경력 사항
        if (experienceElement && candidate.experience && candidate.experience.length > 0) {
            experienceElement.innerHTML = `
                <h3 class="text-xl font-bold mb-4 flex items-center">
                    <span class="mr-2">📋</span>
                    주요 경력
                </h3>
                <div class="space-y-3">
                    ${candidate.experience.map(exp => `
                        <div class="flex items-start space-x-4 p-4 rounded-lg border border-gray-200">
                            <div class="w-3 h-3 bg-${exp.color}-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div class="flex-1">
                                <div class="flex items-center space-x-2">
                                    <h4 class="font-semibold text-gray-800">${exp.title}</h4>
                                    <span class="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">${exp.period}</span>
                                </div>
                                <p class="text-gray-600 text-sm mt-1">${exp.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // 가치와 비전
        if (visionElement && candidate.values && candidate.values.length > 0) {
            visionElement.innerHTML = `
                <h3 class="text-xl font-bold mb-4 flex items-center">
                    <span class="mr-2">🎯</span>
                    핵심 가치
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${candidate.values.map(value => `
                        <div class="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <h4 class="font-semibold text-gray-800 mb-2">${value.title}</h4>
                            <p class="text-gray-600 text-sm">${value.description}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        console.log('[PROFILE] 후보자 프로필 로드 완료');
    } catch (error) {
        console.error('[PROFILE] 후보자 프로필 로드 오류:', error);
        profileElement.innerHTML = '<p class="text-red-500">프로필 로딩 중 오류가 발생했습니다.</p>';
    }
}

// 최신 소식 로드 - 에러 처리 추가
function loadLatestNews() {
    const newsContentElement = document.getElementById('latest-news-content');
    if (!newsContentElement) {
        console.warn('[NEWS] latest-news-content 엘리먼트를 찾을 수 없습니다');
        return;
    }
    
    if (!appData || !appData.news || appData.news.length === 0) {
        newsContentElement.innerHTML = '<p class="text-gray-500">소식이 없습니다.</p>';
        return;
    }
    
    try {
        const latestNews = appData.news[0];
        newsContentElement.innerHTML = `
            <div class="border-l-4 border-blue-500 pl-4">
                <h4 class="font-semibold">${latestNews.title}</h4>
                <p class="text-gray-600 text-sm mt-1">${latestNews.date} ${latestNews.location || ''}</p>
                <p class="text-gray-700 mt-2">${latestNews.content}</p>
                <button onclick="showSection('news')" class="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                    자세히 보기 →
                </button>
            </div>
        `;
        
        console.log('[NEWS] 최신 소식 로드 완료');
    } catch (error) {
        console.error('[NEWS] 최신 소식 로드 오류:', error);
        newsContentElement.innerHTML = '<p class="text-red-500">소식 로딩 중 오류가 발생했습니다.</p>';
    }
}

// 에러 발생 시 폴백 표시
function showErrorFallback() {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.innerHTML = `
            <div class="text-center py-16">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">페이지 로딩 중 문제가 발생했습니다</h2>
                <p class="text-gray-600 mb-8">데이터 파일을 확인하고 페이지를 새로고침해 주세요.</p>
                <button onclick="window.location.reload()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    새로고침
                </button>
            </div>
        `;
    }
}

// 섹션 전환 함수 - 개선된 버전
function showSection(sectionId) {
    console.log('[NAV] 섹션 전환:', sectionId);
    
    try {
        // 모든 섹션 숨기기
        const sections = document.querySelectorAll('.page-section');
        sections.forEach(section => {
            section.classList.remove('section-active');
            section.classList.add('section-hidden');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });
        
        // 대상 섹션 표시
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.remove('section-hidden');
            targetSection.classList.add('section-active');
            targetSection.style.display = 'block';
            targetSection.style.opacity = '1';
            targetSection.style.visibility = 'visible';
            
            currentSection = sectionId;
            
            // 소식 섹션인 경우 모든 뉴스 로드
            if (sectionId === 'news') {
                loadAllNews();
            }
            
            // 네비게이션 버튼 활성 상태 업데이트
            updateActiveNavButton(sectionId);
            
            window.scrollTo(0, 0);
            
            console.log('[NAV] 섹션 전환 완료:', sectionId);
        } else {
            console.error('[NAV] 섹션을 찾을 수 없습니다:', sectionId + '-section');
        }
    } catch (error) {
        console.error('[NAV] 섹션 전환 오류:', error);
    }
}

// 네비게이션 버튼 활성 상태 업데이트
function updateActiveNavButton(activeSection) {
    // 모든 네비게이션 버튼에서 active 클래스 제거
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 현재 섹션에 해당하는 버튼에 active 클래스 추가
    const activeButton = document.querySelector(`[onclick="showSection('${activeSection}')"]`);
    if (activeButton && activeButton.classList.contains('nav-btn')) {
        activeButton.classList.add('active');
    }
}

// 모든 뉴스 로드
function loadAllNews() {
    const newsContentElement = document.getElementById('news-content');
    if (!newsContentElement) return;
    
    if (!appData || !appData.news || appData.news.length === 0) {
        newsContentElement.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 소식이 없습니다.</p>';
        return;
    }
    
    try {
        newsContentElement.innerHTML = appData.news.map(news => `
            <div class="news-card">
                <div class="flex items-start space-x-4">
                    <div class="w-2 h-16 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg mb-2">${news.title}</h3>
                        <div class="news-meta">
                            <span>📅 ${news.date}</span>
                            ${news.time ? `<span>⏰ ${news.time}</span>` : ''}
                            ${news.location ? `<span>📍 ${news.location}</span>` : ''}
                        </div>
                        <p class="text-gray-700 leading-relaxed mt-2">${news.content}</p>
                        ${news.tags ? `
                            <div class="news-tags mt-3">
                                ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('[NEWS] 모든 뉴스 로드 완료');
    } catch (error) {
        console.error('[NEWS] 뉴스 로드 오류:', error);
        newsContentElement.innerHTML = '<p class="text-red-500 text-center py-8">뉴스 로딩 중 오류가 발생했습니다.</p>';
    }
}

// 공약 상세 보기
function showPromiseDetail(promiseId) {
    console.log('[PROMISE] 공약 상세:', promiseId);
    
    try {
        showSection('promises');
        
        const promiseListView = document.getElementById('promise-list-view');
        const promiseDetailView = document.getElementById('promise-detail-view');
        
        if (promiseListView) promiseListView.classList.add('hidden');
        if (promiseDetailView) promiseDetailView.classList.remove('hidden');
        
        // promiseDetails에서 데이터 찾기
        const promiseData = appData && appData.promiseDetails ? appData.promiseDetails[promiseId] : null;
        
        if (promiseData) {
            currentPromiseData = promiseData;
            
            const titleElement = document.getElementById('promise-detail-title');
            const whyElement = document.getElementById('promise-detail-why');
            const whatElement = document.getElementById('promise-detail-what');
            const howElement = document.getElementById('promise-detail-how');
            
            if (titleElement) titleElement.textContent = promiseData.title;
            if (whyElement) whyElement.textContent = promiseData.why;
            if (whatElement) whatElement.textContent = promiseData.what;
            if (howElement) howElement.textContent = promiseData.how;
        } else {
            console.warn('[PROMISE] 공약 데이터를 찾을 수 없습니다:', promiseId);
            
            // 기본 메시지 표시
            const titleElement = document.getElementById('promise-detail-title');
            const whyElement = document.getElementById('promise-detail-why');
            const whatElement = document.getElementById('promise-detail-what');
            const howElement = document.getElementById('promise-detail-how');
            
            if (titleElement) titleElement.textContent = '공약 준비 중';
            if (whyElement) whyElement.textContent = '해당 공약의 상세 내용을 준비 중입니다.';
            if (whatElement) whatElement.textContent = '곧 자세한 공약 내용을 확인하실 수 있습니다.';
            if (howElement) howElement.textContent = '구체적인 실행 방안을 검토 중입니다.';
        }
        
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('[PROMISE] 공약 상세 표시 오류:', error);
    }
}

// 공약 목록으로 돌아가기
function showPromiseList() {
    const promiseListView = document.getElementById('promise-list-view');
    const promiseDetailView = document.getElementById('promise-detail-view');
    
    if (promiseListView) promiseListView.classList.remove('hidden');
    if (promiseDetailView) promiseDetailView.classList.add('hidden');
}

// 모바일 메뉴 토글 - 에러 처리 추가
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
        console.log('[NAV] 모바일 메뉴 토글');
    } else {
        console.warn('[NAV] 모바일 메뉴 엘리먼트를 찾을 수 없습니다');
    }
}

// SNS 공유 함수들
function shareToFacebook() {
    window.open('https://www.facebook.com/', '_blank');
    showNotification('페이스북으로 이동합니다!', 'success');
}

function shareToInstagram() {
    window.open('https://www.instagram.com/', '_blank');
    showNotification('인스타그램으로 이동합니다!', 'success');
}

function shareToYoutube() {
    window.open('https://www.youtube.com/', '_blank');
    showNotification('유튜브로 이동합니다!', 'success');
}

function shareToKakao() {
    const text = '이우규 후보를 응원해주세요! 진안을 새롭게, 군민을 이롭게!';
    try {
        navigator.clipboard.writeText(text + ' ' + window.location.href);
        showNotification('링크가 복사되었습니다!', 'success');
    } catch (error) {
        console.error('[SHARE] 클립보드 복사 오류:', error);
        showNotification('링크 복사에 실패했습니다.', 'error');
    }
}

function shareWebsite() {
    const url = window.location.href;
    try {
        navigator.clipboard.writeText(url);
        showNotification('홈페이지 링크가 복사되었습니다!', 'success');
    } catch (error) {
        console.error('[SHARE] 웹사이트 링크 복사 오류:', error);
        showNotification('링크 복사에 실패했습니다.', 'error');
    }
}

function sharePromise(platform) {
    if (platform === 'copy') {
        try {
            navigator.clipboard.writeText(window.location.href);
            showNotification('링크가 복사되었습니다!', 'success');
        } catch (error) {
            console.error('[SHARE] 공약 링크 복사 오류:', error);
            showNotification('링크 복사에 실패했습니다.', 'error');
        }
    }
}

// 당원가입 페이지 열기
function openMembershipPage() {
    window.open('https://membership.theminjoo.kr/join/agreeToTerms', '_blank');
    showNotification('더불어민주당 입당신청 페이지로 이동합니다.', 'info');
}

// 알림 표시 - 에러 처리 추가
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.warn('[NOTIFICATION] 알림 컨테이너를 찾을 수 없습니다');
        return;
    }
    
    const colors = {
        success: 'bg-green-100 text-green-800 border border-green-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    
    const notification = document.createElement('div');
    notification.className = `px-6 py-4 rounded-lg shadow-lg mb-4 ${colors[type]} notification`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">✕</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// 전역 함수로 등록 (onclick 이벤트 처리를 위해)
window.showSection = showSection;
window.showPromiseDetail = showPromiseDetail;
window.showPromiseList = showPromiseList;
window.toggleMobileMenu = toggleMobileMenu;
window.shareToFacebook = shareToFacebook;
window.shareToInstagram = shareToInstagram;
window.shareToYoutube = shareToYoutube;
window.shareToKakao = shareToKakao;
window.shareWebsite = shareWebsite;
window.sharePromise = sharePromise;
window.openMembershipPage = openMembershipPage;

// 윈도우 로드 완료 후 최종 네비게이션 확인
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('[APP] 윈도우 로드 완료 - 네비게이션 최종 확인');
        fixNavigationVisibility();
    }, 500);
});

console.log('[SCRIPT] 스크립트 로드 완료 - data.json 로드 방식');