// sw.js 전체 내용을 다음으로 교체

// 이우규 후보 PWA 서비스 워커 - 캐시 개선 버전

const CACHE_NAME = 'jinan-pwa-v2'; // 버전 업
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// 설치
self.addEventListener('install', event => {
  console.log('[SW] 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 캐시 열림');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[SW] 캐시 실패:', err);
      })
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화
self.addEventListener('activate', event => {
  console.log('[SW] 활성화');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // 즉시 제어권 획득
});

// 네트워크 요청 처리 - 개발 중에는 네트워크 우선
self.addEventListener('fetch', event => {
  // Chrome Extension 요청 무시
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // 개발 환경에서는 항상 네트워크 우선, 실패 시에만 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공적인 응답이면 캐시에 저장하고 반환
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시에만 캐시에서 반환
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // 오프라인일 때 기본 페이지 반환
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});