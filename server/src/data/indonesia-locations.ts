/**
 * Indonesia Location Data
 * Based on BPS (Badan Pusat Statistik) province codes
 * 
 * Data structure:
 * - Each province has an id (BPS code), name, and list of cities
 * - Cities include both Kota (city) and Kabupaten (regency)
 */

export interface City {
    id: string;
    name: string;
    type: 'KOTA' | 'KABUPATEN';
}

export interface Province {
    id: string;
    name: string;
    cities: City[];
}

export const PROVINCES: Province[] = [
    {
        id: '11',
        name: 'Aceh',
        cities: [
            { id: '1171', name: 'Banda Aceh', type: 'KOTA' },
            { id: '1172', name: 'Sabang', type: 'KOTA' },
            { id: '1173', name: 'Langsa', type: 'KOTA' },
            { id: '1174', name: 'Lhokseumawe', type: 'KOTA' },
            { id: '1175', name: 'Subulussalam', type: 'KOTA' },
            { id: '1101', name: 'Aceh Selatan', type: 'KABUPATEN' },
            { id: '1102', name: 'Aceh Tenggara', type: 'KABUPATEN' },
            { id: '1103', name: 'Aceh Timur', type: 'KABUPATEN' },
        ],
    },
    {
        id: '12',
        name: 'Sumatera Utara',
        cities: [
            { id: '1271', name: 'Medan', type: 'KOTA' },
            { id: '1272', name: 'Pematangsiantar', type: 'KOTA' },
            { id: '1273', name: 'Sibolga', type: 'KOTA' },
            { id: '1274', name: 'Tanjungbalai', type: 'KOTA' },
            { id: '1275', name: 'Binjai', type: 'KOTA' },
            { id: '1276', name: 'Tebing Tinggi', type: 'KOTA' },
            { id: '1277', name: 'Padangsidimpuan', type: 'KOTA' },
            { id: '1201', name: 'Nias', type: 'KABUPATEN' },
            { id: '1202', name: 'Mandailing Natal', type: 'KABUPATEN' },
            { id: '1203', name: 'Tapanuli Selatan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '13',
        name: 'Sumatera Barat',
        cities: [
            { id: '1371', name: 'Padang', type: 'KOTA' },
            { id: '1372', name: 'Solok', type: 'KOTA' },
            { id: '1373', name: 'Sawahlunto', type: 'KOTA' },
            { id: '1374', name: 'Padang Panjang', type: 'KOTA' },
            { id: '1375', name: 'Bukittinggi', type: 'KOTA' },
            { id: '1376', name: 'Payakumbuh', type: 'KOTA' },
            { id: '1377', name: 'Pariaman', type: 'KOTA' },
        ],
    },
    {
        id: '14',
        name: 'Riau',
        cities: [
            { id: '1471', name: 'Pekanbaru', type: 'KOTA' },
            { id: '1472', name: 'Dumai', type: 'KOTA' },
            { id: '1401', name: 'Kuantan Singingi', type: 'KABUPATEN' },
            { id: '1402', name: 'Indragiri Hulu', type: 'KABUPATEN' },
            { id: '1403', name: 'Indragiri Hilir', type: 'KABUPATEN' },
            { id: '1404', name: 'Pelalawan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '15',
        name: 'Jambi',
        cities: [
            { id: '1571', name: 'Jambi', type: 'KOTA' },
            { id: '1572', name: 'Sungai Penuh', type: 'KOTA' },
            { id: '1501', name: 'Kerinci', type: 'KABUPATEN' },
            { id: '1502', name: 'Merangin', type: 'KABUPATEN' },
        ],
    },
    {
        id: '16',
        name: 'Sumatera Selatan',
        cities: [
            { id: '1671', name: 'Palembang', type: 'KOTA' },
            { id: '1672', name: 'Prabumulih', type: 'KOTA' },
            { id: '1673', name: 'Pagar Alam', type: 'KOTA' },
            { id: '1674', name: 'Lubuklinggau', type: 'KOTA' },
            { id: '1601', name: 'Ogan Komering Ulu', type: 'KABUPATEN' },
        ],
    },
    {
        id: '17',
        name: 'Bengkulu',
        cities: [
            { id: '1771', name: 'Bengkulu', type: 'KOTA' },
            { id: '1701', name: 'Bengkulu Selatan', type: 'KABUPATEN' },
            { id: '1702', name: 'Rejang Lebong', type: 'KABUPATEN' },
        ],
    },
    {
        id: '18',
        name: 'Lampung',
        cities: [
            { id: '1871', name: 'Bandar Lampung', type: 'KOTA' },
            { id: '1872', name: 'Metro', type: 'KOTA' },
            { id: '1801', name: 'Lampung Barat', type: 'KABUPATEN' },
            { id: '1802', name: 'Tanggamus', type: 'KABUPATEN' },
            { id: '1803', name: 'Lampung Selatan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '19',
        name: 'Kepulauan Bangka Belitung',
        cities: [
            { id: '1971', name: 'Pangkalpinang', type: 'KOTA' },
            { id: '1901', name: 'Bangka', type: 'KABUPATEN' },
            { id: '1902', name: 'Belitung', type: 'KABUPATEN' },
        ],
    },
    {
        id: '21',
        name: 'Kepulauan Riau',
        cities: [
            { id: '2171', name: 'Batam', type: 'KOTA' },
            { id: '2172', name: 'Tanjungpinang', type: 'KOTA' },
            { id: '2101', name: 'Karimun', type: 'KABUPATEN' },
            { id: '2102', name: 'Bintan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '31',
        name: 'DKI Jakarta',
        cities: [
            { id: '3171', name: 'Jakarta Selatan', type: 'KOTA' },
            { id: '3172', name: 'Jakarta Timur', type: 'KOTA' },
            { id: '3173', name: 'Jakarta Pusat', type: 'KOTA' },
            { id: '3174', name: 'Jakarta Barat', type: 'KOTA' },
            { id: '3175', name: 'Jakarta Utara', type: 'KOTA' },
            { id: '3101', name: 'Kepulauan Seribu', type: 'KABUPATEN' },
        ],
    },
    {
        id: '32',
        name: 'Jawa Barat',
        cities: [
            { id: '3271', name: 'Bogor', type: 'KOTA' },
            { id: '3272', name: 'Sukabumi', type: 'KOTA' },
            { id: '3273', name: 'Bandung', type: 'KOTA' },
            { id: '3274', name: 'Cirebon', type: 'KOTA' },
            { id: '3275', name: 'Bekasi', type: 'KOTA' },
            { id: '3276', name: 'Depok', type: 'KOTA' },
            { id: '3277', name: 'Cimahi', type: 'KOTA' },
            { id: '3278', name: 'Tasikmalaya', type: 'KOTA' },
            { id: '3279', name: 'Banjar', type: 'KOTA' },
            { id: '3201', name: 'Bogor', type: 'KABUPATEN' },
            { id: '3202', name: 'Sukabumi', type: 'KABUPATEN' },
            { id: '3203', name: 'Cianjur', type: 'KABUPATEN' },
            { id: '3204', name: 'Bandung', type: 'KABUPATEN' },
            { id: '3205', name: 'Garut', type: 'KABUPATEN' },
            { id: '3206', name: 'Tasikmalaya', type: 'KABUPATEN' },
            { id: '3207', name: 'Ciamis', type: 'KABUPATEN' },
            { id: '3208', name: 'Kuningan', type: 'KABUPATEN' },
            { id: '3209', name: 'Cirebon', type: 'KABUPATEN' },
            { id: '3210', name: 'Majalengka', type: 'KABUPATEN' },
            { id: '3211', name: 'Sumedang', type: 'KABUPATEN' },
            { id: '3212', name: 'Indramayu', type: 'KABUPATEN' },
            { id: '3213', name: 'Subang', type: 'KABUPATEN' },
            { id: '3214', name: 'Purwakarta', type: 'KABUPATEN' },
            { id: '3215', name: 'Karawang', type: 'KABUPATEN' },
            { id: '3216', name: 'Bekasi', type: 'KABUPATEN' },
            { id: '3217', name: 'Bandung Barat', type: 'KABUPATEN' },
            { id: '3218', name: 'Pangandaran', type: 'KABUPATEN' },
        ],
    },
    {
        id: '33',
        name: 'Jawa Tengah',
        cities: [
            { id: '3371', name: 'Magelang', type: 'KOTA' },
            { id: '3372', name: 'Surakarta', type: 'KOTA' },
            { id: '3373', name: 'Salatiga', type: 'KOTA' },
            { id: '3374', name: 'Semarang', type: 'KOTA' },
            { id: '3375', name: 'Pekalongan', type: 'KOTA' },
            { id: '3376', name: 'Tegal', type: 'KOTA' },
            { id: '3301', name: 'Cilacap', type: 'KABUPATEN' },
            { id: '3302', name: 'Banyumas', type: 'KABUPATEN' },
            { id: '3303', name: 'Purbalingga', type: 'KABUPATEN' },
            { id: '3304', name: 'Banjarnegara', type: 'KABUPATEN' },
            { id: '3305', name: 'Kebumen', type: 'KABUPATEN' },
        ],
    },
    {
        id: '34',
        name: 'DI Yogyakarta',
        cities: [
            { id: '3471', name: 'Yogyakarta', type: 'KOTA' },
            { id: '3401', name: 'Kulon Progo', type: 'KABUPATEN' },
            { id: '3402', name: 'Bantul', type: 'KABUPATEN' },
            { id: '3403', name: 'Gunung Kidul', type: 'KABUPATEN' },
            { id: '3404', name: 'Sleman', type: 'KABUPATEN' },
        ],
    },
    {
        id: '35',
        name: 'Jawa Timur',
        cities: [
            { id: '3571', name: 'Kediri', type: 'KOTA' },
            { id: '3572', name: 'Blitar', type: 'KOTA' },
            { id: '3573', name: 'Malang', type: 'KOTA' },
            { id: '3574', name: 'Probolinggo', type: 'KOTA' },
            { id: '3575', name: 'Pasuruan', type: 'KOTA' },
            { id: '3576', name: 'Mojokerto', type: 'KOTA' },
            { id: '3577', name: 'Madiun', type: 'KOTA' },
            { id: '3578', name: 'Surabaya', type: 'KOTA' },
            { id: '3579', name: 'Batu', type: 'KOTA' },
            { id: '3501', name: 'Pacitan', type: 'KABUPATEN' },
            { id: '3502', name: 'Ponorogo', type: 'KABUPATEN' },
            { id: '3503', name: 'Trenggalek', type: 'KABUPATEN' },
            { id: '3504', name: 'Tulungagung', type: 'KABUPATEN' },
            { id: '3505', name: 'Blitar', type: 'KABUPATEN' },
            { id: '3506', name: 'Kediri', type: 'KABUPATEN' },
            { id: '3507', name: 'Malang', type: 'KABUPATEN' },
            { id: '3508', name: 'Lumajang', type: 'KABUPATEN' },
            { id: '3509', name: 'Jember', type: 'KABUPATEN' },
            { id: '3510', name: 'Banyuwangi', type: 'KABUPATEN' },
            { id: '3511', name: 'Bondowoso', type: 'KABUPATEN' },
            { id: '3512', name: 'Situbondo', type: 'KABUPATEN' },
            { id: '3513', name: 'Probolinggo', type: 'KABUPATEN' },
            { id: '3514', name: 'Pasuruan', type: 'KABUPATEN' },
            { id: '3515', name: 'Sidoarjo', type: 'KABUPATEN' },
            { id: '3516', name: 'Mojokerto', type: 'KABUPATEN' },
            { id: '3517', name: 'Jombang', type: 'KABUPATEN' },
            { id: '3518', name: 'Nganjuk', type: 'KABUPATEN' },
            { id: '3519', name: 'Madiun', type: 'KABUPATEN' },
            { id: '3520', name: 'Magetan', type: 'KABUPATEN' },
            { id: '3521', name: 'Ngawi', type: 'KABUPATEN' },
            { id: '3522', name: 'Bojonegoro', type: 'KABUPATEN' },
            { id: '3523', name: 'Tuban', type: 'KABUPATEN' },
            { id: '3524', name: 'Lamongan', type: 'KABUPATEN' },
            { id: '3525', name: 'Gresik', type: 'KABUPATEN' },
            { id: '3526', name: 'Bangkalan', type: 'KABUPATEN' },
            { id: '3527', name: 'Sampang', type: 'KABUPATEN' },
            { id: '3528', name: 'Pamekasan', type: 'KABUPATEN' },
            { id: '3529', name: 'Sumenep', type: 'KABUPATEN' },
        ],
    },
    {
        id: '36',
        name: 'Banten',
        cities: [
            { id: '3671', name: 'Tangerang', type: 'KOTA' },
            { id: '3672', name: 'Cilegon', type: 'KOTA' },
            { id: '3673', name: 'Serang', type: 'KOTA' },
            { id: '3674', name: 'Tangerang Selatan', type: 'KOTA' },
            { id: '3601', name: 'Pandeglang', type: 'KABUPATEN' },
            { id: '3602', name: 'Lebak', type: 'KABUPATEN' },
            { id: '3603', name: 'Tangerang', type: 'KABUPATEN' },
            { id: '3604', name: 'Serang', type: 'KABUPATEN' },
        ],
    },
    {
        id: '51',
        name: 'Bali',
        cities: [
            { id: '5171', name: 'Denpasar', type: 'KOTA' },
            { id: '5101', name: 'Jembrana', type: 'KABUPATEN' },
            { id: '5102', name: 'Tabanan', type: 'KABUPATEN' },
            { id: '5103', name: 'Badung', type: 'KABUPATEN' },
            { id: '5104', name: 'Gianyar', type: 'KABUPATEN' },
            { id: '5105', name: 'Klungkung', type: 'KABUPATEN' },
            { id: '5106', name: 'Bangli', type: 'KABUPATEN' },
            { id: '5107', name: 'Karangasem', type: 'KABUPATEN' },
            { id: '5108', name: 'Buleleng', type: 'KABUPATEN' },
        ],
    },
    {
        id: '52',
        name: 'Nusa Tenggara Barat',
        cities: [
            { id: '5271', name: 'Mataram', type: 'KOTA' },
            { id: '5272', name: 'Bima', type: 'KOTA' },
            { id: '5201', name: 'Lombok Barat', type: 'KABUPATEN' },
            { id: '5202', name: 'Lombok Tengah', type: 'KABUPATEN' },
            { id: '5203', name: 'Lombok Timur', type: 'KABUPATEN' },
            { id: '5204', name: 'Sumbawa', type: 'KABUPATEN' },
            { id: '5205', name: 'Dompu', type: 'KABUPATEN' },
            { id: '5206', name: 'Bima', type: 'KABUPATEN' },
            { id: '5207', name: 'Sumbawa Barat', type: 'KABUPATEN' },
            { id: '5208', name: 'Lombok Utara', type: 'KABUPATEN' },
        ],
    },
    {
        id: '53',
        name: 'Nusa Tenggara Timur',
        cities: [
            { id: '5371', name: 'Kupang', type: 'KOTA' },
            { id: '5301', name: 'Sumba Barat', type: 'KABUPATEN' },
            { id: '5302', name: 'Sumba Timur', type: 'KABUPATEN' },
            { id: '5303', name: 'Kupang', type: 'KABUPATEN' },
            { id: '5304', name: 'Timor Tengah Selatan', type: 'KABUPATEN' },
            { id: '5305', name: 'Timor Tengah Utara', type: 'KABUPATEN' },
            { id: '5306', name: 'Belu', type: 'KABUPATEN' },
            { id: '5307', name: 'Alor', type: 'KABUPATEN' },
            { id: '5308', name: 'Lembata', type: 'KABUPATEN' },
            { id: '5309', name: 'Flores Timur', type: 'KABUPATEN' },
            { id: '5310', name: 'Sikka', type: 'KABUPATEN' },
            { id: '5311', name: 'Ende', type: 'KABUPATEN' },
            { id: '5312', name: 'Ngada', type: 'KABUPATEN' },
            { id: '5313', name: 'Manggarai', type: 'KABUPATEN' },
            { id: '5314', name: 'Rote Ndao', type: 'KABUPATEN' },
            { id: '5315', name: 'Manggarai Barat', type: 'KABUPATEN' },
        ],
    },
    {
        id: '61',
        name: 'Kalimantan Barat',
        cities: [
            { id: '6171', name: 'Pontianak', type: 'KOTA' },
            { id: '6172', name: 'Singkawang', type: 'KOTA' },
            { id: '6101', name: 'Sambas', type: 'KABUPATEN' },
            { id: '6102', name: 'Bengkayang', type: 'KABUPATEN' },
            { id: '6103', name: 'Landak', type: 'KABUPATEN' },
            { id: '6104', name: 'Mempawah', type: 'KABUPATEN' },
            { id: '6105', name: 'Sanggau', type: 'KABUPATEN' },
            { id: '6106', name: 'Ketapang', type: 'KABUPATEN' },
            { id: '6107', name: 'Sintang', type: 'KABUPATEN' },
            { id: '6108', name: 'Kapuas Hulu', type: 'KABUPATEN' },
            { id: '6109', name: 'Sekadau', type: 'KABUPATEN' },
            { id: '6110', name: 'Melawi', type: 'KABUPATEN' },
            { id: '6111', name: 'Kayong Utara', type: 'KABUPATEN' },
            { id: '6112', name: 'Kubu Raya', type: 'KABUPATEN' },
        ],
    },
    {
        id: '62',
        name: 'Kalimantan Tengah',
        cities: [
            { id: '6271', name: 'Palangka Raya', type: 'KOTA' },
            { id: '6201', name: 'Kotawaringin Barat', type: 'KABUPATEN' },
            { id: '6202', name: 'Kotawaringin Timur', type: 'KABUPATEN' },
            { id: '6203', name: 'Kapuas', type: 'KABUPATEN' },
            { id: '6204', name: 'Barito Selatan', type: 'KABUPATEN' },
            { id: '6205', name: 'Barito Utara', type: 'KABUPATEN' },
        ],
    },
    {
        id: '63',
        name: 'Kalimantan Selatan',
        cities: [
            { id: '6371', name: 'Banjarmasin', type: 'KOTA' },
            { id: '6372', name: 'Banjarbaru', type: 'KOTA' },
            { id: '6301', name: 'Tanah Laut', type: 'KABUPATEN' },
            { id: '6302', name: 'Kotabaru', type: 'KABUPATEN' },
            { id: '6303', name: 'Banjar', type: 'KABUPATEN' },
            { id: '6304', name: 'Barito Kuala', type: 'KABUPATEN' },
            { id: '6305', name: 'Tapin', type: 'KABUPATEN' },
            { id: '6306', name: 'Hulu Sungai Selatan', type: 'KABUPATEN' },
            { id: '6307', name: 'Hulu Sungai Tengah', type: 'KABUPATEN' },
            { id: '6308', name: 'Hulu Sungai Utara', type: 'KABUPATEN' },
            { id: '6309', name: 'Tabalong', type: 'KABUPATEN' },
            { id: '6310', name: 'Tanah Bumbu', type: 'KABUPATEN' },
            { id: '6311', name: 'Balangan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '64',
        name: 'Kalimantan Timur',
        cities: [
            { id: '6471', name: 'Balikpapan', type: 'KOTA' },
            { id: '6472', name: 'Samarinda', type: 'KOTA' },
            { id: '6474', name: 'Bontang', type: 'KOTA' },
            { id: '6401', name: 'Paser', type: 'KABUPATEN' },
            { id: '6402', name: 'Kutai Barat', type: 'KABUPATEN' },
            { id: '6403', name: 'Kutai Kartanegara', type: 'KABUPATEN' },
            { id: '6404', name: 'Kutai Timur', type: 'KABUPATEN' },
            { id: '6405', name: 'Berau', type: 'KABUPATEN' },
            { id: '6409', name: 'Penajam Paser Utara', type: 'KABUPATEN' },
            { id: '6411', name: 'Mahakam Ulu', type: 'KABUPATEN' },
        ],
    },
    {
        id: '65',
        name: 'Kalimantan Utara',
        cities: [
            { id: '6571', name: 'Tarakan', type: 'KOTA' },
            { id: '6501', name: 'Malinau', type: 'KABUPATEN' },
            { id: '6502', name: 'Bulungan', type: 'KABUPATEN' },
            { id: '6503', name: 'Tana Tidung', type: 'KABUPATEN' },
            { id: '6504', name: 'Nunukan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '71',
        name: 'Sulawesi Utara',
        cities: [
            { id: '7171', name: 'Manado', type: 'KOTA' },
            { id: '7172', name: 'Bitung', type: 'KOTA' },
            { id: '7173', name: 'Tomohon', type: 'KOTA' },
            { id: '7174', name: 'Kotamobagu', type: 'KOTA' },
            { id: '7101', name: 'Bolaang Mongondow', type: 'KABUPATEN' },
            { id: '7102', name: 'Minahasa', type: 'KABUPATEN' },
            { id: '7103', name: 'Kepulauan Sangihe', type: 'KABUPATEN' },
            { id: '7104', name: 'Kepulauan Talaud', type: 'KABUPATEN' },
            { id: '7105', name: 'Minahasa Selatan', type: 'KABUPATEN' },
            { id: '7106', name: 'Minahasa Utara', type: 'KABUPATEN' },
            { id: '7107', name: 'Bolaang Mongondow Utara', type: 'KABUPATEN' },
            { id: '7108', name: 'Siau Tagulandang Biaro', type: 'KABUPATEN' },
            { id: '7109', name: 'Minahasa Tenggara', type: 'KABUPATEN' },
            { id: '7110', name: 'Bolaang Mongondow Selatan', type: 'KABUPATEN' },
            { id: '7111', name: 'Bolaang Mongondow Timur', type: 'KABUPATEN' },
        ],
    },
    {
        id: '72',
        name: 'Sulawesi Tengah',
        cities: [
            { id: '7271', name: 'Palu', type: 'KOTA' },
            { id: '7201', name: 'Banggai Kepulauan', type: 'KABUPATEN' },
            { id: '7202', name: 'Banggai', type: 'KABUPATEN' },
            { id: '7203', name: 'Morowali', type: 'KABUPATEN' },
            { id: '7204', name: 'Poso', type: 'KABUPATEN' },
            { id: '7205', name: 'Donggala', type: 'KABUPATEN' },
            { id: '7206', name: 'Tolitoli', type: 'KABUPATEN' },
            { id: '7207', name: 'Buol', type: 'KABUPATEN' },
            { id: '7208', name: 'Parigi Moutong', type: 'KABUPATEN' },
            { id: '7209', name: 'Tojo Una-Una', type: 'KABUPATEN' },
            { id: '7210', name: 'Sigi', type: 'KABUPATEN' },
            { id: '7211', name: 'Banggai Laut', type: 'KABUPATEN' },
            { id: '7212', name: 'Morowali Utara', type: 'KABUPATEN' },
        ],
    },
    {
        id: '73',
        name: 'Sulawesi Selatan',
        cities: [
            { id: '7371', name: 'Makassar', type: 'KOTA' },
            { id: '7372', name: 'Parepare', type: 'KOTA' },
            { id: '7373', name: 'Palopo', type: 'KOTA' },
            { id: '7301', name: 'Kepulauan Selayar', type: 'KABUPATEN' },
            { id: '7302', name: 'Bulukumba', type: 'KABUPATEN' },
            { id: '7303', name: 'Bantaeng', type: 'KABUPATEN' },
            { id: '7304', name: 'Jeneponto', type: 'KABUPATEN' },
            { id: '7305', name: 'Takalar', type: 'KABUPATEN' },
            { id: '7306', name: 'Gowa', type: 'KABUPATEN' },
            { id: '7307', name: 'Sinjai', type: 'KABUPATEN' },
            { id: '7308', name: 'Maros', type: 'KABUPATEN' },
            { id: '7309', name: 'Pangkajene dan Kepulauan', type: 'KABUPATEN' },
            { id: '7310', name: 'Barru', type: 'KABUPATEN' },
            { id: '7311', name: 'Bone', type: 'KABUPATEN' },
            { id: '7312', name: 'Soppeng', type: 'KABUPATEN' },
            { id: '7313', name: 'Wajo', type: 'KABUPATEN' },
            { id: '7314', name: 'Sidenreng Rappang', type: 'KABUPATEN' },
            { id: '7315', name: 'Pinrang', type: 'KABUPATEN' },
            { id: '7316', name: 'Enrekang', type: 'KABUPATEN' },
            { id: '7317', name: 'Luwu', type: 'KABUPATEN' },
            { id: '7318', name: 'Tana Toraja', type: 'KABUPATEN' },
            { id: '7322', name: 'Luwu Utara', type: 'KABUPATEN' },
            { id: '7325', name: 'Luwu Timur', type: 'KABUPATEN' },
            { id: '7326', name: 'Toraja Utara', type: 'KABUPATEN' },
        ],
    },
    {
        id: '74',
        name: 'Sulawesi Tenggara',
        cities: [
            { id: '7471', name: 'Kendari', type: 'KOTA' },
            { id: '7472', name: 'Baubau', type: 'KOTA' },
            { id: '7401', name: 'Buton', type: 'KABUPATEN' },
            { id: '7402', name: 'Muna', type: 'KABUPATEN' },
            { id: '7403', name: 'Konawe', type: 'KABUPATEN' },
            { id: '7404', name: 'Kolaka', type: 'KABUPATEN' },
            { id: '7405', name: 'Konawe Selatan', type: 'KABUPATEN' },
            { id: '7406', name: 'Bombana', type: 'KABUPATEN' },
            { id: '7407', name: 'Wakatobi', type: 'KABUPATEN' },
            { id: '7408', name: 'Kolaka Utara', type: 'KABUPATEN' },
            { id: '7409', name: 'Buton Utara', type: 'KABUPATEN' },
            { id: '7410', name: 'Konawe Utara', type: 'KABUPATEN' },
            { id: '7411', name: 'Kolaka Timur', type: 'KABUPATEN' },
            { id: '7412', name: 'Konawe Kepulauan', type: 'KABUPATEN' },
            { id: '7413', name: 'Muna Barat', type: 'KABUPATEN' },
            { id: '7414', name: 'Buton Tengah', type: 'KABUPATEN' },
            { id: '7415', name: 'Buton Selatan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '75',
        name: 'Gorontalo',
        cities: [
            { id: '7571', name: 'Gorontalo', type: 'KOTA' },
            { id: '7501', name: 'Boalemo', type: 'KABUPATEN' },
            { id: '7502', name: 'Gorontalo', type: 'KABUPATEN' },
            { id: '7503', name: 'Pohuwato', type: 'KABUPATEN' },
            { id: '7504', name: 'Bone Bolango', type: 'KABUPATEN' },
            { id: '7505', name: 'Gorontalo Utara', type: 'KABUPATEN' },
        ],
    },
    {
        id: '76',
        name: 'Sulawesi Barat',
        cities: [
            { id: '7601', name: 'Majene', type: 'KABUPATEN' },
            { id: '7602', name: 'Polewali Mandar', type: 'KABUPATEN' },
            { id: '7603', name: 'Mamasa', type: 'KABUPATEN' },
            { id: '7604', name: 'Mamuju', type: 'KABUPATEN' },
            { id: '7605', name: 'Mamuju Utara', type: 'KABUPATEN' },
            { id: '7606', name: 'Mamuju Tengah', type: 'KABUPATEN' },
        ],
    },
    {
        id: '81',
        name: 'Maluku',
        cities: [
            { id: '8171', name: 'Ambon', type: 'KOTA' },
            { id: '8172', name: 'Tual', type: 'KOTA' },
            { id: '8101', name: 'Maluku Tenggara Barat', type: 'KABUPATEN' },
            { id: '8102', name: 'Maluku Tenggara', type: 'KABUPATEN' },
            { id: '8103', name: 'Maluku Tengah', type: 'KABUPATEN' },
            { id: '8104', name: 'Buru', type: 'KABUPATEN' },
            { id: '8105', name: 'Kepulauan Aru', type: 'KABUPATEN' },
            { id: '8106', name: 'Seram Bagian Barat', type: 'KABUPATEN' },
            { id: '8107', name: 'Seram Bagian Timur', type: 'KABUPATEN' },
            { id: '8108', name: 'Maluku Barat Daya', type: 'KABUPATEN' },
            { id: '8109', name: 'Buru Selatan', type: 'KABUPATEN' },
        ],
    },
    {
        id: '82',
        name: 'Maluku Utara',
        cities: [
            { id: '8271', name: 'Ternate', type: 'KOTA' },
            { id: '8272', name: 'Tidore Kepulauan', type: 'KOTA' },
            { id: '8201', name: 'Halmahera Barat', type: 'KABUPATEN' },
            { id: '8202', name: 'Halmahera Tengah', type: 'KABUPATEN' },
            { id: '8203', name: 'Kepulauan Sula', type: 'KABUPATEN' },
            { id: '8204', name: 'Halmahera Selatan', type: 'KABUPATEN' },
            { id: '8205', name: 'Halmahera Utara', type: 'KABUPATEN' },
            { id: '8206', name: 'Halmahera Timur', type: 'KABUPATEN' },
            { id: '8207', name: 'Pulau Morotai', type: 'KABUPATEN' },
            { id: '8208', name: 'Pulau Taliabu', type: 'KABUPATEN' },
        ],
    },
    {
        id: '91',
        name: 'Papua',
        cities: [
            { id: '9171', name: 'Jayapura', type: 'KOTA' },
            { id: '9101', name: 'Merauke', type: 'KABUPATEN' },
            { id: '9102', name: 'Jayawijaya', type: 'KABUPATEN' },
            { id: '9103', name: 'Jayapura', type: 'KABUPATEN' },
            { id: '9104', name: 'Nabire', type: 'KABUPATEN' },
            { id: '9105', name: 'Kepulauan Yapen', type: 'KABUPATEN' },
            { id: '9106', name: 'Biak Numfor', type: 'KABUPATEN' },
            { id: '9107', name: 'Paniai', type: 'KABUPATEN' },
            { id: '9108', name: 'Puncak Jaya', type: 'KABUPATEN' },
            { id: '9109', name: 'Mimika', type: 'KABUPATEN' },
            { id: '9110', name: 'Boven Digoel', type: 'KABUPATEN' },
            { id: '9111', name: 'Mappi', type: 'KABUPATEN' },
            { id: '9112', name: 'Asmat', type: 'KABUPATEN' },
            { id: '9113', name: 'Yahukimo', type: 'KABUPATEN' },
            { id: '9114', name: 'Pegunungan Bintang', type: 'KABUPATEN' },
            { id: '9115', name: 'Tolikara', type: 'KABUPATEN' },
            { id: '9116', name: 'Sarmi', type: 'KABUPATEN' },
            { id: '9117', name: 'Keerom', type: 'KABUPATEN' },
            { id: '9118', name: 'Waropen', type: 'KABUPATEN' },
            { id: '9119', name: 'Supiori', type: 'KABUPATEN' },
            { id: '9120', name: 'Mamberamo Raya', type: 'KABUPATEN' },
            { id: '9121', name: 'Nduga', type: 'KABUPATEN' },
            { id: '9122', name: 'Lanny Jaya', type: 'KABUPATEN' },
            { id: '9123', name: 'Mamberamo Tengah', type: 'KABUPATEN' },
            { id: '9124', name: 'Yalimo', type: 'KABUPATEN' },
            { id: '9125', name: 'Puncak', type: 'KABUPATEN' },
            { id: '9126', name: 'Dogiyai', type: 'KABUPATEN' },
            { id: '9127', name: 'Intan Jaya', type: 'KABUPATEN' },
            { id: '9128', name: 'Deiyai', type: 'KABUPATEN' },
        ],
    },
    {
        id: '92',
        name: 'Papua Barat',
        cities: [
            { id: '9271', name: 'Sorong', type: 'KOTA' },
            { id: '9201', name: 'Fakfak', type: 'KABUPATEN' },
            { id: '9202', name: 'Kaimana', type: 'KABUPATEN' },
            { id: '9203', name: 'Teluk Wondama', type: 'KABUPATEN' },
            { id: '9204', name: 'Teluk Bintuni', type: 'KABUPATEN' },
            { id: '9205', name: 'Manokwari', type: 'KABUPATEN' },
            { id: '9206', name: 'Sorong Selatan', type: 'KABUPATEN' },
            { id: '9207', name: 'Sorong', type: 'KABUPATEN' },
            { id: '9208', name: 'Raja Ampat', type: 'KABUPATEN' },
            { id: '9209', name: 'Tambrauw', type: 'KABUPATEN' },
            { id: '9210', name: 'Maybrat', type: 'KABUPATEN' },
            { id: '9211', name: 'Manokwari Selatan', type: 'KABUPATEN' },
            { id: '9212', name: 'Pegunungan Arfak', type: 'KABUPATEN' },
        ],
    },
];

/**
 * Get all provinces (without cities for lighter response)
 */
export const getProvinceList = (): { id: string; name: string }[] => {
    return PROVINCES.map(p => ({ id: p.id, name: p.name }));
};

/**
 * Get a province by ID with its cities
 */
export const getProvinceById = (provinceId: string): Province | undefined => {
    return PROVINCES.find(p => p.id === provinceId);
};

/**
 * Get cities by province ID
 */
export const getCitiesByProvinceId = (provinceId: string): City[] => {
    const province = PROVINCES.find(p => p.id === provinceId);
    return province?.cities || [];
};

/**
 * Search provinces by name
 */
export const searchProvinces = (query: string): Province[] => {
    const lowerQuery = query.toLowerCase();
    return PROVINCES.filter(p => p.name.toLowerCase().includes(lowerQuery));
};

/**
 * Get province name by ID
 */
export const getProvinceName = (provinceId: string): string | undefined => {
    return PROVINCES.find(p => p.id === provinceId)?.name;
};

/**
 * Get city name by ID
 */
export const getCityName = (cityId: string): string | undefined => {
    for (const province of PROVINCES) {
        const city = province.cities.find(c => c.id === cityId);
        if (city) return city.name;
    }
    return undefined;
};
