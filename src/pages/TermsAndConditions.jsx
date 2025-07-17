
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Syarat & Ketentuan
              </h1>
              <p className="text-gray-600">Terakhir diperbarui: 1 Januari 2025</p>
            </div>
          </div>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8 text-gray-700 leading-relaxed">
            
            <section id="definisi">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-4">1. Definisi</h2>
              <p><strong>"Aplikasi"</strong> merujuk pada platform JastipDigital. <strong>"Titiper"</strong> adalah pengguna yang membuat pesanan. <strong>"Driver"</strong> atau <strong>"Mitra"</strong> adalah pihak ketiga independen yang menyediakan jasa pembelian, pengantaran, atau keahlian khusus. <strong>"Layanan"</strong> adalah jasa titip dan/atau jasa keahlian khusus yang disediakan melalui Aplikasi.</p>
            </section>

            <section id="peran-platform">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-4">2. Peran & Tanggung Jawab Platform</h2>
              <p className="font-semibold">JastipDigital adalah perusahaan teknologi yang menyediakan platform untuk menghubungkan Titiper dengan Driver/Mitra. Kami TIDAK menyediakan layanan transportasi, logistik, atau pembelian secara langsung.</p>
              <ul className="list-disc list-inside space-y-2 mt-3 bg-blue-50 p-4 rounded-lg">
                <li>Driver/Mitra adalah kontraktor independen, BUKAN pegawai JastipDigital.</li>
                <li>JastipDigital tidak bertanggung jawab atas tindakan, kelalaian, kualitas barang, atau perilaku dari Driver/Mitra maupun Titiper.</li>
                <li>Segala transaksi dan interaksi yang terjadi adalah hubungan langsung antara Titiper dan Driver/Mitra. Peran kami adalah sebagai fasilitator teknologi.</li>
              </ul>
            </section>
            
            <section id="barang-terlarang">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-red-600 pl-4">3. Barang & Layanan Terlarang</h2>
              <p>Pengguna dilarang keras melakukan transaksi untuk barang atau layanan berikut:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <ul className="list-disc list-inside space-y-2 bg-red-50 p-4 rounded-lg">
                      <li>Narkotika, psikotropika, dan zat adiktif lainnya.</li>
                      <li>Senjata api, senjata tajam, amunisi, dan bahan peledak.</li>
                      <li>Minuman beralkohol (kecuali diizinkan peraturan daerah dan oleh Driver terverifikasi khusus).</li>
                      <li>Hewan hidup dan bagian tubuh hewan yang dilindungi.</li>
                      <li>Barang curian, palsu, atau yang melanggar hak kekayaan intelektual.</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2 bg-red-50 p-4 rounded-lg">
                      <li>Dokumen legal dan/atau rahasia (KTP, paspor, ijazah).</li>
                      <li>Obat keras yang memerlukan resep dokter (kecuali melalui layanan Apoteker On-Call resmi).</li>
                      <li>Barang yang sifatnya berbahaya, mudah terbakar, atau beracun.</li>
                      <li>Layanan ilegal atau yang bertentangan dengan norma kesusilaan.</li>
                  </ul>
              </div>
              <p className="mt-3 text-sm text-red-700 font-semibold">Pelanggaran terhadap ketentuan ini akan mengakibatkan pemblokiran akun permanen dan akan dilaporkan kepada pihak berwenang.</p>
            </section>
            
            <section id="kebijakan-pembatalan">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-4">4. Kebijakan Pembatalan</h2>
              <p>Titiper dapat membatalkan pesanan dengan ketentuan biaya sebagai berikut:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 bg-orange-50 p-4 rounded-lg">
                <li><strong>Status "Pending"</strong> (Belum ada driver): Pembatalan gratis.</li>
                <li><strong>Status "Accepted"</strong> (Driver sudah menerima & menuju lokasi): Biaya pembatalan <strong>Rp 5.000</strong>.</li>
                <li><strong>Status "Shopping"</strong> (Driver sudah mulai berbelanja): Biaya pembatalan <strong>Rp 15.000</strong> ditambah biaya barang yang sudah terlanjur dibeli (jika tidak dapat diretur).</li>
                <li><strong>Status "Delivering" & "Completed"</strong>: Pesanan tidak dapat dibatalkan.</li>
              </ul>
            </section>
            
            <section id="asuransi">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">5. Asuransi & Perlindungan (Opsional)</h2>
              <p>Untuk memberikan keamanan ekstra, Titiper dapat memilih untuk menambahkan asuransi pada pesanannya dengan biaya <strong>1% dari nilai barang</strong>. Asuransi ini mencakup:</p>
               <ul className="list-disc list-inside space-y-2 mt-3 bg-green-50 p-4 rounded-lg">
                  <li>Penggantian penuh jika barang hilang dalam pengantaran.</li>
                  <li>Penggantian hingga 80% jika barang rusak akibat kelalaian wajar dari Driver.</li>
                  <li>Asuransi tidak mencakup kerusakan akibat bencana alam, sifat alami barang (mudah basi), atau pengemasan yang tidak layak dari toko asal.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Batasan Tanggung Jawab</h2>
              <p>
                Aplikasi hanya bertindak sebagai platform penghubung. Kami tidak bertanggung jawab atas kualitas barang, kerusakan yang terjadi di luar kendali Driver, atau perselisihan langsung antara Titiper dan Driver. Namun, kami menyediakan fitur "In-App Customer Support" untuk membantu mediasi.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
