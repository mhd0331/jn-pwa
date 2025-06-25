// 이우규 후보 PWA 서비스 워커 - PWA 설치 기능 개선 버전

const CACHE_NAME = 'jinan-pwa-v5'; // 버전 업
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/data.json',
  // 폰트 캐시
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap',
  // Tailwind CSS (선택적)
  'https://cdn.tailwindcss.com',
  // 후보자 이미지 (있다면)
  '/candidate-photo.jpg'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('[SW] 서비스 워커 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 캐시 열림');
        // 중요한 파일들만 우선 캐시
        const essentialFiles = [
          '/',
          '/index.html',
          '/style.css',
          '/script.js',
          '/manifest.json'
        ];
        
        return cache.addAll(essentialFiles)
          .then(() => {
            console.log('[SW] 필수 파일 캐시 완료');
            // 나머지 파일들은 백그라운드에서 캐시
            const optionalFiles = urlsToCache.filter(url => !essentialFiles.includes(url));
            return Promise.allSettled(
              optionalFiles.map(url => 
                cache.add(url).catch(err => console.warn('[SW] 선택적 파일 캐시 실패:', url, err))
              )
            );
          });
      })
      .catch(err => {
        console.error('[SW] 캐시 실패:', err);
      })
  );
  
  // 즉시 활성화
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  console.log('[SW] 서비스 워커 활성화');
  
  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] 이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 즉시 제어권 획득
      self.clients.claim()
    ])
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Chrome Extension 요청 무시
  if (requestUrl.protocol === 'chrome-extension:' || 
      requestUrl.protocol === 'moz-extension:') {
    return;
  }
  
  // 외부 CDN 요청 처리 (Tailwind, Google Fonts 등)
  if (requestUrl.hostname !== self.location.hostname) {
    event.respondWith(handleExternalRequest(event.request));
    return;
  }
  
  // API 요청이나 동적 데이터는 네트워크 우선
  if (requestUrl.pathname.includes('/api/') || 
      requestUrl.search.includes('v=') || 
      event.request.method !== 'GET') {
    event.respondWith(handleNetworkFirst(event.request));
    return;
  }
  
  // 일반 페이지 요청은 캐시 우선 (오프라인 지원)
  event.respondWith(handleCacheFirst(event.request));
});

// 캐시 우선 전략 (오프라인 지원)
async function handleCacheFirst(request) {
  try {
    // 캐시에서 먼저 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 캐시에서 응답:', request.url);
      
      // 백그라운드에서 캐시 업데이트
      updateCacheInBackground(request);
      
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크에서 가져오기
    console.log('[SW] 네트워크에서 가져오기:', request.url);
    const networkResponse = await fetch(request);
    
    // 성공적인 응답이면 캐시에 저장
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('[SW] 네트워크 실패:', request.url, error);
    
    // 네트워크 실패 시 오프라인 페이지 또는 기본 응답
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/index.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // 기본 오프라인 응답
    return new Response('오프라인입니다. 인터넷 연결을 확인해주세요.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// 네트워크 우선 전략
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 성공적인 응답이면 캐시 업데이트
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('[SW] 네트워크 우선 실패, 캐시 시도:', request.url);
    
    // 네트워크 실패 시 캐시에서 시도
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 외부 요청 처리 (CDN 등)
async function handleExternalRequest(request) {
  try {
    // 캐시 확인
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 네트워크에서 가져오기 (타임아웃 적용)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 성공적인 응답이면 캐시에 저장
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('[SW] 외부 요청 실패:', request.url, error);
    
    // 외부 리소스 실패 시 빈 응답 반환 (페이지가 깨지지 않도록)
    if (request.destination === 'style' || request.destination === 'script') {
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': request.destination === 'style' ? 'text/css' : 'application/javascript' }
      });
    }
    
    throw error;
  }
}

// 백그라운드 캐시 업데이트
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse);
      console.log('[SW] 백그라운드 캐시 업데이트:', request.url);
    }
  } catch (error) {
    console.warn('[SW] 백그라운드 업데이트 실패:', request.url, error);
  }
}

// 메시지 이벤트 처리 (앱에서 서비스 워커와 통신)
self.addEventListener('message', event => {
  console.log('[SW] 메시지 수신:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        }).catch(err => {
          event.ports[0].postMessage({ success: false, error: err.message });
        });
        break;
        
      case 'UPDATE_CACHE':
        updateAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        }).catch(err => {
          event.ports[0].postMessage({ success: false, error: err.message });
        });
        break;
    }
  }
});

// 모든 캐시 삭제
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[SW] 모든 캐시 삭제 완료');
}

// 모든 캐시 업데이트
async function updateAllCaches() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    urlsToCache.map(async url => {
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.warn('[SW] 캐시 업데이트 실패:', url, error);
      }
    })
  );
  console.log('[SW] 캐시 업데이트 완료');
}

// Push 알림 처리 (향후 확장용)
self.addEventListener('push', event => {
  console.log('[SW] Push 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 소식이 있습니다!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '자세히 보기',
        icon: '/action-explore.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('이우규 후보', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('[SW] 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 아무것도 하지 않음
    return;
  } else {
    // 기본 동작: 앱 열기
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 동기화 이벤트 처리 (백그라운드 동기화)
self.addEventListener('sync', event => {
  console.log('[SW] 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      updateAllCaches()
    );
  }
});

// 네트워크 상태 변경 감지
self.addEventListener('online', event => {
  console.log('[SW] 온라인 상태');
  
  // 온라인이 되면 캐시 업데이트
  updateAllCaches();
});

self.addEventListener('offline', event => {
  console.log('[SW] 오프라인 상태');
});

// 에러 처리
self.addEventListener('error', event => {
  console.error('[SW] 서비스 워커 에러:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] 처리되지 않은 Promise 거부:', event.reason);
});

console.log('[SW] 서비스 워커 로드 완료 - PWA 설치 기능 개선 버전');