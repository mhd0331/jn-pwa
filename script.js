// 이우규 후보 PWA 메인 스크립트 - 완전한 수정 버전

// 전역 변수
let currentPromiseData = null;
let deferredPrompt = null;
let appData = null;
let currentSection = 'home';
let isInstallPromptShown = false;
let installBannerDismissed = false;

// Floating 홈 버튼 관련 전역 변수
let floatingHomeBtn = null;
let isFloatingBtnVisible = false;

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

// 홈으로 이동 함수
function goToHome() {
    console.log('[FLOATING] 홈으로 이동 버튼 클릭');
    
    // Analytics 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'floating_home_click', {
            'event_category': 'navigation',
            'event_label': 'floating_button',
            'current_section': currentSection
        });
    }
    
    showSection('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Floating 홈 버튼 표시/숨김 함수
function updateFloatingHomeButton(sectionId) {
    const floatingBtn = document.getElementById('floating-home-btn');
    if (!floatingBtn) return;
    
    const shouldShow = sectionId !== 'home';
    
    if (shouldShow && !isFloatingBtnVisible) {
        floatingBtn.classList.remove('hidden');
        isFloatingBtnVisible = true;
    } else if (!shouldShow && isFloatingBtnVisible) {
        floatingBtn.classList.add('hidden');
        isFloatingBtnVisible = false;
    }
}

// Floating 버튼 초기화 함수
function initializeFloatingHomeButton() {
    floatingHomeBtn = document.getElementById('floating-home-btn');
    if (!floatingHomeBtn) return;
    
    floatingHomeBtn.classList.add('hidden');
    isFloatingBtnVisible = false;
}

// =================================
// 수정된 showSection 함수 (Floating 버튼 로직 추가)
// =================================

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

            // 🔧 반투명 문제 해결: 강제로 opacity와 visibility 설정
            requestAnimationFrame(() => {
                targetSection.style.opacity = '1';
                targetSection.style.visibility = 'visible';
                targetSection.style.filter = 'none'; // 필터 효과 제거
                targetSection.style.backdropFilter = 'none'; // 백드롭 필터 제거
            });

            currentSection = sectionId;

            // 🆕 Floating 홈 버튼 상태 업데이트
            updateFloatingHomeButton(sectionId);

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
// PWA 설치 기능 (새로 추가할 함수들)
// =================================

// PWA 설치 가능 여부 확인 및 배너 표시
function checkPWAInstallability() {
    // localStorage 우선 확인 (가장 빠른 체크)
    if (localStorage.getItem('pwa-installed') === 'true') {
        console.log('[PWA] localStorage에서 설치 상태 확인됨');
        return; // 배너 표시하지 않음
    }
    // localStorage에서 배너 해제 상태 확인
    const dismissedTime = localStorage.getItem('pwa-banner-dismissed');
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24시간

    // 24시간 이내에 해제했다면 배너 표시하지 않음
    if (dismissedTime && (now - parseInt(dismissedTime)) < oneDayInMs) {
        console.log('[PWA] 배너가 최근에 해제되어 표시하지 않음');
        return;
    }

    // 이미 설치된 앱인지 확인
    if (isAppInstalled()) {
        console.log('[PWA] 앱이 이미 설치되어 있음');
        return;
    }

    // PWA 설치 조건 확인
    if (isPWAInstallable()) {
        showInstallBanner();
    } else {
        // 모바일에서는 항상 안내 배너 표시 (브라우저별 설치 방법 안내)
        if (isMobileDevice()) {
            showMobileInstallBanner();
        }
    }
}

// PWA 설치 가능 여부 확인
function isPWAInstallable() {
    // 기본 PWA 요구사항 확인
    if ('serviceWorker' in navigator &&
        window.matchMedia('(display-mode: standalone)').matches === false) {
        return true;
    }

    // deferredPrompt가 있으면 설치 가능
    return deferredPrompt !== null;
}

// 앱이 이미 설치되었는지 확인
// 이전: 단순한 2가지 조건만 확인
// 개선: 5가지 조건으로 설치 상태 정확히 감지

function isAppInstalled() {
    // 1. localStorage에서 설치 상태 확인 (가장 우선)
    if (localStorage.getItem('pwa-installed') === 'true') {
        return true;
    }

    // 2. 스탠드얼론 모드로 실행 중인지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
        localStorage.setItem('pwa-installed', 'true');
        return true;
    }

    // 3. iOS Safari에서 홈 화면에 추가된 경우
    if (window.navigator.standalone === true) {
        localStorage.setItem('pwa-installed', 'true');
        return true;
    }

    // 4. URL 파라미터로 PWA 실행 확인
    if (window.location.search.includes('standalone=true')) {
        localStorage.setItem('pwa-installed', 'true');
        return true;
    }

    // 5. 브라우저 설치된 앱 목록 확인 (지원되는 브라우저)
    if ('getInstalledRelatedApps' in navigator) {
        navigator.getInstalledRelatedApps().then(relatedApps => {
            if (relatedApps.length > 0) {
                localStorage.setItem('pwa-installed', 'true');
            }
        });
    }

    return false;
}

