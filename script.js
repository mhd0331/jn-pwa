// 이우규 후보 PWA 메인 스크립트

// 전역 변수
let currentPromiseData = null;
let deferredPrompt = null;
let appData = null; // JSON에서 로드될 전체 데이터
let currentSection = 'home'; // 현재 활성 섹션 추적

// 문서 전체에 클릭 이벤트 위임으로 모든 onclick 속성 처리
document.addEventListener('click', function(e) {
    const target = e.target.closest('[onclick]');
    // onclick 속성 파싱 후 해당 함수 실행
});

// JSON 데이터 로드 함수 - 성능 최적화
async function loadDataFromJSON() {
    try {
        console.log('[DATA] JSON 파일에서 데이터 로드 시도...');
        
        // fetch 타임아웃 설정으로 빠른 실패/복구
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
        
        const response = await fetch('./data.json', {
            signal: controller.signal,
            cache: 'no-cache' // 항상 최신 데이터 로드
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        appData = await response.json();
        console.log('[DATA] JSON 데이터 로드 성공:', appData);
        return true;
    } catch (error) {
        console.error('[DATA] JSON 데이터 로드 실패:', error);
        console.log('[DATA] 기본 데이터로 대체 로드');
        loadFallbackData();
        return false;
    }
}

// 오류 발생시 사용할 기본 데이터 - 모든 11개 면단위 공약 포함
function loadFallbackData() {
    console.log('[DATA] 기본 데이터로 대체 로드');
    appData = {
        candidate: {
            name: "이우규",
            position: "진안군수 후보",
            slogan: "진안을 새롭게, 군민을 이롭게",
            vision: "국민주권정부 시대, 진안형 기본사회위원회 구축",
            description: "진안군민께서 84.4%라는 높은 투표율과 83.69%의 압도적 지지로 보여주신 국민주권정부에 대한 염원을 진안군 차원에서 실현하겠습니다.",
            experience: [
                {
                    title: "제8대 진안군의회 의원",
                    period: "전",
                    description: "진안군 발전을 위한 의정활동과 군민의 목소리를 대변하는 의원으로 활동",
                    color: "blue"
                },
                {
                    title: "더불어민주당 정책위부의장",
                    period: "현",
                    description: "국정 정책 수립 과정에 참여하며 지역 현안을 중앙 정치에 반영",
                    color: "green"
                }
            ],
            values: [
                {
                    title: "국민주권",
                    description: "모든 정책에 주민 참여를 기본 원칙으로 합니다"
                },
                {
                    title: "주민참여",
                    description: "군민의 열린 토론과 의견 수렴 과정을 거쳐 정책을 수립합니다"
                }
            ]
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
        promiseDetails: {
            'participation': {
                id: 'participation',
                title: '주민참여행정',
                why: '농촌 지역 주민참여 제도의 형식적 운영과 실질적 참여 부족.',
                what: '기본사회위원회 운영을 통한 종합적 정책 조정, 찾아가는 찐반장·찐여사 프로그램으로 맞춤형 돌봄 서비스 제공',
                how: '주민, 기업, 시민사회조직, 협동조합 등이 참여하는 기본사회위원회를 구성하고, 주거·의료·돌봄·교육·교통·공공서비스 분야 정책을 총괄 조정하겠습니다.'
            },
            'welfare': {
                id: 'welfare',
                title: '삶의 질 향상 및 공동체 활력',
                why: '농촌 고령화로 인한 돌봄 서비스 수요 급증, 장애인 복지 인프라 부족과 접근성 문제',
                what: '마을별 생활 활력센터 구축으로 공동생활 공간을 조성하고, 장애인 복지 향상을 위한 종합적 지원 체계를 구축',
                how: '마을회관과 노인복지관을 리모델링 및 신축하여 공동급식, 무료 와이파이, 원격의료·행정 서비스를 제공하겠습니다.'
            },
            'economy': {
                id: 'economy',
                title: '지속가능한 경제 성장',
                why: '농촌 지역 경제 침체와 소득 기반 취약, 에너지 자립도 부족과 신재생에너지 활용 미흡',
                what: '지역화폐 발행으로 서민 경제 활로를 확보하고, 지역 협동조합 주도의 소규모 신재생에너지 발전을 지원',
                how: '1인당 15~50만원 지역화폐(10% 할인)를 매월 발행하고, 마을 유휴지와 공공건물을 활용한 태양광 발전사업을 추진하겠습니다.'
            },
            'administration': {
                id: 'administration',
                title: '미래 100년을 위한 행정 혁신',
                why: '농촌 대중교통 서비스의 비효율성과 접근성 문제, 공공 의료기관 인력 부족과 서비스 질 저하',
                what: '수요응답형 행복콜 서비스를 결합한 버스 공영화를 실시하고, 공공 의료기관 기능을 강화하여 의료 서비스를 개선',
                how: 'DRT 중심의 하이브리드형 완전 공영제를 도입하고, 고정노선과 DRT 존을 설정하여 맞춤형 교통 서비스를 제공하겠습니다.'
            },
            'infrastructure': {
                id: 'infrastructure',
                title: '주거 및 산업 인프라 개선',
                why: '산업단지 운영을 위한 전력 인프라 부족, 첨단 산업 유치를 위한 초고속 통신망 미비',
                what: '전력 및 초고속 광통신망을 신규 유치하고, 용담호 주변 하수처리시설을 설치하여 수질을 보전',
                how: '새만금 송배전망 및 변전소를 유치하고, 주천 양수발전 송배전망 활용을 검토하겠습니다.'
            },
            'population': {
                id: 'population',
                title: '미래 100년을 위한 인구 유입 방안',
                why: '인구 소멸 위기(2024년 기준 2.5만명), 청년층 지속적 유출과 고령화 심화',
                what: '시행 중인 인구유입 정책 예산을 증액하고, 귀농 청년층 대상 장기 임대형 스마트팜 고원농업 단지를 확충',
                how: '청년 정착 지원금, 신혼부부 주택자금, 출산장려금을 증액하고, 진안읍 인근 5만평 규모 스마트팜 단지를 건설하겠습니다.'
            },
            // 면단위 공약 상세 정보
            'jinan': {
                id: 'jinan',
                title: '진안읍 종합 발전 계획',
                why: '진안읍은 군의 중심지로서 상업과 행정의 중심 역할을 하고 있으나, 주차난과 도심 공동화 현상이 심화되고 있으며, 정주 여건이 미흡한 상황입니다.',
                what: '진안고원시장 종합 리뉴얼 및 복합문화공간 조성(80억원), 스마트 주차관리 시스템 구축(50억원), 청년 정착 지원 종합 패키지(200억원)을 추진하겠습니다.',
                how: '1단계(2026-2027)로 시장 현대화 사업을 시행하고, 2단계(2028-2029)로 복합문화공간을 조성하겠습니다. 공영주차장을 기존 200면에서 800면으로 확충하고, 신혼부부 정착지원금 2,000만원을 지원하겠습니다.'
            },
            'donghyang': {
                id: 'donghyang',
                title: '동향면 생태관광 거점 조성',
                why: '동향면은 수려한 자연환경을 보유하고 있으나 이를 활용한 관광 인프라가 부족하고, 디지털 격차 문제와 최근 인구 감소 추세가 지속되고 있습니다.',
                what: '수변생태공원 조성 및 민물고기 보호센터 건립(25억원), 디지털 소통망 구축 및 정보격차 해소(8억원)를 추진하겠습니다.',
                how: '1단계(2026-2027)로 하천생태 정밀조사 및 기본계획을 수립하고, 2단계(2028-2029)로 수변생태공원 1단계를 조성하겠습니다.'
            },
            'maryeong': {
                id: 'maryeong',
                title: '마령면 스마트농업 클러스터 조성',
                why: '마령면은 농업이 주산업이나 기존 농법의 한계와 고령화로 인한 농업 인력 부족 문제가 심각하며, 고령화가 49.8%에 달하는 상황입니다.',
                what: '청년농업인 스마트팜 창업단지 조성, 마령시장 부활 마령장터 365 프로젝트, 마이산 연계 마령 힐링 스테이 개발을 추진하겠습니다.',
                how: '임대형 스마트팜 5동을 조성하고 청년농업인에게 월 100만원 정착지원금을 3년간 지급하며, AI 기반 인삼재배 기술을 도입하겠습니다.'
            },
            'baegun': {
                id: 'baegun',
                title: '백운면 농기계 혁신 및 생활환경 개선',
                why: '교통 불편으로 전원부지 분양 어려움이 지속되고, 행복콜택시 2대로 수요 대비 부족하며, 65세 이상 고령인구 비율이 20.3%에 달하는 상황입니다.',
                what: '농기계 임대사업 혁신(24시간 언제든지), 상가·편의시설 유치 및 생활편의 확충, 백운면 특화 관광상품 개발을 추진하겠습니다.',
                how: '주말 및 공휴일 운영을 확대하여 연중무휴로 운영하고, 온라인 예약 시스템을 구축하며, 농기계 종류를 35종에서 50종으로 확대하겠습니다.'
            },
            'bugui': {
                id: 'bugui',
                title: '부귀면 산양유 특화단지 조성',
                why: '해발 1,126m 운장산 줄기의 고랭지 지역으로 금강·섬진강의 발원지인 청정지역이나 인구감소 위기에 직면하고 있습니다.',
                what: '산양유 특화단지 조성 및 6차 산업 육성(100억원), 청년 농업인 정착 지원 및 스마트팜 육성, 친환경 에너지 자립마을 조성을 추진하겠습니다.',
                how: '1단계(2026-2027)로 산양 사육 시범단지를 조성하고, 2단계(2028-2029)로 산양유 가공시설 및 체험센터를 건립하겠습니다.'
            },
            'sangjeon': {
                id: 'sangjeon',
                title: '상전면 교육·의료·생활환경 종합 개선',
                why: '1999년 상전초등학교 폐교 이후 면 내 교육기관이 전무하고, 466가구 919명이 거주하는 소규모 면으로 용담댐으로 인해 농업 기반이 크게 약화된 상태입니다.',
                what: '교육환경 개선 및 평생학습 지원(12억원), 의료·복지 서비스 접근성 향상(15억원), 생활환경 개선 및 정주여건 향상을 추진하겠습니다.',
                how: '상전면사무소 내 마을학습센터를 설치하고 진안읍 소재 초·중·고교 통학버스를 무료 운행하겠습니다.'
            },
            'seongsu': {
                id: 'seongsu',
                title: '성수면 의료접근성 혁신 프로젝트',
                why: '농촌지역 주민의 의료기관까지 이동시간이 평균 25-33분이고, 응급실 30분 내 도착률이 66.4%인 의료취약지이며, 인구가 급감했습니다.',
                what: '성수면 의료접근성 혁신 프로젝트(15억원), 특산물 브랜드화 및 판로개척 지원, 체험관광 및 문화콘텐츠 개발을 추진하겠습니다.',
                how: '성수보건지소 응급의료 장비를 확충하고 24시간 응급처치 체계를 구축하며, 원격의료 시스템을 도입하고 이동식 의료버스를 운영하겠습니다.'
            },
            'ancheon': {
                id: 'ancheon',
                title: '안천면 교통·정주·관광 종합 개발',
                why: '인구 1,055명으로 전북특별자치도 읍면동 중 인구가 가장 적고, 용담댐 건설로 안천면 일부가 수몰되었으며, 진안읍보다 금산이 더 가까운 지리적 특성을 가지고 있습니다.',
                what: '교통 인프라 개선 및 접근성 향상, 인구 증가 및 정주 여건 개선, 문화·관광 자원 개발, 환경 보전 및 신재생에너지 보급을 추진하겠습니다.',
                how: '금산-안천-진안 연결 농촌버스를 1일 4회에서 8회로 증편하고, 안천면사무소 중심 교통 환승센터를 조성하겠습니다.'
            },
            'yongdam': {
                id: 'yongdam',
                title: '용담면 수변 레저복합단지 조성',
                why: '용담댐 건설로 인한 수몰지역으로 주민 이주 역사를 가지고 있으며, 용담호를 중심으로 한 관광자원을 보유하고 있으나 활용도가 부족합니다.',
                what: '용담호 수변 레저복합단지 조성(280억원), 용담호 관광 순환코스 고도화 및 스마트 관광 시스템 구축을 추진하겠습니다.',
                how: '1단계(2026-2027)로 수변 레저단지 기본계획을 수립하고, 2단계(2028-2029)로 레저시설 1단계를 조성하겠습니다.'
            },
            'jeongcheon': {
                id: 'jeongcheon',
                title: '정천면 수몰민 역사문화 보상 프로젝트',
                why: '진안군 전체 인구의 약 27.3%에 해당하는 수몰 지역 주민이 발생했고, 용담댐 건설로 1만 2567명의 수몰민이 발생했습니다.',
                what: '용담댐 수몰민 및 피해지역 역사문화 보상 프로젝트, 조림초등학교 글로벌 농촌유학 허브 조성, 운장산 에코힐링 관광벨트 개발을 추진하겠습니다.',
                how: '용담호 수몰민 문화유산센터를 건립하고 수몰민 생활사 디지털 아카이브를 구축하며, 수몰민 자녀 교육 장학금 연 2억원 기금을 조성하겠습니다.'
            },
            'jucheon': {
                id: 'jucheon',
                title: '주천면 주거환경 대혁신 프로젝트',
                why: '불량도로 73%, 하수관 미비, 재래식 화장실 등 생활 불편이 심각하고, 인구 902명으로 지방소멸 위기 상황이지만 운일암반일암 등 천혜 관광자원을 보유하고 있습니다.',
                what: '주거환경 대혁신 새로운 주천 주거복지 프로젝트, 청년 정착 혁신기지 조성 주천 청년 드림 빌리지, 관광문화 르네상스를 추진하겠습니다.',
                how: '도로 정비 및 확장 사업으로 4m 미만 도로를 6m로 확장하고, 상하수도 100% 보급을 달성하며, 슬레이트 지붕 개선 사업을 100% 지원하겠습니다.'
            }
        },
        news: [
            {
                id: "1",
                title: "국민주권정부 시대, 진안형 기본사회위원회 구축 제언 발표",
                date: "2024-07-20",
                location: "더민주 진안 혁신회의 2층",
                content: "이우규 후보가 진안군민의 84.4%라는 높은 투표율과 83.69%의 압도적 지지를 바탕으로 국민주권정부 시대에 맞는 진안형 기본사회위원회 구축 방안을 발표했습니다.",
                tags: ["#국민주권", "#기본사회위원회", "#행정혁신"],
                type: "발표"
            }
        ]
    };
}

// 초기화 - 속도 최적화
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[APP] 이우규 후보 PWA 초기화 시작');
    
    // 병렬로 초기화 작업 수행
    const initPromises = [
        loadDataFromJSON(),
        new Promise(resolve => {
            initializeSections();
            initializeApp();
            setupEventListeners();
            resolve();
        })
    ];
    
    // 모든 초기화 작업을 병렬로 실행
    await Promise.all(initPromises);
    
    // 데이터 기반 UI 렌더링 (비동기로 실행)
    loadInitialData();
    
    // 홈 섹션 즉시 표시
    showSection('home');
    
    console.log('[APP] 초기화 완료');
});

// 로딩 표시/숨김 - 제거 (속도 최적화)
function showLoading(show) {
    // 로딩 오버레이 기능 비활성화하여 속도 향상
    return;
}

// 섹션 초기화 - 간소화 (속도 최적화)
function initializeSections() {
    console.log('[INIT] 섹션 초기화 시작');
    
    const sections = document.querySelectorAll('.page-section');
    sections.forEach((section, index) => {
        // 필수 클래스만 적용
        section.classList.remove('section-active');
        section.classList.add('section-hidden');
        section.style.display = 'none';
        section.setAttribute('aria-hidden', 'true');
        
        console.log(`[INIT] 섹션 ${section.id} 초기화 완료`);
    });
    
    console.log('[INIT] 총', sections.length, '개 섹션 초기화 완료');
}

function initializeApp() {
    console.log('[APP] 앱 초기화 중...');
    
    // PWA 설치 가능 상태 체크
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[APP] PWA로 실행 중');
    }
    
    // 서비스 워커 등록
    registerServiceWorker();
}

