// 이우규 후보 PWA 메인 스크립트 - 완전한 수정 버전

// 전역 변수
let currentPromiseData = null;
let deferredPrompt = null;
let appData = null;
let currentSection = 'home';

// 브라우저 확장 프로그램 간섭 방지
window.addEventListener('error', function (event) {
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

// =================================
// 핵심 함수들을 먼저 정의 (전역 함수 등록)
// =================================

// 섹션 전환 함수
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
            
            // Analytics 추적
            if (typeof trackSectionView === 'function') {
                trackSectionView(sectionId);
            }

            window.scrollTo(0, 0);
            console.log('[NAV] 섹션 전환 완료:', sectionId);
        } else {
            console.error('[NAV] 섹션을 찾을 수 없습니다:', sectionId + '-section');
        }
    } catch (error) {
        console.error('[NAV] 섹션 전환 오류:', error);
    }
}

// 공약 상세 표시 함수
function showPromiseDetail(promiseId) {
    console.log('[PROMISE] 공약 상세:', promiseId);

    try {
        // 6대 공약인지 면단위 공약인지 구분
        const corePromiseIds = ['participation', 'welfare', 'economy', 'administration', 'infrastructure', 'population'];
        const isCorePromise = corePromiseIds.includes(promiseId);

        // Analytics 추적
        if (typeof trackPromiseView === 'function') {
            trackPromiseView(promiseId, isCorePromise ? 'core_promise' : 'township_promise');
        }

        if (isCorePromise) {
            // 6대 공약은 홈 섹션에서 모달 형태로 표시
            showCorePromiseModal(promiseId);
            return;
        }

        // 면단위 공약은 기존 방식 유지
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

// 6대 공약 모달 표시 함수
function showCorePromiseModal(promiseId) {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('core-promise-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Analytics 추적
    if (typeof trackModalOpen === 'function') {
        trackModalOpen('core_promise', promiseId);
    }

    // promiseDetails에서 데이터 찾기
    const promiseData = appData && appData.promiseDetails ? appData.promiseDetails[promiseId] : null;

    let title = '공약 준비 중';
    let why = '해당 공약의 상세 내용을 준비 중입니다.';
    let what = '곧 자세한 공약 내용을 확인하실 수 있습니다.';
    let how = '구체적인 실행 방안을 검토 중입니다.';

    if (promiseData) {
        title = promiseData.title;
        why = promiseData.why;
        what = promiseData.what;
        how = promiseData.how;
    }

    // 모달 HTML 생성
    const modalHTML = `
        <div id="core-promise-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl md:text-3xl font-bold text-gray-800">${title}</h2>
                        <button onclick="closeCorePromiseModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>
                    
                    <div class="space-y-6">
                        <div class="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                            <h3 class="text-xl font-bold text-red-600 mb-3 flex items-center">
                                <span class="mr-2">🤔</span> Why? (현황 및 문제점)
                            </h3>
                            <p class="text-gray-700 leading-relaxed">${why}</p>
                        </div>

                        <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                            <h3 class="text-xl font-bold text-blue-600 mb-3 flex items-center">
                                <span class="mr-2">💡</span> What? (약속 내용)
                            </h3>
                            <p class="text-gray-700 leading-relaxed">${what}</p>
                        </div>

                        <div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                            <h3 class="text-xl font-bold text-green-600 mb-3 flex items-center">
                                <span class="mr-2">🎯</span> How? (실천 방안)
                            </h3>
                            <p class="text-gray-700 leading-relaxed">${how}</p>
                        </div>
                    </div>
                    
                    <div class="mt-8 pt-6 border-t bg-gray-50 rounded-lg p-6">
                        <h4 class="text-center font-semibold mb-4 text-lg">이 공약을 공유해서 알려주세요! 📢</h4>
                        <div class="flex justify-center space-x-4">
                            <button onclick="sharePromise('copy')"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                                링크 복사
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById('core-promise-modal');
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeCorePromiseModal();
        }
    });

    // ESC 키로 닫기
    const handleEscape = function (e) {
        if (e.key === 'Escape') {
            closeCorePromiseModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 6대 공약 모달 닫기 함수
function closeCorePromiseModal() {
    const modal = document.getElementById('core-promise-modal');
    if (modal) {
        modal.remove();
    }
}

// 공약 목록으로 돌아가기
function showPromiseList() {
    const promiseListView = document.getElementById('promise-list-view');
    const promiseDetailView = document.getElementById('promise-detail-view');

    if (promiseListView) promiseListView.classList.remove('hidden');
    if (promiseDetailView) promiseDetailView.classList.add('hidden');
}

// 당원가입 페이지 열기
function openMembershipPage() {
    if (typeof trackMembershipClick === 'function') {
        trackMembershipClick('membership_page_button');
    }
    window.open('https://membership.theminjoo.kr/join/agreeToTerms', '_blank');
    showNotification('더불어민주당 입당신청 페이지로 이동합니다.', 'info');
}

// 당원가입 클릭 추적
function trackMembershipClick(location = 'unknown') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'membership_click', {
            'event_category': 'conversion',
            'event_label': location,
            'click_location': location
        });
    }
}

// SNS 공유 함수들
function shareToFacebook() {
    window.open('https://www.facebook.com/', '_blank');
    showNotification('페이스북으로 이동합니다!', 'success');
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('facebook', 'general');
    }
}

function shareToInstagram() {
    window.open('https://www.instagram.com/', '_blank');
    showNotification('인스타그램으로 이동합니다!', 'success');
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('instagram', 'general');
    }
}

function shareToYoutube() {
    window.open('https://www.youtube.com/', '_blank');
    showNotification('유튜브로 이동합니다!', 'success');
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('youtube', 'general');
    }
}

function shareToKakao() {
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('kakao', 'general');
    }
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
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('copy', 'website');
    }
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
        if (typeof trackSocialShare === 'function') {
            trackSocialShare('copy', 'promise');
        }
        try {
            navigator.clipboard.writeText(window.location.href);
            showNotification('링크가 복사되었습니다!', 'success');
        } catch (error) {
            console.error('[SHARE] 공약 링크 복사 오류:', error);
            showNotification('링크 복사에 실패했습니다.', 'error');
        }
    }
}

// 뉴스 상세 보기 모달
function showNewsDetail(newsId) {
    const news = appData.news.find(n => n.id === newsId);
    if (!news || !news.fullContent) return;

    // Analytics 추적
    if (typeof trackNewsView === 'function') {
        trackNewsView(newsId, news.title);
    }
    if (typeof trackModalOpen === 'function') {
        trackModalOpen('news_detail', newsId);
    }

    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById('news-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="news-detail-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">${news.title}</h2>
                            <div class="flex items-center space-x-4 text-sm text-gray-600">
                                <span>📅 ${news.date}</span>
                                ${news.location ? `<span>📍 ${news.location}</span>` : ''}
                                ${news.type ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${news.type}</span>` : ''}
                            </div>
                        </div>
                        <button onclick="closeNewsDetail()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>
                    
                    <div class="prose max-w-none">
                        <div class="bg-blue-50 p-4 rounded-lg mb-6">
                            <p class="text-gray-700 leading-relaxed">${news.fullContent.introduction}</p>
                        </div>
                        
                        <div class="space-y-6">
                            ${news.fullContent.mainPoints.map((point, index) => `
                                <div class="border-l-4 border-blue-500 pl-6">
                                    <h3 class="text-xl font-bold text-gray-800 mb-3">${index + 1}. ${point.title}</h3>
                                    <p class="text-gray-700 leading-relaxed">${point.content}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg mt-6">
                            <h3 class="font-bold text-lg mb-2">맺음말</h3>
                            <p class="text-gray-700 leading-relaxed">${news.fullContent.conclusion}</p>
                        </div>
                    </div>
                    
                    ${news.tags ? `
                        <div class="news-tags mt-6 pt-4 border-t">
                            ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="mt-6 pt-4 border-t text-center">
                        <button onclick="shareNews('${newsId}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                            이 글 공유하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 배경 클릭 시 닫기
    const modal = document.getElementById('news-detail-modal');
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeNewsDetail();
        }
    });

    // ESC 키로 닫기
    const handleEscape = function (e) {
        if (e.key === 'Escape') {
            closeNewsDetail();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// 뉴스 상세 모달 닫기
function closeNewsDetail() {
    const modal = document.getElementById('news-detail-modal');
    if (modal) {
        modal.remove();
    }
}

// 뉴스 공유하기
function shareNews(newsId) {
    if (typeof trackSocialShare === 'function') {
        trackSocialShare('copy', 'news');
    }
    const news = appData.news.find(n => n.id === newsId);
    if (!news) return;

    const shareText = `${news.title} - 이우규 후보 ${news.type}`;
    try {
        navigator.clipboard.writeText(shareText + '\n\n' + window.location.href);
        showNotification('기고문이 복사되었습니다!', 'success');
    } catch (error) {
        console.error('[SHARE] 뉴스 공유 오류:', error);
        showNotification('공유에 실패했습니다.', 'error');
    }
}

// 알림 표시
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

// =================================
// 전역 함수 등록 (즉시 실행)
// =================================
window.showSection = showSection;
window.showPromiseDetail = showPromiseDetail;
window.showPromiseList = showPromiseList;
window.shareToFacebook = shareToFacebook;
window.shareToInstagram = shareToInstagram;
window.shareToYoutube = shareToYoutube;
window.shareToKakao = shareToKakao;
window.shareWebsite = shareWebsite;
window.sharePromise = sharePromise;
window.openMembershipPage = openMembershipPage;
window.closeCorePromiseModal = closeCorePromiseModal;
window.showNewsDetail = showNewsDetail;
window.closeNewsDetail = closeNewsDetail;
window.shareNews = shareNews;
window.trackMembershipClick = trackMembershipClick;

console.log('[SCRIPT] 전역 함수 등록 완료');

// =================================
// 유틸리티 함수들
// =================================

// data.json 로드 함수
async function loadAppData() {
    try {
        console.log('[DATA] data.json 로드 시작...');
        const response = await fetch('./data.json?v=' + Date.now());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[DATA] data.json 로드 성공:', data);
        return data;
    } catch (error) {
        console.error('[DATA] data.json 로드 실패:', error);

        // 폴백 데이터
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
                { id: 'participation', title: '주민참여행정', icon: '🤝', color: 'blue' },
                { id: 'welfare', title: '삶의 질 향상 및 공동체 활력', icon: '💝', color: 'emerald' },
                { id: 'economy', title: '지속가능한 경제 성장', icon: '💼', color: 'green' },
                { id: 'administration', title: '미래 100년 행정 혁신', icon: '🏛️', color: 'indigo' },
                { id: 'infrastructure', title: '주거 및 산업 인프라', icon: '🚌', color: 'orange' },
                { id: 'population', title: '미래 100년 인구 유입', icon: '🏡', color: 'purple' }
            ],
            townshipPromises: [],
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

// 6대 핵심 공약 로드
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
            let bgClass = 'bg-gray-50 hover:bg-gray-100';
            let textClass = 'text-gray-800';

            switch (promise.color) {
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

// 면단위 공약 로드
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

// 후보자 프로필 로드
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
                    <img src="candidate-photo.jpg" alt="이우규 후보" class="candidate-photo"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-fallback" style="display: none;">${candidate.name}</div>
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

// 최신 소식 로드
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
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold">${latestNews.title}</h4>
                    ${latestNews.type ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${latestNews.type}</span>` : ''}
                </div>
                <p class="text-gray-600 text-sm mt-1">${latestNews.date} ${latestNews.location || ''}</p>
                <p class="text-gray-700 mt-2">${latestNews.content}</p>
                <div class="mt-3 flex space-x-4">
                    <button onclick="showSection('news')" class="text-blue-600 text-sm font-semibold hover:underline">
                        모든 소식 보기 →
                    </button>
                    ${latestNews.fullContent ? `
                        <button onclick="showNewsDetail('${latestNews.id}')" class="text-green-600 text-sm font-semibold hover:underline">
                            전문 보기 →
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        console.log('[NEWS] 최신 소식 로드 완료');
    } catch (error) {
        console.error('[NEWS] 최신 소식 로드 오류:', error);
        newsContentElement.innerHTML = '<p class="text-red-500">소식 로딩 중 오류가 발생했습니다.</p>';
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
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-semibold text-lg">${news.title}</h3>
                            ${news.type ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${news.type}</span>` : ''}
                        </div>
                        <div class="news-meta">
                            <span>📅 ${news.date}</span>
                            ${news.time ? `<span>⏰ ${news.time}</span>` : ''}
                            ${news.location ? `<span>📍 ${news.location}</span>` : ''}
                        </div>
                        <p class="text-gray-700 leading-relaxed mt-3">${news.content}</p>
                        ${news.fullContent ? `
                            <button onclick="showNewsDetail('${news.id}')" 
                                    class="mt-3 text-blue-600 text-sm font-semibold hover:underline">
                                전문 보기 →
                            </button>
                        ` : ''}
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

// 네비게이션 바 가시성 문제 해결
function fixNavigationVisibility() {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const mainNavMenu = document.getElementById('main-nav-menu');

    if (!header || !nav) {
        console.error('[NAV] 헤더 또는 네비게이션 엘리먼트를 찾을 수 없습니다');
        return;
    }

    // 헤더 강제 표시
    header.style.display = 'block';
    header.style.visibility = 'visible';
    header.style.opacity = '1';

    // 네비게이션 강제 표시
    nav.style.display = 'flex';
    nav.style.visibility = 'visible';
    nav.style.opacity = '1';

    // 메인 네비게이션 메뉴 강제 표시
    if (mainNavMenu) {
        mainNavMenu.style.display = 'flex';
        mainNavMenu.style.visibility = 'visible';
        mainNavMenu.style.opacity = '1';
    }

    console.log('[NAV] 네비게이션 가시성 수정 완료');
}

// 네비게이션 이벤트 설정
function setupNavigationEvents() {
    const navButtons = [
        { id: 'nav-home', section: 'home' },
        { id: 'nav-promises', section: 'promises' },
        { id: 'nav-profile', section: 'profile' },
        { id: 'nav-news', section: 'news' },
        { id: 'nav-membership', section: 'membership' }
    ];

    let setupCount = 0;

    navButtons.forEach(nav => {
        const button = document.getElementById(nav.id);
        if (button) {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[NAV] 버튼 클릭:', nav.section);
                showSection(nav.section);
            });

            setupCount++;
            console.log('[NAV] 이벤트 설정 완료:', nav.id);
        } else {
            console.warn('[NAV] 버튼을 찾을 수 없음:', nav.id);
        }
    });

    console.log(`[NAV] 네비게이션 이벤트 설정 완료 - ${setupCount}개 버튼 처리`);
}

// 섹션 초기화
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

// 네비게이션 버튼 활성 상태 업데이트
function updateActiveNavButton(activeSection) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeButton = document.getElementById(`nav-${activeSection}`);
    if (activeButton && activeButton.classList.contains('nav-btn')) {
        activeButton.classList.add('active');
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

// 브라우저 확장 프로그램 감지 및 경고
function detectExtensionInterference() {
    // Chrome 확장 프로그램 감지
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        console.log('[EXTENSION] Chrome 확장 프로그램 환경 감지됨');
    }

    // Firefox 확장 프로그램 감지
    if (typeof browser !== 'undefined' && browser.runtime) {
        console.log('[EXTENSION] Firefox 확장 프로그램 환경 감지됨');
    }

    // Content Script 감지
    if (document.documentElement.getAttribute('data-extension-injected')) {
        console.log('[EXTENSION] Content Script 주입 감지됨');
    }
}

// =================================
// Google Analytics 함수들
// =================================

function initGoogleAnalytics() {
    if (typeof gtag !== 'undefined') {
        console.log('[ANALYTICS] Google Analytics 초기화 완료');
        gtag('event', 'site_visit', {
            'event_category': 'engagement',
            'event_label': 'initial_load',
            'value': 1
        });
    }
}

function trackSectionView(sectionName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'section_view', {
            'event_category': 'navigation',
            'event_label': sectionName,
            'section_name': sectionName
        });
    }
}

function trackPromiseView(promiseId, promiseType = 'unknown') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'promise_view', {
            'event_category': 'content_engagement',
            'event_label': promiseId,
            'promise_id': promiseId,
            'promise_type': promiseType
        });
    }
}

function trackSocialShare(platform, content_type = 'general') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            'method': platform,
            'content_type': content_type,
            'event_category': 'social_engagement'
        });
    }
}

function trackModalOpen(modalType, modalId = '') {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_open', {
            'event_category': 'ui_interaction',
            'event_label': modalType,
            'modal_type': modalType,
            'modal_id': modalId
        });
    }
}

function trackNewsView(newsId, newsTitle) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'news_view', {
            'event_category': 'content_engagement',
            'event_label': newsTitle,
            'news_id': newsId
        });
    }
}

function trackEngagementTime() {
    const startTime = Date.now();
    window.addEventListener('beforeunload', function () {
        const engagementTime = Math.round((Date.now() - startTime) / 1000);
        if (typeof gtag !== 'undefined' && engagementTime > 5) {
            gtag('event', 'engagement_time', {
                'event_category': 'user_behavior',
                'value': engagementTime,
                'engagement_time_msec': engagementTime * 1000
            });
        }
    });
}

// =================================
// 페이지 초기화 - DOMContentLoaded 이벤트 (모든 이벤트 리스너 통합)
// =================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('[APP] 초기화 시작 - 완전한 수정 버전');

    // 확장 프로그램 간섭 체크
    detectExtensionInterference();
    
    // 확장 프로그램 관련 콘솔 에러 필터링
    const originalConsoleError = console.error;
    console.error = function (...args) {
        const message = args.join(' ');
        
        // 확장 프로그램 관련 에러는 warn으로 변경
        if (message.includes('content.js') ||
            message.includes('storageChangeDispatcher') ||
            message.includes('chrome-extension') ||
            message.includes('moz-extension')) {
            console.warn('[EXTENSION ERROR]:', ...args);
            return;
        }
        
        // 일반 에러는 그대로 표시
        originalConsoleError.apply(console, args);
    };

    // ✅ 추가 이벤트 리스너들 설정
    console.log('[HTML] 추가 이벤트 리스너 설정 시작');
    
    // 히어로 섹션 당원가입 버튼
    const heroMembershipBtn = document.getElementById('hero-membership-btn');
    if (heroMembershipBtn) {
        heroMembershipBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[HTML] 히어로 당원가입 버튼 클릭');
            if (typeof trackMembershipClick === 'function') {
                trackMembershipClick('hero_section');
            }
            if (typeof showSection === 'function') {
                showSection('membership');
            }
        });
    }

    // 당원가입 페이지 직접 가입 버튼
    const directMembershipBtn = document.getElementById('direct-membership-btn');
    if (directMembershipBtn) {
        directMembershipBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[HTML] 직접 당원가입 버튼 클릭');
            if (typeof openMembershipPage === 'function') {
                openMembershipPage();
            }
        });
    }

    // 공약 목록으로 돌아가기 버튼
    const backToPromiseListBtn = document.getElementById('back-to-promise-list');
    if (backToPromiseListBtn) {
        backToPromiseListBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[HTML] 공약 목록으로 돌아가기 버튼 클릭');
            if (typeof showPromiseList === 'function') {
                showPromiseList();
            }
        });
    }

    // 공약 링크 복사 버튼
    const sharePromiseCopyBtn = document.getElementById('share-promise-copy');
    if (sharePromiseCopyBtn) {
        sharePromiseCopyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[HTML] 공약 링크 복사 버튼 클릭');
            if (typeof sharePromise === 'function') {
                sharePromise('copy');
            }
        });
    }

    // SNS 공유 버튼들 (홈 섹션)
    const shareFacebookBtn = document.getElementById('share-facebook');
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToFacebook === 'function') {
                shareToFacebook();
            }
        });
    }

    const shareInstagramBtn = document.getElementById('share-instagram');
    if (shareInstagramBtn) {
        shareInstagramBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToInstagram === 'function') {
                shareToInstagram();
            }
        });
    }

    const shareYoutubeBtn = document.getElementById('share-youtube');
    if (shareYoutubeBtn) {
        shareYoutubeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToYoutube === 'function') {
                shareToYoutube();
            }
        });
    }

    const shareKakaoBtn = document.getElementById('share-kakao');
    if (shareKakaoBtn) {
        shareKakaoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToKakao === 'function') {
                shareToKakao();
            }
        });
    }

    const shareWebsiteBtn = document.getElementById('share-website');
    if (shareWebsiteBtn) {
        shareWebsiteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareWebsite === 'function') {
                shareWebsite();
            }
        });
    }

    // SNS 공유 버튼들 (공약 페이지 섹션) - 클래스 기반
    const shareFacebookBtns = document.querySelectorAll('.share-facebook-btn');
    shareFacebookBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToFacebook === 'function') {
                shareToFacebook();
            }
        });
    });

    const shareInstagramBtns = document.querySelectorAll('.share-instagram-btn');
    shareInstagramBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToInstagram === 'function') {
                shareToInstagram();
            }
        });
    });

    const shareYoutubeBtns = document.querySelectorAll('.share-youtube-btn');
    shareYoutubeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToYoutube === 'function') {
                shareToYoutube();
            }
        });
    });

    const shareKakaoBtns = document.querySelectorAll('.share-kakao-btn');
    shareKakaoBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareToKakao === 'function') {
                shareToKakao();
            }
        });
    });

    const shareWebsiteBtns = document.querySelectorAll('.share-website-btn');
    shareWebsiteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof shareWebsite === 'function') {
                shareWebsite();
            }
        });
    });

    console.log('[HTML] 추가 이벤트 리스너 설정 완료');

    try {
        // 로딩 표시
        showLoading();

        // 1단계: 섹션 초기화
        console.log('[APP] 1단계: 섹션 초기화');
        initializeSections();

        // 2단계: 네비게이션 바 수정
        console.log('[APP] 2단계: 네비게이션 바 수정');
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });

        fixNavigationVisibility();

        // 3단계: 네비게이션 이벤트 설정
        setTimeout(() => {
            console.log('[APP] 3단계: 네비게이션 이벤트 설정');
            setupNavigationEvents();
        }, 200);

        // 4단계: 데이터 로드
        console.log('[APP] 4단계: 데이터 로드');
        appData = await loadAppData();

        if (!appData) {
            throw new Error('앱 데이터 로드 실패');
        }

        // 5단계: 데이터 렌더링
        console.log('[APP] 5단계: 데이터 렌더링');
        loadCorePromises();
        loadTownshipPromises();
        loadCandidateProfile();
        loadLatestNews();

        // 6단계: Google Analytics 초기화
        setTimeout(() => {
            initGoogleAnalytics();
            trackEngagementTime();
        }, 1000);

        // 7단계: 홈 섹션 표시
        console.log('[APP] 7단계: 홈 섹션 표시');
        showSection('home');

        // 8단계: 네비게이션 최종 확인
        setTimeout(() => {
            console.log('[APP] 8단계: 네비게이션 최종 확인');
            fixNavigationVisibility();
        }, 500);

        console.log('[APP] 초기화 완료 - 완전한 수정 버전');
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

// 윈도우 로드 완료 후 최종 네비게이션 확인
window.addEventListener('load', function () {
    setTimeout(() => {
        console.log('[APP] 윈도우 로드 완료 - 네비게이션 최종 확인');
        fixNavigationVisibility();
    }, 500);
});

console.log('[SCRIPT] 스크립트 로드 완료 - 완전한 수정 버전');