// 모바일 디바이스 여부 확인
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
}

// 설치 배너 표시
function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('hidden');
        isInstallPromptShown = true;

        // Analytics 추적
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_banner_shown', {
                'event_category': 'pwa',
                'event_label': 'install_banner'
            });
        }

        console.log('[PWA] 설치 배너 표시됨');
    }
}

// 모바일 설치 안내 배너 표시
function showMobileInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        // 모바일용 텍스트로 변경
        const bannerText = banner.querySelector('span');
        const installBtn = document.getElementById('install-btn');

        if (bannerText && installBtn) {
            if (isIOSDevice()) {
                bannerText.textContent = '📱 Safari에서 공유버튼 > 홈 화면에 추가를 눌러 앱으로 설치하세요!';
                installBtn.textContent = '설치방법';
                installBtn.onclick = showIOSInstallInstructions;
            } else if (isAndroidDevice()) {
                bannerText.textContent = '📱 Chrome 메뉴에서 "앱 설치" 또는 "홈 화면에 추가"를 눌러 설치하세요!';
                installBtn.textContent = '설치방법';
                installBtn.onclick = showAndroidInstallInstructions;
            } else {
                bannerText.textContent = '📱 브라우저 메뉴에서 "앱 설치" 또는 "홈 화면에 추가"를 찾아 설치하세요!';
                installBtn.textContent = '설치방법';
                installBtn.onclick = showGeneralInstallInstructions;
            }

            banner.classList.remove('hidden');
            isInstallPromptShown = true;
        }
    }
}

// iOS 디바이스 확인
function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Android 디바이스 확인
function isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
}