function setupEventListeners() {
    console.log('[APP] 이벤트 리스너 설정 중...');
    
    // PWA 설치 관련
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    
    const installBtn = document.getElementById('install-btn');
    const dismissBanner = document.getElementById('dismiss-banner');
    
    if (installBtn) {
        installBtn.addEventListener('click', installApp);
        console.log('[APP] PWA 설치 버튼 이벤트 리스너 설정 완료');
    }
    if (dismissBanner) {
        dismissBanner.addEventListener('click', dismissInstallBanner);
        console.log('[APP] PWA 배너 닫기 버튼 이벤트 리스너 설정 완료');
    }
    
    // 온라인/오프라인 상태
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 브라우저 뒤로가기 버튼 처리
    window.addEventListener('popstate', handlePopState);
    
    console.log('[APP] 모든 이벤트 리스너 설정 완료');
}

// 뒤로가기 버튼 처리
function handlePopState(event) {
    if (event.state && event.state.section) {
        showSection(event.state.section, false); // URL 업데이트 없이 섹션 전환
    }
}

async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('[SW] 서비스 워커 등록 성공:', registration);
        } catch (error) {
            console.error('[SW] 서비스 워커 등록 실패:', error);
        }
    }
}

// PWA 설치 관리
function handleInstallPrompt(e) {
    console.log('[PWA] 설치 프롬프트 이벤트 감지');
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
        installBanner.classList.remove('hidden');
        console.log('[PWA] 설치 배너 표시');
    }
}

