// Nama penyimpanan cache (ubah versi misal ke v2 jika kamu memperbarui kode)
const CACHE_NAME = 'dompet-siswa-v1';

// Daftar file yang akan disimpan ke memori offline HP
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. EVENT INSTALL: Menyimpan semua file aplikasi ke cache saat pertama kali dibuka
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan file aplikasi untuk mode offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. EVENT ACTIVATE: Menghapus cache versi lama jika ada pembaruan kode
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. EVENT FETCH: Mengambil file dari cache saat HP sedang offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika file ada di cache, gunakan file dari cache (bisa jalan tanpa internet)
      // Jika tidak ada, ambil dari internet
      return cachedResponse || fetch(event.request);
    })
  );
});
