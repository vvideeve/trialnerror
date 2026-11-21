// ==========================================
// 1. AMBIL ELEMEN DARI HTML (DOM)
// ==========================================
const elSaldoTersedia = document.getElementById('saldo-tersedia');
const elTargetBudget = document.getElementById('target-budget-tampil');
const elTotalPemasukan = document.getElementById('total-pemasukan');
const elTotalPengeluaran = document.getElementById('total-pengeluaran');

const btnAturBudget = document.getElementById('btn-atur-budget');
const btnResetSemua = document.getElementById('btn-reset-semua');
const formTransaksi = document.getElementById('form-transaksi');
const daftarTransaksi = document.getElementById('daftar-transaksi');

// ==========================================
// 2. AMBIL DATA DARI MEMORI LOKAL (LOCALSTORAGE)
// ==========================================
// Jika belum ada data tersimpan, gunakan nilai awal (0 atau array kosong)
let targetBudget = Number(localStorage.getItem('dompet_budget')) || 0;
let daftarData = JSON.parse(localStorage.getItem('dompet_transaksi')) || [];

// ==========================================
// 3. FUNGSI FORMAT RUPIAH
// ==========================================
function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// ==========================================
// 4. SIMPAN DATA KE LOCALSTORAGE
// ==========================================
function simpanKeMemori() {
  localStorage.setItem('dompet_budget', targetBudget);
  localStorage.setItem('dompet_transaksi', JSON.stringify(daftarData));
}

// ==========================================
// 5. HITUNG & PERBARUI TAMPILAN KEUANGAN
// ==========================================
function renderAplikasi() {
  let totalMasuk = 0;
  let totalKeluar = 0;

  // Hitung total pemasukan dan pengeluaran
  daftarData.forEach((item) => {
    if (item.jenis === 'pemasukan') {
      totalMasuk += item.nominal;
    } else {
      totalKeluar += item.nominal;
    }
  });

  // Rumus Sisa Budget: (Budget Awal + Pemasukan) - Pengeluaran
  const sisaBudget = targetBudget + totalMasuk - totalKeluar;

  // Tampilkan ke layar
  elTargetBudget.textContent = formatRupiah(targetBudget);
  elTotalPemasukan.textContent = formatRupiah(totalMasuk);
  elTotalPengeluaran.textContent = formatRupiah(totalKeluar);
  elSaldoTersedia.textContent = formatRupiah(sisaBudget);

  // Ubah warna teks saldo jika minus (melebihi budget)
  if (sisaBudget < 0) {
    elSaldoTersedia.style.color = '#fca5a5'; // Merah muda terang
  } else {
    elSaldoTersedia.style.color = '#ffffff';
  }

  // Render daftar riwayat transaksi
  daftarTransaksi.innerHTML = '';

  if (daftarData.length === 0) {
    daftarTransaksi.innerHTML =
      '<li class="empty-state">Belum ada transaksi tercatat. Yuk mulai catat!</li>';
    return;
  }

  // Tampilkan transaksi terbaru di bagian paling atas
  daftarData
    .slice()
    .reverse()
    .forEach((item) => {
      const li = document.createElement('li');
      li.className = 'transaction-item';

      const tanda = item.jenis === 'pemasukan' ? '+' : '-';
      const kelasWarna = item.jenis === 'pemasukan' ? 'income' : 'expense';

      li.innerHTML = `
        <div class="tx-desc">
          <strong>${item.keterangan}</strong>
          <span>${item.kategori} • ${item.tanggal}</span>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${kelasWarna}">${tanda} ${formatRupiah(item.nominal)}</span>
          <button type="button" class="btn-delete" onclick="hapusTransaksi(${item.id})">Hapus</button>
        </div>
      `;

      daftarTransaksi.appendChild(li);
    });
}

// ==========================================
// 6. EVENT TAMBAH TRANSAKSI BARU
// ==========================================
formTransaksi.addEventListener('submit', function (e) {
  e.preventDefault(); // Mencegah halaman reload saat form dikirim

  const jenis = document.getElementById('jenis').value;
  const nominal = Number(document.getElementById('nominal').value);
  const kategori = document.getElementById('kategori').value;
  const keterangan = document.getElementById('keterangan').value.trim();

  if (nominal <= 0 || keterangan === '') {
    alert('Pastikan nominal lebih dari 0 dan keterangan diisi!');
    return;
  }

  // Buat objek transaksi baru
  const transaksiBaru = {
    id: Date.now(), // ID unik berdasarkan waktu saat ini
    jenis: jenis,
    nominal: nominal,
    kategori: kategori,
    keterangan: keterangan,
    tanggal: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  };

  daftarData.push(transaksiBaru);
  simpanKeMemori();
  renderAplikasi();

  // Kosongkan input setelah berhasil disimpan
  formTransaksi.reset();
});

// ==========================================
// 7. EVENT ATUR TARGET BUDGET
// ==========================================
btnAturBudget.addEventListener('click', function () {
  const inputBudget = prompt(
    'Masukkan jumlah target budget kamu (contoh: 500000):',
    targetBudget
  );

  if (inputBudget !== null && inputBudget.trim() !== '') {
    const angkaBudget = Number(inputBudget);
    if (!isNaN(angkaBudget) && angkaBudget >= 0) {
      targetBudget = angkaBudget;
      simpanKeMemori();
      renderAplikasi();
    } else {
      alert('Masukkan angka yang valid!');
    }
  }
});

// ==========================================
// 8. FUNGSI HAPUS SATU TRANSAKSI & RESET SEMUA
// ==========================================
function hapusTransaksi(id) {
  if (confirm('Yakin ingin menghapus transaksi ini?')) {
    daftarData = daftarData.filter((item) => item.id !== id);
    simpanKeMemori();
    renderAplikasi();
  }
}

btnResetSemua.addEventListener('click', function () {
  if (confirm('Hapus semua riwayat transaksi dan reset budget ke 0?')) {
    daftarData = [];
    targetBudget = 0;
    simpanKeMemori();
    renderAplikasi();
  }
});

// ==========================================
// 9. DAFTARKAN SERVICE WORKER (UNTUK MODE OFFLINE)
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => console.log('Service Worker berhasil didaftarkan!'))
      .catch((err) => console.log('Service Worker gagal:', err));
  });
}

// Jalankan aplikasi pertama kali saat halaman dibuka
renderAplikasi();