async function installApp() {
    console.log('[PWA] 앱 설치 시도 중...');
    
    if (!deferredPrompt) {
        console.log('[PWA] 설치 프롬프트가 없습니다.');
        return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showNotification('앱이 설치되었습니다!', 'success');
        console.log('[PWA] 앱 설치 완료');
    } else {
        console.log('[PWA] 앱 설치 취소됨');
    }
    
    deferredPrompt = null;
    dismissInstallBanner();
}

function dismissInstallBanner() {
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
        installBanner.classList.add('hidden');
        console.log('[PWA] 설치 배너 숨김');
    }
}

// 데이터 로딩 - 비동기 최적화
async function loadInitialData() {
    console.log('[DATA] 초기 데이터 로딩 시작...');
    
    if (!appData) {
        console.error('[DATA] 앱 데이터가 없습니다. 다시 로드를 시도합니다.');
        await loadDataFromJSON();
        if (!appData) {
            console.error('[DATA] 데이터 로드 실패. 기본 데이터를 사용합니다.');
            return;
        }
    }
    
    // 병렬로 데이터 로딩 (블로킹하지 않음)
    Promise.all([
        Promise.resolve(loadCorePromises()),
        Promise.resolve(loadTownshipPromises()),
        Promise.resolve(loadCandidateProfile()),
        Promise.resolve(loadLatestNews())
    ]).then(() => {
        console.log('[DATA] 초기 데이터 로딩 완료');
    }).catch(error => {
        console.error('[DATA] 데이터 로딩 중 오류:', error);
    });
}

