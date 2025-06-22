// 이우규 후보 6대 공약 및 면단위 공약 PWA 서비스 워커

const CACHE_NAME = 'jinan-6promises-pwa-v2.0.0';
const STATIC_CACHE = 'jinan-6promises-static-v2.0.0';
const DATA_CACHE = 'jinan-6promises-data-v2.0.0';

// 캐시할 정적 파일들
const staticAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/data.json',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap'
];

// 6대 공약 관련 데이터
const corePromisesData = [
  'participation', 'welfare', 'economy', 
  'administration', 'infrastructure', 'population'
];

// 면단위 공약 관련 데이터
const townshipPromisesData = [
  'jinan', 'donghyang', 'maryeong', 'baegun', 'bugui', 'sangjeon',
  'seongsu', 'ancheon', 'yongdam', 'jeongcheon', 'jucheon'
];

// 서비스 워커 설치
self.addEventListener('install', event => {
  console.log('[SW] 6대 공약 PWA 설치 중...');
  
  event.waitUntil(
    Promise.all([
      // 정적 파일 캐시
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] 정적 파일 캐시 중...');
        return cache.addAll(staticAssets);
      }),
      // 데이터 캐시 초기화
      caches.open(DATA_CACHE).then(cache => {
        console.log('[SW] 데이터 캐시 초기화...');
        return cache.put('/api/promises/core', new Response(JSON.stringify(corePromisesData)));
      })
    ]).catch(error => {
      console.warn('[SW] 캐시 실패:', error);
    })
  );
  
  // 새 서비스 워커를 즉시 활성화
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', event => {
  console.log('[SW] 6대 공약 PWA 활성화 중...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 이전 버전 캐시 삭제
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DATA_CACHE &&
              cacheName.startsWith('jinan-')) {
            console.log('[SW] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 모든 탭에서 새 서비스 워커 활성화
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 외부 리소스는 네트워크 우선, 실패시 캐시
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 성공시 캐시에 저장
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 실패시 캐시에서 반환
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // data.json 요청 처리
  if (url.pathname === '/data.json') {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          // 캐시가 있으면 즉시 반환하고 백그라운드에서 업데이트
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // 공약 관련 페이지 요청 처리
  if (url.searchParams.has('section')) {
    const section = url.searchParams.get('section');
    
    if (section === 'promises') {
      // 면단위 공약 페이지
      event.respondWith(
        caches.match('/index.html').then(response => {
          return response || fetch('/index.html');
        })
      );
      return;
    }
  }
  
  // 기본 캐시 전략: 캐시 우선, 네트워크 백업
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          // 백그라운드에서 네트워크 요청으로 캐시 업데이트
          fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {
            // 네트워크 오류는 무시
          });
          
          return response;
        }
        
        // 네트워크에서 가져오기
        return fetch(event.request).then(response => {
          // 유효한 응답인지 확인
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // 오프라인일 때 기본 페이지 반환
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // 이미지 요청 실패시 기본 이미지 반환
          if (event.request.destination === 'image') {
            return new Response(`
              <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" fill="#f3f4f6"/>
                <text x="100" y="100" font-family="Arial" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">이미지를 불러올 수 없습니다</text>
              </svg>
            `, {
              headers: { 'Content-Type': 'image/svg+xml' }
            });
          }
        });
      })
  );
});

// 푸시 알림 수신 처리
self.addEventListener('push', event => {
  console.log('[SW] 푸시 알림 수신:', event);
  
  let notificationTitle = '이우규 후보';
  let notificationOptions = {
    body: '새로운 소식이 있습니다!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ],
    tag: 'jinan-candidate-notification',
    renotify: true,
    requireInteraction: true
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationTitle = pushData.title || notificationTitle;
      notificationOptions.body = pushData.body || notificationOptions.body;
      notificationOptions.data.url = pushData.url || notificationOptions.data.url;
      
      // 공약 관련 알림인 경우
      if (pushData.type === 'promise') {
        notificationOptions.body = `새로운 공약 정보: ${pushData.promiseTitle}`;
        notificationOptions.data.url = `/?section=${pushData.section || 'home'}`;
      }
      
      // 소식 관련 알림인 경우
      if (pushData.type === 'news') {
        notificationOptions.body = `새로운 소식: ${pushData.newsTitle}`;
        notificationOptions.data.url = '/?section=news';
      }
      
    } catch (error) {
      console.warn('[SW] 푸시 데이터 파싱 오류:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  console.log('[SW] 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // 앱 열기
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'close') {
    // 알림만 닫기
    return;
  } else {
    // 기본 동작: 앱 열기 또는 포커스
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // 이미 열려있는 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
    );
  }
});