// =================================
// PWA 앱 설치 실행 함수 (완전 코드)
// =================================
async function installPWA() {
    console.log('[PWA] 설치 프로세스 시작');
    
    // 🔒 1단계: 이미 설치된 경우 설치 프로세스 중단
    if (isAppInstalled()) {
        console.log('[PWA] 이미 설치됨 - 설치 프로세스 중단');
        showNotification('앱이 이미 설치되어 있습니다! 📱', 'info');
        hideInstallBanner();
        return;
    }

    // 🔒 2단계: deferredPrompt 확인
    if (!deferredPrompt) {
        console.log('[PWA] deferredPrompt가 없음 - 수동 설치 안내');
        showManualInstallInstructions();
        return;
    }

    // 🎯 3단계: 설치 버튼 UI 상태 변경
    const installBtn = document.getElementById('install-btn');
    let originalBtnHTML = '';
    
    if (installBtn) {
        originalBtnHTML = installBtn.innerHTML;
        installBtn.classList.add('loading');
        installBtn.disabled = true;
        console.log('[PWA] 설치 버튼 로딩 상태 활성화');
    }

    try {
        // 📊 Analytics 추적 - 설치 시도
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_attempted', {
                'event_category': 'pwa',
                'event_label': 'install_button',
                'timestamp': Date.now()
            });
        }

        console.log('[PWA] 설치 프롬프트 표시 중...');
        
        // 🚀 4단계: 설치 프롬프트 표시
        const result = await deferredPrompt.prompt();
        console.log('[PWA] 설치 프롬프트 결과:', result);

        // ⏳ 5단계: 사용자 선택 대기
        const choiceResult = await deferredPrompt.userChoice;
        console.log('[PWA] 사용자 선택:', choiceResult.outcome);

        if (choiceResult.outcome === 'accepted') {
            // ✅ 설치 승인된 경우
            console.log('[PWA] 사용자가 설치를 승인함');
            
            showNotification('앱 설치가 시작됩니다! 🎉', 'success');
            
            // 🔒 6단계: 설치 상태 즉시 저장 (appinstalled 이벤트가 안 올 수도 있음)
            localStorage.setItem('pwa-installed', 'true');
            localStorage.setItem('pwa-install-date', Date.now().toString());
            
            // 🎨 7단계: UI 즉시 업데이트
            hideInstallBanner();
            document.body.classList.add('pwa-installed');
            
            // 📊 Analytics 추적 - 설치 승인
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install_accepted', {
                    'event_category': 'pwa',
                    'event_label': 'user_accepted',
                    'timestamp': Date.now()
                });
            }
            
            console.log('[PWA] 설치 상태 저장 및 UI 업데이트 완료');
            
        } else {
            // ❌ 설치 거부된 경우
            console.log('[PWA] 사용자가 설치를 거부함');
            
            showNotification('설치가 취소되었습니다.', 'info');
            
            // 📊 Analytics 추적 - 설치 거부
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install_dismissed', {
                    'event_category': 'pwa',
                    'event_label': 'user_dismissed',
                    'timestamp': Date.now()
                });
            }
        }

        // 🗑️ 8단계: deferredPrompt 초기화 (일회성 사용)
        deferredPrompt = null;
        console.log('[PWA] deferredPrompt 초기화 완료');

    } catch (error) {
        // ⚠️ 오류 처리
        console.error('[PWA] 설치 오류:', error);
        
        showNotification('설치 중 오류가 발생했습니다.', 'error');
        
        // 대안으로 수동 설치 방법 안내
        showManualInstallInstructions();
        
        // 📊 Analytics 추적 - 설치 오류
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_error', {
                'event_category': 'pwa',
                'event_label': 'install_failed',
                'error_message': error.message,
                'timestamp': Date.now()
            });
        }
        
    } finally {
        // 🔄 9단계: 설치 버튼 상태 복원 (항상 실행)
        if (installBtn) {
            installBtn.classList.remove('loading');
            installBtn.disabled = false;
            
            // 원래 버튼 내용 복원 (로딩 중 변경되었을 수 있음)
            if (originalBtnHTML) {
                setTimeout(() => {
                    installBtn.innerHTML = originalBtnHTML;
                }, 100);
            }
            
            console.log('[PWA] 설치 버튼 상태 복원 완료');
        }
        
        console.log('[PWA] 설치 프로세스 종료');
    }
}

// PWA 설치 상태 주기적 확인
async function registerServiceWorker() {
    // 🆕 서비스 워커 메시지 리스너 추가
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type) {
            switch (event.data.type) {
                case 'PWA_INSTALL_STATUS':
                    if (event.data.installed) {
                        localStorage.setItem('pwa-installed', 'true');
                        hideInstallBanner();
                        document.body.classList.add('pwa-installed');
                    }
                    break;
            }
        }
    });

    // 🆕 정기적 설치 상태 확인 (5분마다)
    setInterval(() => {
        checkInstallStatusPeriodically();
    }, 5 * 60 * 1000);
}

// PWA 설치 상태 주기적 확인 함수
function checkInstallStatusPeriodically() {
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    const isNowInstalled = isAppInstalled();
    
    // 설치 상태가 변경된 경우 처리
    if (!wasInstalled && isNowInstalled) {
        console.log('[PWA] 설치 상태 변경 감지 - 설치됨');
        localStorage.setItem('pwa-installed', 'true');
        hideInstallBanner();
        document.body.classList.add('pwa-installed');
    }
}