function loadCorePromises() {
    console.log('[DATA] 6대 핵심 공약 로딩...');
    
    const gridElement = document.getElementById('core-promises-grid');
    if (!gridElement) {
        console.error('[DATA] core-promises-grid 엘리먼트를 찾을 수 없습니다.');
        return;
    }
    
    if (!appData || !appData.corePromises) {
        console.error('[DATA] 핵심 공약 데이터가 없습니다.');
        return;
    }
    
    gridElement.innerHTML = appData.corePromises.map(promise => `
        <div class="promise-card text-center flex flex-col justify-center items-center cursor-pointer transform transition-all duration-300 hover:scale-105 bg-${promise.color}-50 hover:bg-${promise.color}-100" 
             onclick="showPromiseDetail('${promise.id}')">
            <div class="text-3xl mb-3">${promise.icon}</div>
            <p class="font-bold text-sm md:text-base text-${promise.color}-800">${promise.title}</p>
        </div>
    `).join('');
    
    console.log('[DATA] 6대 핵심 공약 로딩 완료:', appData.corePromises.length, '개');
}

function loadTownshipPromises() {
    console.log('[DATA] 면단위 공약 로딩...');
    
    const gridElement = document.getElementById('township-grid-content');
    if (!gridElement) {
        console.error('[DATA] township-grid-content 엘리먼트를 찾을 수 없습니다.');
        return;
    }
    
    if (!appData || !appData.townshipPromises) {
        console.error('[DATA] 면단위 공약 데이터가 없습니다.');
        return;
    }
    
    gridElement.innerHTML = appData.townshipPromises.map(township => `
        <div class="promise-card text-center hover:bg-blue-500 hover:text-white transition-all cursor-pointer" 
             onclick="showPromiseDetail('${township.id}')">
            <div class="font-bold text-lg mb-2">${township.name}</div>
            <div class="text-xs text-gray-600 mb-1">${township.population}</div>
            <div class="text-xs text-gray-500">${township.characteristics}</div>
        </div>
    `).join('');
    
    console.log('[DATA] 면단위 공약 로딩 완료:', appData.townshipPromises.length, '개');
}