// 메시지 처리 (앱과의 통신)
self.addEventListener('message', event => {
  console.log('[SW] 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  // 캐시 상태 확인
  if (event.data && event.data.type === 'CHECK_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        const cacheInfo = {
          caches: cacheNames,
          staticCache: STATIC_CACHE,
          dataCache: DATA_CACHE,
          mainCache: CACHE_NAME
        };
        event.ports[0].postMessage({ type: 'CACHE_INFO', data: cacheInfo });
      })
    );
  }
  
  // 수동 캐시 업데이트
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(
      updateCache().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_UPDATED' });
      })
    );
  }
  
  // SNS 공유 관련 백그라운드 동기화
  if (event.data && event.data.type === 'BACKGROUND_SYNC') {
    event.waitUntil(
      self.registration.sync.register('share-content')
    );
  }
});

// 캐시 업데이트 함수
async function updateCache() {
  try {
    console.log('[SW] 캐시 수동 업데이트 시작...');
    
    // 데이터 캐시 업데이트
    const dataCache = await caches.open(DATA_CACHE);
    const dataResponse = await fetch('/data.json');
    if (dataResponse.ok) {
      await dataCache.put('/data.json', dataResponse);
      console.log('[SW] 데이터 캐시 업데이트 완료');
    }
    
    // 정적 파일 캐시 업데이트
    const staticCache = await caches.open(STATIC_CACHE);
    for (const asset of staticAssets) {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await staticCache.put(asset, response);
        }
      } catch (error) {
        console.warn('[SW] 정적 파일 캐시 업데이트 실패:', asset, error);
      }
    }
    
    console.log('[SW] 캐시 수동 업데이트 완료');
  } catch (error) {
    console.error('[SW] 캐시 업데이트 오류:', error);
  }
}

// 백그라운드 동기화 (SNS 공유 등)
self.addEventListener('sync', event => {
  console.log('[SW] 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'share-content') {
    event.waitUntil(
      handleBackgroundShare()
    );
  }
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// 백그라운드 공유 처리 함수
async function handleBackgroundShare() {
  try {
    console.log('[SW] 백그라운드 공유 처리 시작...');
    
    // 오프라인 상태에서 저장된 공유 요청이 있다면 처리
    const shareCache = await caches.open('share-cache');
    const requests = await shareCache.keys();
    
    for (const request of requests) {
      try {
        await fetch(request);
        await shareCache.delete(request);
        console.log('[SW] 백그라운드 공유 처리 완료');
      } catch (error) {
        console.log('[SW] 백그라운드 공유 처리 실패:', error);
      }
    }
  } catch (error) {
    console.error('[SW] 백그라운드 공유 처리 오류:', error);
  }
}

// 오프라인 데이터 동기화
async function syncOfflineData() {
  try {
    console.log('[SW] 오프라인 데이터 동기화 시작...');
    
    // 최신 데이터 가져오기
    const response = await fetch('/data.json');
    if (response.ok) {
      const dataCache = await caches.open(DATA_CACHE);
      await dataCache.put('/data.json', response);
      
      // 클라이언트에게 데이터 업데이트 알림
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_UPDATED',
          timestamp: Date.now()
        });
      });
      
      console.log('[SW] 오프라인 데이터 동기화 완료');
    }
  } catch (error) {
    console.error('[SW] 오프라인 데이터 동기화 오류:', error);
  }
}

// 온라인/오프라인 상태 관리
self.addEventListener('online', () => {
  console.log('[SW] 온라인 상태로 전환');
  // 온라인 상태가 되면 데이터 동기화 실행
  self.registration.sync.register('sync-offline-data');
});

self.addEventListener('offline', () => {
  console.log('[SW] 오프라인 상태로 전환');
});

// 캐시 정리 (용량 관리)
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // 이전 버전 캐시 삭제
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('jinan-') && 
                cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE &&
                cacheName !== DATA_CACHE) {
              console.log('[SW] 이전 버전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 클라이언트 권한 획득
      self.clients.claim()
    ])
  );
});

// 에러 처리
self.addEventListener('error', event => {
  console.error('[SW] 서비스 워커 에러:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] 처리되지 않은 Promise 거부:', event.reason);
  event.preventDefault();
});

// 설치 완료 메시지
self.addEventListener('activate', event => {
  console.log('[SW] 이우규 후보 6대 공약 PWA 서비스 워커가 활성화되었습니다.');
});