// PWA 초기화 함수
async function initializePWA() {
    // 🆕 즉시 설치 상태 확인 및 메타 태그 업데이트
    const currentInstallStatus = isAppInstalled();
    const pwaMeta = document.getElementById('pwa-meta');
    if (pwaMeta) {
        pwaMeta.setAttribute('content', currentInstallStatus.toString());
    }
    
    if (currentInstallStatus) {
        document.body.classList.add('pwa-installed');
    }

    // 🆕 설치 상태 정기 확인 시작
    setTimeout(() => {
        checkInstallStatusPeriodically();
    }, 10000); // 10초 후 시작
}

// 설치 배너 숨기기
function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.add('hidden');
        isInstallPromptShown = false;
    }
}

// 설치 배너 해제 (24시간 동안 표시하지 않음)
function dismissInstallBanner() {
    hideInstallBanner();
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    installBannerDismissed = true;

    // Analytics 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_banner_dismissed', {
            'event_category': 'pwa',
            'event_label': 'user_dismissed_banner'
        });
    }

    console.log('[PWA] 설치 배너 해제됨 (24시간)');
}

// 수동 설치 안내
function showManualInstallInstructions() {
    const userAgent = navigator.userAgent;
    let instructions = '';

    if (isIOSDevice()) {
        instructions = `
            <div class="text-left">
                <h4 class="font-bold mb-2">📱 iPhone/iPad 설치 방법:</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm">
                    <li>Safari 브라우저에서 이 페이지를 열어주세요</li>
                    <li>하단의 <strong>공유 버튼</strong> (⬆️)을 눌러주세요</li>
                    <li><strong>"홈 화면에 추가"</strong>를 선택해주세요</li>
                    <li><strong>"추가"</strong> 버튼을 눌러 완료해주세요</li>
                </ol>
                <p class="text-xs text-gray-600 mt-2">* Chrome이나 다른 브라우저에서는 설치가 제한될 수 있습니다</p>
            </div>
        `;
    } else if (isAndroidDevice()) {
        instructions = `
            <div class="text-left">
                <h4 class="font-bold mb-2">📱 Android 설치 방법:</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm">
                    <li>Chrome 브라우저에서 이 페이지를 열어주세요</li>
                    <li>우상단의 <strong>메뉴 버튼</strong> (⋮)을 눌러주세요</li>
                    <li><strong>"앱 설치"</strong>, <strong>"앱에서 열기"</strong> 또는 <strong>"홈 화면에 추가"</strong>를 선택해주세요</li>
                    <li><strong>"설치"</strong> 또는 <strong>"열기"</strong> 버튼을 눌러 완료해주세요</li>
                </ol>
                <p class="text-xs text-gray-600 mt-2">* 일부 브라우저에서는 메뉴 위치가 다를 수 있습니다</p>
            </div>
        `;
    } else {
        instructions = `
            <div class="text-left">
                <h4 class="font-bold mb-2">💻 데스크톱 설치 방법:</h4>
                <ol class="list-decimal list-inside space-y-1 text-sm">
                    <li>Chrome 또는 Edge 브라우저를 사용해주세요</li>
                    <li>주소창 우측의 <strong>설치 아이콘</strong> (💻)을 클릭하거나</li>
                    <li>브라우저 메뉴에서 <strong>"앱 설치"</strong>, <strong>"앱에서 열기"</strong>를 찾아 클릭해주세요</li>
                    <li><strong>"설치"</strong> 또는 <strong>"열기"</strong> 버튼을 눌러 완료해주세요</li>
                </ol>
                <p class="text-xs text-gray-600 mt-2">* Firefox는 PWA 설치를 지원하지 않습니다</p>
            </div>
        `;
    }

    // 모달 생성
    const modalHTML = `
        <div id="install-instructions-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">앱 설치 방법</h3>
                        <button onclick="closeInstallInstructions()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>
                    ${instructions}
                    <div class="mt-6 pt-4 border-t text-center">
                        <button onclick="closeInstallInstructions()" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Analytics 추적
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_manual_instructions_shown', {
            'event_category': 'pwa',
            'event_label': isIOSDevice() ? 'ios' : isAndroidDevice() ? 'android' : 'desktop'
        });
    }
}

// iOS 설치 안내
function showIOSInstallInstructions() {
    showManualInstallInstructions();
}

// Android 설치 안내
function showAndroidInstallInstructions() {
    showManualInstallInstructions();
}

// 일반 설치 안내
function showGeneralInstallInstructions() {
    showManualInstallInstructions();
}

// 설치 안내 모달 닫기
function closeInstallInstructions() {
    const modal = document.getElementById('install-instructions-modal');
    if (modal) {
        modal.remove();
    }
}

// 서비스 워커 등록
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('[SW] 서비스 워커 등록 성공:', registration);

            // 업데이트 확인
            registration.addEventListener('updatefound', () => {
                console.log('[SW] 새로운 서비스 워커 발견');
                const newWorker = registration.installing;

                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[SW] 새로운 버전 사용 가능');
                            showUpdateNotification();
                        }
                    });
                }
            });

            return registration;
        } catch (error) {
            console.error('[SW] 서비스 워커 등록 실패:', error);
            return null;
        }
    } else {
        console.log('[SW] 서비스 워커를 지원하지 않는 브라우저');
        return null;
    }
}

// 앱 업데이트 알림
function showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.className = 'fixed top-0 left-0 right-0 bg-green-600 text-white p-3 text-center z-50';
    updateBanner.innerHTML = `
        <div class="flex items-center justify-between max-w-4xl mx-auto">
            <span class="text-sm">🔄 새로운 버전이 사용 가능합니다!</span>
            <div class="space-x-2">
                <button id="update-btn" class="bg-white text-green-600 px-3 py-1 rounded text-sm font-semibold">업데이트</button>
                <button id="dismiss-update" class="text-white/80 hover:text-white px-2">✕</button>
            </div>
        </div>
    `;

    document.body.prepend(updateBanner);

    // 업데이트 버튼 이벤트
    document.getElementById('update-btn').addEventListener('click', () => {
        window.location.reload();
    });

    // 닫기 버튼 이벤트
    document.getElementById('dismiss-update').addEventListener('click', () => {
        updateBanner.remove();
    });
}

// =================================
// PWA 이벤트 리스너 등록 함수 (완전 코드)
// =================================
function setupPWAEventListeners() {
    console.log('[PWA] PWA 이벤트 리스너 설정 시작');
    
    // 🎯 1. beforeinstallprompt 이벤트 리스너 (설치 가능 상태)
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] beforeinstallprompt 이벤트 발생');
        
        // 🔒 이미 설치된 경우 프롬프트 무시
        if (isAppInstalled()) {
            console.log('[PWA] 이미 설치됨 - beforeinstallprompt 무시');
            e.preventDefault();
            return;
        }
        
        // 🚫 기본 설치 프롬프트 방지 (커스텀 배너 사용)
        e.preventDefault();
        
        // 📦 deferredPrompt 저장 (나중에 사용)
        deferredPrompt = e;
        console.log('[PWA] deferredPrompt 저장됨');
        
        // 📊 Analytics 추적 - 설치 가능 상태
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_prompt_available', {
                'event_category': 'pwa',
                'event_label': 'beforeinstallprompt_triggered',
                'timestamp': Date.now()
            });
        }

        // ⏰ 3초 후 커스텀 설치 배너 표시
        setTimeout(() => {
            if (!installBannerDismissed && !isAppInstalled()) {
                console.log('[PWA] 커스텀 설치 배너 표시');
                showInstallBanner();
            } else {
                console.log('[PWA] 배너 표시 조건 불충족 - 해제됨 또는 이미 설치됨');
            }
        }, 3000);
    });

    // 🎉 2. appinstalled 이벤트 리스너 (설치 완료)
    window.addEventListener('appinstalled', (event) => {
        console.log('[PWA] 앱 설치 완료 이벤트 수신');
        
        // 🔒 설치 상태를 localStorage에 영구 저장
        localStorage.setItem('pwa-installed', 'true');
        localStorage.setItem('pwa-install-date', Date.now().toString());
        localStorage.setItem('pwa-install-method', 'native_prompt');
        
        // 🎨 설치 배너 즉시 숨김
        hideInstallBanner();
        
        // 🎊 설치 성공 알림 표시
        showNotification('앱이 성공적으로 설치되었습니다! 🎉', 'success');
        
        // 🗑️ deferredPrompt 초기화
        deferredPrompt = null;
        
        // 🎨 페이지에 설치 완료 클래스 추가
        document.body.classList.add('pwa-installed');
        
        // 📝 메타 태그 업데이트
        const pwaMeta = document.getElementById('pwa-meta');
        if (pwaMeta) {
            pwaMeta.setAttribute('content', 'true');
        }
        
        // 📊 Analytics 추적 - 설치 완료
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install_completed', {
                'event_category': 'pwa',
                'event_label': 'app_installed',
                'install_source': 'native_prompt',
                'timestamp': Date.now()
            });
        }
        
        // 📡 서비스 워커에게 설치 완료 알림
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'PWA_INSTALLED',
                installed: true,
                timestamp: Date.now()
            });
        }
        
        console.log('[PWA] 설치 완료 처리 완료');
    });

    // 🖱️ 3. 설치 버튼 이벤트 리스너
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        installBtn.removeEventListener('click', installPWA);
        
        // 새 이벤트 리스너 추가
        installBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('[PWA] 설치 버튼 클릭됨');
            
            // 📊 Analytics 추적 - 버튼 클릭
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install_button_clicked', {
                    'event_category': 'pwa',
                    'event_label': 'install_button',
                    'timestamp': Date.now()
                });
            }
            
            await installPWA();
        });
        
        console.log('[PWA] 설치 버튼 이벤트 리스너 등록됨');
    } else {
        console.warn('[PWA] 설치 버튼을 찾을 수 없음');
    }

    // ❌ 4. 배너 닫기 버튼 이벤트 리스너
    const dismissBtn = document.getElementById('dismiss-banner');
    if (dismissBtn) {
        // 기존 이벤트 리스너 제거 (중복 방지)
        dismissBtn.removeEventListener('click', dismissInstallBanner);
        
        // 새 이벤트 리스너 추가
        dismissBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('[PWA] 배너 닫기 버튼 클릭됨');
            
            // 📊 Analytics 추적 - 배너 해제
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_banner_dismissed', {
                    'event_category': 'pwa',
                    'event_label': 'user_dismissed_banner',
                    'timestamp': Date.now()
                });
            }
            
            dismissInstallBanner();
        });
        
        console.log('[PWA] 배너 닫기 버튼 이벤트 리스너 등록됨');
    } else {
        console.warn('[PWA] 배너 닫기 버튼을 찾을 수 없음');
    }

    // 👁️ 5. 페이지 가시성 변경 이벤트 (탭 전환 감지)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('[PWA] 페이지가 포커스됨 - 설치 상태 재확인');
            
            // 🔍 포커스 시 설치 상태 재확인
            if (isAppInstalled()) {
                console.log('[PWA] 포커스 시 설치 상태 확인됨');
                
                hideInstallBanner();
                localStorage.setItem('pwa-installed', 'true');
                document.body.classList.add('pwa-installed');
                
                // 📝 메타 태그 업데이트
                const pwaMeta = document.getElementById('pwa-meta');
                if (pwaMeta) {
                    pwaMeta.setAttribute('content', 'true');
                }
            }
        }
    });
    
    console.log('[PWA] 페이지 가시성 변경 이벤트 리스너 등록됨');

    // 🔄 6. 윈도우 포커스 이벤트 (브라우저 창 활성화)
    window.addEventListener('focus', () => {
        console.log('[PWA] 윈도우 포커스됨');
        
        // 잠시 후 설치 상태 재확인 (브라우저가 안정화된 후)
        setTimeout(() => {
            if (isAppInstalled()) {
                console.log('[PWA] 윈도우 포커스 시 설치 상태 확인됨');
                hideInstallBanner();
                localStorage.setItem('pwa-installed', 'true');
                document.body.classList.add('pwa-installed');
            }
        }, 500);
    });
    
    console.log('[PWA] 윈도우 포커스 이벤트 리스너 등록됨');

    // 🔄 7. 페이지 로드 시 즉시 설치 상태 확인
    const currentInstallStatus = isAppInstalled();
    if (currentInstallStatus) {
        console.log('[PWA] 페이지 로드 시 설치 상태 확인됨');
        
        document.body.classList.add('pwa-installed');
        hideInstallBanner();
        
        // 📝 메타 태그 업데이트
        const pwaMeta = document.getElementById('pwa-meta');
        if (pwaMeta) {
            pwaMeta.setAttribute('content', 'true');
        }
    }

    // 🔄 8. 브라우저 뒤로/앞으로 가기 이벤트 (popstate)
    window.addEventListener('popstate', () => {
        console.log('[PWA] 브라우저 네비게이션 이벤트');
        
        // 네비게이션 후 설치 상태 재확인
        setTimeout(() => {
            if (isAppInstalled()) {
                hideInstallBanner();
                document.body.classList.add('pwa-installed');
            }
        }, 100);
    });
    
    console.log('[PWA] 브라우저 네비게이션 이벤트 리스너 등록됨');

    // 📱 9. 디바이스 방향 변경 이벤트 (모바일)
    if ('screen' in window && 'orientation' in window.screen) {
        window.screen.orientation.addEventListener('change', () => {
            console.log('[PWA] 화면 방향 변경됨');
            
            // 방향 변경 후 설치 상태 재확인 (모바일에서 중요)
            setTimeout(() => {
                if (isAppInstalled()) {
                    hideInstallBanner();
                    document.body.classList.add('pwa-installed');
                }
            }, 300);
        });
        
        console.log('[PWA] 화면 방향 변경 이벤트 리스너 등록됨');
    }

    // 🔧 10. 서비스 워커 메시지 리스너 (이미 registerServiceWorker에서 설정되지만 추가 보강)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[PWA] 서비스 워커 메시지:', event.data);
            
            if (event.data && event.data.type) {
                switch (event.data.type) {
                    case 'PWA_INSTALL_STATUS':
                        if (event.data.installed) {
                            console.log('[PWA] 서비스 워커로부터 설치 상태 수신');
                            localStorage.setItem('pwa-installed', 'true');
                            hideInstallBanner();
                            document.body.classList.add('pwa-installed');
                        }
                        break;
                        
                    case 'CHECK_INSTALL_STATUS_REQUEST':
                        // 서비스 워커에서 설치 상태 확인 요청
                        const installed = isAppInstalled();
                        console.log('[PWA] 서비스 워커 설치 상태 확인 요청 - 응답:', installed);
                        
                        if (navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage({
                                type: 'PWA_INSTALLED',
                                installed: installed,
                                timestamp: Date.now()
                            });
                        }
                        break;
                }
            }
        });
        
        console.log('[PWA] 서비스 워커 메시지 리스너 등록됨');
    }

    console.log('[PWA] PWA 이벤트 리스너 설정 완료 - 총 10개 리스너 등록됨');
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
window.installPWA = installPWA;
window.dismissInstallBanner = dismissInstallBanner;
window.showIOSInstallInstructions = showIOSInstallInstructions;
window.showAndroidInstallInstructions = showAndroidInstallInstructions;
window.showGeneralInstallInstructions = showGeneralInstallInstructions;
window.closeInstallInstructions = closeInstallInstructions;
window.goToHome = goToHome;
window.updateFloatingHomeButton = updateFloatingHomeButton;
window.initializeFloatingHomeButton = initializeFloatingHomeButton;

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

// hideLoading 함수 수정 (반투명 문제 해결)
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.visibility = 'hidden';
        loadingOverlay.style.pointerEvents = 'none';
        
        // 🔧 반투명 문제 해결: 로딩 오버레이 완전 제거
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none';
            
            // 메인 컨테이너의 opacity 확실히 설정
            const mainElement = document.querySelector('main');
            const pageContainer = document.getElementById('page-container');
            
            if (mainElement) {
                mainElement.style.opacity = '1';
                mainElement.style.filter = 'none';
            }
            
            if (pageContainer) {
                pageContainer.style.opacity = '1';
                pageContainer.style.filter = 'none';
            }
            
            // 현재 활성 섹션 재확인
            const activeSection = document.querySelector('.page-section.section-active');
            if (activeSection) {
                activeSection.style.opacity = '1';
                activeSection.style.visibility = 'visible';
                activeSection.style.filter = 'none';
            }
            
        }, 100);
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
// 수정된 DOMContentLoaded 함수 (Floating 버튼 초기화 추가)
// =================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('[APP] 초기화 시작 - Floating 홈 버튼 포함 버전');

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

    // ✅ 기존 추가 이벤트 리스너들 설정
    console.log('[HTML] 추가 이벤트 리스너 설정 시작');

    // PWA 초기화 함수
    async function initializePWA() {
        console.log('[PWA] PWA 초기화 시작');

        try {
            // 1. 서비스 워커 등록
            await registerServiceWorker();

            // 2. PWA 이벤트 리스너 설정
            setupPWAEventListeners();

            // 3. 설치 가능성 확인 (페이지 로드 후 3초 뒤)
            setTimeout(() => {
                checkPWAInstallability();
            }, 3000);

            console.log('[PWA] PWA 초기화 완료');
        } catch (error) {
            console.error('[PWA] PWA 초기화 오류:', error);
        }
    }

    // 히어로 섹션 당원가입 버튼
    const heroMembershipBtn = document.getElementById('hero-membership-btn');
    if (heroMembershipBtn) {
        heroMembershipBtn.addEventListener('click', function (e) {
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
        directMembershipBtn.addEventListener('click', function (e) {
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
        backToPromiseListBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('[HTML] 공약 목록으로 돌아가기 버튼 클릭');
            if (typeof showPromiseList === 'function') {
                showPromiseList();
            }
        });
    }

    // SNS 공유 버튼들 (홈 섹션)
    const shareFacebookBtn = document.getElementById('share-facebook');
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToFacebook === 'function') {
                shareToFacebook();
            }
        });
    }

    const shareInstagramBtn = document.getElementById('share-instagram');
    if (shareInstagramBtn) {
        shareInstagramBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToInstagram === 'function') {
                shareToInstagram();
            }
        });
    }

    const shareYoutubeBtn = document.getElementById('share-youtube');
    if (shareYoutubeBtn) {
        shareYoutubeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToYoutube === 'function') {
                shareToYoutube();
            }
        });
    }

    const shareKakaoBtn = document.getElementById('share-kakao');
    if (shareKakaoBtn) {
        shareKakaoBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToKakao === 'function') {
                shareToKakao();
            }
        });
    }

    const shareWebsiteBtn = document.getElementById('share-website');
    if (shareWebsiteBtn) {
        shareWebsiteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareWebsite === 'function') {
                shareWebsite();
            }
        });
    }

    // SNS 공유 버튼들 (공약 페이지 섹션) - 클래스 기반
    const shareFacebookBtns = document.querySelectorAll('.share-facebook-btn');
    shareFacebookBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToFacebook === 'function') {
                shareToFacebook();
            }
        });
    });

    const shareInstagramBtns = document.querySelectorAll('.share-instagram-btn');
    shareInstagramBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToInstagram === 'function') {
                shareToInstagram();
            }
        });
    });

    const shareYoutubeBtns = document.querySelectorAll('.share-youtube-btn');
    shareYoutubeBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToYoutube === 'function') {
                shareToYoutube();
            }
        });
    });

    const shareKakaoBtns = document.querySelectorAll('.share-kakao-btn');
    shareKakaoBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (typeof shareToKakao === 'function') {
                shareToKakao();
            }
        });
    });

    const shareWebsiteBtns = document.querySelectorAll('.share-website-btn');
    shareWebsiteBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
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

        // 🆕 9단계: Floating 홈 버튼 초기화
        setTimeout(() => {
            console.log('[APP] 9단계: Floating 홈 버튼 초기화');
            initializeFloatingHomeButton();
            observePWABannerChanges();
            adjustFloatingButtonForPWABanner();
        }, 600);

        // 🆕 10단계: PWA 초기화
        setTimeout(() => {
            console.log('[APP] 10단계: PWA 초기화');
            initializePWA();
        }, 700);

        console.log('[APP] 초기화 완료 - Floating 홈 버튼 포함 버전');
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