function loadCandidateProfile() {
    console.log('[DATA] 후보자 프로필 로딩...');
    
    if (!appData || !appData.candidate) {
        console.error('[DATA] 후보자 데이터가 없습니다.');
        return;
    }
    
    const candidate = appData.candidate;
    
    // 프로필 카드
    const profileElement = document.getElementById('candidate-profile');
    if (profileElement) {
        profileElement.innerHTML = `
            <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div class="profile-candidate-image flex-shrink-0">
                    <img src="candidate-photo.jpg" alt="${candidate.name} 후보"
                        class="candidate-photo"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-fallback" style="display: none;">${candidate.name}</div>
                </div>
                <div class="text-center md:text-left flex-1">
                    <h3 class="text-3xl font-bold text-gray-800 mb-2">${candidate.name}</h3>
                    <p class="text-blue-600 font-semibold text-lg mb-3">${candidate.position}</p>
                    <p class="text-gray-700 text-lg italic mb-4">"${candidate.slogan}"</p>
                    <div class="flex justify-center md:justify-start space-x-2 flex-wrap gap-2">
                        ${candidate.values ? candidate.values.map(value => `
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">${value.title}</span>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 경력 섹션
    const experienceElement = document.getElementById('candidate-experience');
    if (experienceElement && candidate.experience) {
        experienceElement.innerHTML = `
            <h3 class="text-xl font-bold mb-6 flex items-center">
                <span class="mr-2">📋</span>주요 경력
            </h3>
            <div class="space-y-6">
                ${candidate.experience.map(exp => `
                    <div class="border-l-4 border-${exp.color}-500 pl-6 relative">
                        <div class="absolute -left-2 top-0 w-4 h-4 bg-${exp.color}-500 rounded-full"></div>
                        <h4 class="font-semibold text-lg">${exp.title}</h4>
                        <p class="text-${exp.color}-600 text-sm font-semibold">${exp.period}</p>
                        <p class="text-gray-700 mt-2">${exp.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 비전 섹션
    const visionElement = document.getElementById('candidate-vision');
    if (visionElement) {
        visionElement.innerHTML = `
            <h3 class="text-xl font-bold mb-6 flex items-center">
                <span class="mr-2">💫</span>비전과 가치
            </h3>
            <div class="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <h4 class="text-lg font-bold text-blue-800 mb-3">${candidate.vision}</h4>
                <p class="text-gray-700 leading-relaxed">
                    ${candidate.description}
                </p>
            </div>
        `;
    }
    
    console.log('[DATA] 후보자 프로필 로딩 완료');
}

function loadLatestNews() {
    console.log('[DATA] 최신 소식 로딩...');
    
    const newsContentElement = document.getElementById('latest-news-content');
    if (!newsContentElement) {
        console.error('[DATA] latest-news-content 엘리먼트를 찾을 수 없습니다.');
        return;
    }
    
    if (!appData || !appData.news || appData.news.length === 0) {
        newsContentElement.innerHTML = `
            <div class="border-l-4 border-blue-500 pl-4">
                <h4 class="font-semibold">새로운 소식을 준비하고 있습니다</h4>
                <p class="text-gray-600 text-sm mt-1">곧 다양한 소식을 전해드리겠습니다.</p>
            </div>
        `;
        return;
    }
    
    // 가장 최근 소식만 표시
    const latestNews = appData.news[0];
    newsContentElement.innerHTML = `
        <div class="border-l-4 border-blue-500 pl-4">
            <h4 class="font-semibold">${latestNews.title}</h4>
            <p class="text-gray-600 text-sm mt-1">${latestNews.date} ${latestNews.location || ''}</p>
            <p class="text-gray-700 mt-2">${latestNews.content}</p>
            ${latestNews.tags ? `
                <div class="mt-4 flex flex-wrap gap-2">
                    ${latestNews.tags.map(tag => `
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">${tag}</span>
                    `).join('')}
                </div>
            ` : ''}
            <button onclick="showSection('news')" class="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                자세히 보기 →
            </button>
        </div>
    `;
    
    console.log('[DATA] 최신 소식 로딩 완료');
}

// 페이지 네비게이션 - 섹션 겹침 문제 완전 해결 (속도 최적화)
function showSection(sectionId, updateHistory = true) {
    console.log('[NAV] 섹션 전환 시작:', currentSection, '→', sectionId);
    
    // 이미 현재 섹션이면 무시
    if (currentSection === sectionId) {
        console.log('[NAV] 이미 현재 섹션입니다:', sectionId);
        return;
    }
    
    // 요청된 섹션이 존재하는지 먼저 확인
    const targetSection = document.getElementById(sectionId + '-section');
    if (!targetSection) {
        console.error('[NAV] 섹션을 찾을 수 없습니다:', sectionId + '-section');
        if (sectionId !== 'home') {
            console.log('[NAV] 홈 섹션으로 강제 이동');
            showSection('home');
            return;
        }
    }
    
    // 모든 섹션 즉시 숨기기
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('section-active');
        section.classList.add('section-hidden', 'force-hidden');
        section.style.display = 'none';
        section.style.visibility = 'hidden';
        section.style.opacity = '0';
        section.setAttribute('aria-hidden', 'true');
    });
    
    // 타겟 섹션 즉시 표시 (지연 없음)
    targetSection.classList.remove('section-hidden', 'force-hidden');
    targetSection.classList.add('section-active');
    targetSection.style.display = 'block';
    targetSection.style.visibility = 'visible';
    targetSection.style.opacity = '1';
    targetSection.style.position = 'relative';
    targetSection.style.left = 'auto';
    targetSection.style.top = 'auto';
    targetSection.style.zIndex = '10';
    targetSection.style.pointerEvents = 'auto';
    targetSection.style.transform = 'translateX(0)';
    targetSection.setAttribute('aria-hidden', 'false');
    
    console.log('[NAV] 섹션 표시 완료:', sectionId);
    
    // 현재 섹션 업데이트
    currentSection = sectionId;
    
    // 네비게이션 업데이트
    updateNavigation(sectionId);
    
    // URL 히스토리 업데이트
    if (updateHistory && window.history) {
        const newUrl = window.location.pathname + (sectionId !== 'home' ? `?section=${sectionId}` : '');
        window.history.pushState(
            { section: sectionId }, 
            document.title, 
            newUrl
        );
    }
    
    // 상단으로 스크롤
    window.scrollTo(0, 0);
    
    // 섹션별 특별 처리
    handleSectionSpecifics(sectionId);
    
    console.log('[NAV] 섹션 전환 완료:', currentSection);
}

// 섹션별 특별 처리
function handleSectionSpecifics(sectionId) {
    switch (sectionId) {
        case 'news':
            loadAllNews();
            break;
        case 'promises':
            // 면단위 공약 목록 표시 상태로 초기화
            showPromiseList();
            break;
        default:
            break;
    }
}

// 모든 뉴스 로드
function loadAllNews() {
    const newsContentElement = document.getElementById('news-content');
    if (!newsContentElement || !appData || !appData.news) {
        return;
    }
    
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
                        ${news.status ? `<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">${news.status}</span>` : ''}
                    </div>
                    <p class="text-gray-700 leading-relaxed">${news.content}</p>
                    ${news.tags ? `
                        <div class="news-tags">
                            ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateNavigation(sectionId) {
    // 모든 네비게이션 버튼 초기화
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'text-blue-600', 'font-bold');
        btn.classList.add('text-gray-700');
    });
    
    // 현재 활성 버튼 찾아서 스타일 적용
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.textContent.trim() === getSectionName(sectionId)) {
            btn.classList.remove('text-gray-700');
            btn.classList.add('active', 'text-blue-600', 'font-bold');
            console.log('[NAV] 활성 버튼 설정:', sectionId);
        }
    });
}

function getSectionName(sectionId) {
    const sectionNames = {
        'home': '홈',
        'promises': '면단위 공약',
        'profile': '후보자 소개',
        'news': '소식/일정',
        'membership': '당원가입안내'
    };
    return sectionNames[sectionId] || '';
}

function toggleMobileMenu() {
    console.log('[NAV] 모바일 메뉴 토글');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// 공약 페이지 관리
function showPromiseList() {
    console.log('[PROMISE] 면단위 공약 목록 표시');
    
    const promiseListView = document.getElementById('promise-list-view');
    const promiseDetailView = document.getElementById('promise-detail-view');
    
    if (promiseListView) promiseListView.classList.remove('hidden');
    if (promiseDetailView) promiseDetailView.classList.add('hidden');
}

function showPromiseDetail(promiseId) {
    console.log('[PROMISE] 공약 상세 표시:', promiseId);
    
    // 즉시 공약 섹션으로 이동
    showSection('promises');
    
    // 섹션 전환과 동시에 상세 페이지 준비
    const promiseListView = document.getElementById('promise-list-view');
    const promiseDetailView = document.getElementById('promise-detail-view');
    
    if (promiseListView) promiseListView.classList.add('hidden');
    if (promiseDetailView) promiseDetailView.classList.remove('hidden');
    
    // 공약 데이터 확인 및 렌더링
    if (!appData || !appData.promiseDetails) {
        console.error('[PROMISE] 공약 상세 데이터가 없습니다.');
        showNotification('공약 데이터를 불러올 수 없습니다.', 'error');
        return;
    }
    
    const promiseData = appData.promiseDetails[promiseId];
    if (promiseData) {
        currentPromiseData = promiseData;
        renderPromiseDetail(promiseData);
        console.log('[PROMISE] 공약 상세 렌더링 완료:', promiseId);
    } else {
        console.error('[PROMISE] 공약 데이터를 찾을 수 없습니다:', promiseId);
        
        // 기본 메시지 표시
        renderPromiseDetail({
            title: '공약 정보 준비 중',
            why: '해당 공약의 상세 정보를 준비하고 있습니다.',
            what: '곧 상세한 공약 내용을 확인하실 수 있습니다.',
            how: '자세한 실천 방안은 추후 공개됩니다.'
        });
        showNotification('해당 공약 정보를 준비 중입니다.', 'info');
    }
    
    // 스크롤은 약간의 지연 후 실행 (섹션 전환 완료 대기)
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);
}

function renderPromiseDetail(promiseData) {
    console.log('[PROMISE] 공약 상세 렌더링:', promiseData.title);
    
    const titleElement = document.getElementById('promise-detail-title');
    const whyElement = document.getElementById('promise-detail-why');
    const whatElement = document.getElementById('promise-detail-what');
    const howElement = document.getElementById('promise-detail-how');
    
    if (titleElement) titleElement.textContent = promiseData.title || '제목 없음';
    if (whyElement) whyElement.textContent = promiseData.why || '내용 준비 중입니다.';
    if (whatElement) whatElement.textContent = promiseData.what || '내용 준비 중입니다.';
    if (howElement) howElement.textContent = promiseData.how || '내용 준비 중입니다.';
}

// 공유 기능
function sharePromise(platform) {
    console.log('[SHARE] 공약 공유:', platform);
    
    if (!currentPromiseData) {
        console.error('[SHARE] 현재 공약 데이터가 없습니다.');
        return;
    }
    
    const url = window.location.href;
    const title = currentPromiseData.title;
    const text = `이우규 후보의 "${title}" 공약을 확인해보세요!`;
    
    if (platform === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('링크가 복사되었습니다!', 'success');
            console.log('[SHARE] 링크 복사 완료');
        }).catch(() => {
            showNotification('링크 복사에 실패했습니다.', 'error');
            console.error('[SHARE] 링크 복사 실패');
        });
    }
}

// SNS 공유 기능들
function shareToFacebook() {
    console.log('[SNS] 페이스북 공유');
    
    const url = window.location.href;
    let text = '이우규 후보를 응원해주세요! 진안을 새롭게, 군민을 이롭게!';
    
    // 공약 상세 페이지에서 공유하는 경우 공약 정보 포함
    if (currentPromiseData) {
        text = `이우규 후보의 "${currentPromiseData.title}" 공약을 확인해보세요! 진안을 새롭게, 군민을 이롭게!`;
    }
    
    // SNS 데이터가 있으면 해당 페이지로, 없으면 일반 공유
    if (appData && appData.socialMedia && appData.socialMedia.facebook) {
        window.open(appData.socialMedia.facebook, '_blank');
    } else {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }
    
    showNotification('페이스북으로 공유합니다!', 'success');
}

function shareToInstagram() {
    console.log('[SNS] 인스타그램 공유');
    
    let text = '이우규 후보를 응원해주세요! 진안을 새롭게, 군민을 이롭게! ' + window.location.href;
    
    // 공약 상세 페이지에서 공유하는 경우 공약 정보 포함
    if (currentPromiseData) {
        text = `이우규 후보의 "${currentPromiseData.title}" 공약을 확인해보세요! 진안을 새롭게, 군민을 이롭게! ` + window.location.href;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('링크가 복사되었습니다! 인스타그램에서 붙여넣기 해주세요.', 'success');
        
        // 인스타그램 계정이 있으면 해당 페이지로
        if (appData && appData.socialMedia && appData.socialMedia.instagram) {
            window.open(appData.socialMedia.instagram, '_blank');
        } else {
            window.open('https://www.instagram.com/', '_blank');
        }
    }).catch(() => {
        showNotification('링크 복사에 실패했습니다.', 'error');
    });
}

function shareToYoutube() {
    console.log('[SNS] 유튜브 공유');
    
    // 유튜브 채널이 있다면 해당 URL로
    if (appData && appData.socialMedia && appData.socialMedia.youtube) {
        window.open(appData.socialMedia.youtube, '_blank');
    } else {
        window.open('https://www.youtube.com/', '_blank');
    }
    showNotification('유튜브 채널로 이동합니다!', 'success');
}

function shareToKakao() {
    console.log('[SNS] 카카오톡 공유');
    
    const url = window.location.href;
    let text = '이우규 후보를 응원해주세요! 진안을 새롭게, 군민을 이롭게!';
    
    // 공약 상세 페이지에서 공유하는 경우 공약 정보 포함
    if (currentPromiseData) {
        text = `이우규 후보의 "${currentPromiseData.title}" 공약을 확인해보세요! 진안을 새롭게, 군민을 이롭게!`;
    }
    
    // 카카오톡 공유 (웹에서는 제한적)
    if (/android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
        // 모바일에서는 카카오톡 앱 열기 시도
        const kakaoUrl = `kakaotalk://share?text=${encodeURIComponent(text + ' ' + url)}`;
        window.location.href = kakaoUrl;
        
        // 잠시 후 카카오톡이 설치되지 않은 경우를 대비해 웹으로 fallback
        setTimeout(() => {
            const webKakaoUrl = `https://sharer.kakao.com/talk/friends/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
            window.open(webKakaoUrl, '_blank');
        }, 1000);
    } else {
        // PC에서는 클립보드 복사
        navigator.clipboard.writeText(text + ' ' + url).then(() => {
            showNotification('링크가 복사되었습니다! 카카오톡에서 붙여넣기 해주세요.', 'success');
        }).catch(() => {
            showNotification('링크 복사에 실패했습니다.', 'error');
        });
    }
}

function shareWebsite() {
    console.log('[SNS] 웹사이트 공유');
    
    const url = window.location.href;
    let title = '이우규 후보';
    let text = '이우규 후보 공식 홈페이지 - 진안을 새롭게, 군민을 이롭게!';
    
    // 공약 상세 페이지에서 공유하는 경우 공약 정보 포함
    if (currentPromiseData) {
        title = `이우규 후보 - ${currentPromiseData.title}`;
        text = `이우규 후보의 "${currentPromiseData.title}" 공약 - 진안을 새롭게, 군민을 이롭게!`;
    }
    
    // Web Share API 지원 여부 확인
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            showNotification('공유가 완료되었습니다!', 'success');
            console.log('[SNS] Web Share API 공유 완료');
        }).catch((error) => {
            console.log('[SNS] 공유 취소됨:', error);
        });
    } else {
        // Web Share API를 지원하지 않는 경우 클립보드 복사
        navigator.clipboard.writeText(text + ' ' + url).then(() => {
            showNotification('홈페이지 링크가 복사되었습니다!', 'success');
            console.log('[SNS] 클립보드 복사 완료');
        }).catch(() => {
            showNotification('링크 복사에 실패했습니다.', 'error');
            console.error('[SNS] 클립보드 복사 실패');
        });
    }
}

// 입당신청 페이지 (실제 더불어민주당 입당신청 페이지로 연결)
function openMembershipPage() {
    console.log('[MEMBERSHIP] 당원가입 페이지 열기');
    
    window.open('https://membership.theminjoo.kr/join/agreeToTerms', '_blank');
    showNotification('더불어민주당 입당신청 페이지로 이동합니다.', 'info');
}

// 네트워크 상태 관리
function handleOnline() {
    console.log('[NETWORK] 온라인 상태');
    showNotification('인터넷에 연결되었습니다.', 'success');
}

function handleOffline() {
    console.log('[NETWORK] 오프라인 상태');
    showNotification('오프라인 모드입니다.', 'info');
}

// 유틸리티 함수
function showNotification(message, type = 'info') {
    console.log('[NOTIFICATION]', type.toUpperCase() + ':', message);
    
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('[NOTIFICATION] 알림 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    const notification = document.createElement('div');
    
    const colors = {
        success: 'bg-green-100 text-green-800 border border-green-200',
        error: 'bg-red-100 text-red-800 border border-red-200',
        info: 'bg-blue-100 text-blue-800 border border-blue-200'
    };
    
    notification.className = `px-6 py-4 rounded-lg shadow-lg mb-4 ${colors[type]} notification`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">✕</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// URL 파라미터 기반 초기 섹션 설정
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section && ['home', 'promises', 'profile', 'news', 'membership'].includes(section)) {
        showSection(section, false);
    } else {
        showSection('home', false);
    }
}

// 페이지 로드 완료 후 URL 확인
window.addEventListener('load', () => {
    initializeFromURL();
});

// 에러 핸들링
window.addEventListener('error', function(e) {
    console.error('[ERROR] 전역 에러:', e.error);
    showNotification('앱에서 오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('[ERROR] 처리되지 않은 Promise 거부:', e.reason);
    e.preventDefault();
});