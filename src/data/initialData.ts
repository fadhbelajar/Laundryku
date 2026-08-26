import { 
  Customer, 
  LaundryService, 
  StudentPackage, 
  Dormitory, 
  DormitoryRoom, 
  LaundryOrder, 
  DeliveryZone, 
  ExpenseRecord, 
  ComplaintTicket, 
  PromoVoucher, 
  StaffUser, 
  AppSettings,
  SantriDebtPayment 
} from '../types';

export const initialSettings: AppSettings = {
  storeName: 'Laundry Almawaddah',
  tagline: 'Bersih, Wangi, Rapi, Amanah',
  phone: '0812-3456-7890',
  address: 'Jl. Pesantren Al-Mawaddah No. 99, Kompleks Pesantren Putri, Jawa Timur',
  instagram: '@laundry.almawaddah',
  receiptFooterNote: 'Terima kasih atas amanah Anda. Syukron katsiran wa jazaakumullahu khairan.',
  pointsRatePerTenThousand: 1,
  pointsValueInRupiah: 500,
  enableAutoWhatsAppPrompt: true,
  bankAccountDetails: [
    { bankName: 'Bank Syariah Indonesia (BSI)', accountNumber: '7123-4567-8901', accountHolder: 'Koperasi Almawaddah Laundry' },
    { bankName: 'Bank Mandiri', accountNumber: '142-00-9876543-2', accountHolder: 'Pesantren Al-Mawaddah Laundry' },
    { bankName: 'BCA', accountNumber: '883-021-9988', accountHolder: 'Laundry Almawaddah' }
  ]
};

export const initialStaff: StaffUser[] = [
  {
    id: 'STF-001',
    name: 'Ustadzah Halimah Az-Zahra',
    phone: '081299881122',
    username: 'admin',
    role: 'SUPER_ADMIN',
    roleTitle: 'Manajer Operasional Laundry',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'STF-002',
    name: 'Siti Rahmawati',
    phone: '081377889900',
    username: 'kasir1',
    role: 'KASIR',
    roleTitle: 'Front Office & Kasir POS',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-05'
  },
  {
    id: 'STF-003',
    name: 'Nurul Hidayati',
    phone: '081566778899',
    username: 'cuci1',
    role: 'PETUGAS_CUCI',
    roleTitle: 'Koordinator Cuci & Pengering',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-10'
  },
  {
    id: 'STF-004',
    name: 'Fatimah Dewi',
    phone: '081922334455',
    username: 'sortir1',
    role: 'PETUGAS_SORTIR',
    roleTitle: 'Petugas Sortir, Setrika & QC',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-12'
  },
  {
    id: 'STF-005',
    name: 'Ahmad Fauzi',
    phone: '085711223344',
    username: 'kurir1',
    role: 'PETUGAS_DELIVERY',
    roleTitle: 'Driver Pickup & Pengantaran Asrama',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-15'
  },
  {
    id: 'STF-006',
    name: 'Ustadzah Maryam Jamilah',
    phone: '081399887766',
    username: 'pengurus1',
    role: 'PENGURUS_ASRAMA',
    roleTitle: 'Wali Asrama Al-Mawaddah Pusat',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-18'
  },
  {
    id: 'STF-007',
    name: 'Hj. Zulaikha, S.E.',
    phone: '081288990011',
    username: 'bendahara',
    role: 'BENDAHARA',
    roleTitle: 'Bendahara Keuangan Unit Usaha',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    createdAt: '2025-01-02'
  }
];

export const initialDormitories: Dormitory[] = [
  {
    id: 'DORM-01',
    name: 'Asrama Al-Mawaddah Utama',
    buildings: ['Gedung A (Khadijah)', 'Gedung B (Aisyah)'],
    headSupervisor: 'Ustadzah Maryam Jamilah',
    totalRooms: 12,
    notes: 'Khusus santriwati tingkat Tsanawiyyah & Aliyah awal'
  },
  {
    id: 'DORM-02',
    name: 'Asrama Fatimah Az-Zahra',
    buildings: ['Gedung C (Fatimah)', 'Gedung D (Zainab)'],
    headSupervisor: 'Ustadzah Aminah Basalamah',
    totalRooms: 10,
    notes: 'Khusus santriwati kelas akhir & pengurus santri'
  },
  {
    id: 'DORM-03',
    name: 'Asrama Tahfidz Qur\'an',
    buildings: ['Gedung Hidayah', 'Gedung Nurul Quran'],
    headSupervisor: 'Ustadzah Hafidzah Laila',
    totalRooms: 8,
    notes: 'Program khusus intensif tahfidz santriwati'
  }
];

export const initialRooms: DormitoryRoom[] = [
  {
    id: 'ROOM-A01',
    dormitoryId: 'DORM-01',
    dormitoryName: 'Asrama Al-Mawaddah Utama',
    building: 'Gedung A (Khadijah)',
    roomNumber: 'Kamar A-01',
    capacity: 8,
    studentIds: ['SAN-000101', 'SAN-000102', 'SAN-000103'],
    picSupervisorName: 'Ustadzah Maryam Jamilah',
    picSupervisorPhone: '081399887766'
  },
  {
    id: 'ROOM-A02',
    dormitoryId: 'DORM-01',
    dormitoryName: 'Asrama Al-Mawaddah Utama',
    building: 'Gedung A (Khadijah)',
    roomNumber: 'Kamar A-02',
    capacity: 8,
    studentIds: ['SAN-000104', 'SAN-000105'],
    picSupervisorName: 'Ustadzah Maryam Jamilah',
    picSupervisorPhone: '081399887766'
  },
  {
    id: 'ROOM-A03',
    dormitoryId: 'DORM-01',
    dormitoryName: 'Asrama Al-Mawaddah Utama',
    building: 'Gedung A (Khadijah)',
    roomNumber: 'Kamar A-03',
    capacity: 8,
    studentIds: ['SAN-000106', 'SAN-000107', 'SAN-000108'],
    picSupervisorName: 'Ustadzah Maryam Jamilah',
    picSupervisorPhone: '081399887766'
  },
  {
    id: 'ROOM-B01',
    dormitoryId: 'DORM-01',
    dormitoryName: 'Asrama Al-Mawaddah Utama',
    building: 'Gedung B (Aisyah)',
    roomNumber: 'Kamar B-01',
    capacity: 10,
    studentIds: ['SAN-000109'],
    picSupervisorName: 'Ustadzah Salma',
    picSupervisorPhone: '081233445566'
  },
  {
    id: 'ROOM-C01',
    dormitoryId: 'DORM-02',
    dormitoryName: 'Asrama Fatimah Az-Zahra',
    building: 'Gedung C (Fatimah)',
    roomNumber: 'Kamar C-01',
    capacity: 6,
    studentIds: ['SAN-000110'],
    picSupervisorName: 'Ustadzah Aminah',
    picSupervisorPhone: '081344556677'
  }
];

export const initialStudentPackages: StudentPackage[] = [
  {
    id: 'PKG-MONTHLY-20KG',
    name: 'Paket Bulanan Barakah (20 Kg)',
    type: 'BULANAN',
    price: 150000,
    quotaKg: 20,
    durationDays: 30,
    description: 'Paket langganan laundry komplit cuci + setrika + parfum khusus santriwati (20 Kg / 30 Hari).',
    isActive: true
  },
  {
    id: 'PKG-MONTHLY-30KG',
    name: 'Paket Bulanan Super Santri (30 Kg)',
    type: 'BULANAN',
    price: 220000,
    quotaKg: 30,
    durationDays: 30,
    description: 'Kuota 30 Kg per bulan untuk santriwati aktif dengan ganti seragam harian padat.',
    isActive: true
  },
  {
    id: 'PKG-WEEKLY-5KG',
    name: 'Paket Mingguan Hemat (5 Kg)',
    type: 'MINGGUAN',
    price: 40000,
    quotaKg: 5,
    durationDays: 7,
    description: 'Paket hemat mingguan 5 Kg cuci setrika harum rapi.',
    isActive: true
  },
  {
    id: 'PKG-KILOAN-REGULER',
    name: 'Paket Kiloan Santri Reguler',
    type: 'KILOAN',
    price: 8000,
    quotaKg: 0,
    durationDays: 0,
    description: 'Tarif bersubsidi per kilogram untuk santriwati bayar per cuci.',
    isActive: true
  }
];

export const initialServices: LaundryService[] = [
  {
    id: 'SRV-01',
    name: 'Cuci + Setrika Reguler (Kiloan)',
    category: 'KILOAN',
    unit: 'Kg',
    description: 'Cuci bersih higienis, pelembut wangi, setrika uap rapi, packing plastik kedap udara.',
    estimatedHours: 48,
    priceSantri: 8000,
    priceWarga: 9000,
    priceUmum: 10000,
    isActive: true
  },
  {
    id: 'SRV-02',
    name: 'Cuci Kering Lipat (Kiloan)',
    category: 'KILOAN',
    unit: 'Kg',
    description: 'Cuci bersih, pengeringan higienis, dilipat rapi tanpa disetrika.',
    estimatedHours: 24,
    priceSantri: 6000,
    priceWarga: 7000,
    priceUmum: 8000,
    isActive: true
  },
  {
    id: 'SRV-03',
    name: 'Setrika Saja (Kiloan)',
    category: 'KILOAN',
    unit: 'Kg',
    description: 'Penyetrikaan uap profesional dengan pelicin dan pengharum tahan lama.',
    estimatedHours: 24,
    priceSantri: 5000,
    priceWarga: 6000,
    priceUmum: 7000,
    isActive: true
  },
  {
    id: 'SRV-04',
    name: 'Express Kilat 1 Hari (Kiloan)',
    category: 'KILOAN',
    unit: 'Kg',
    description: 'Layanan prioritas cuci + setrika selesai dalam waktu maksimal 24 jam.',
    estimatedHours: 24,
    priceSantri: 12000,
    priceWarga: 13500,
    priceUmum: 15000,
    isActive: true,
    isExpress: true
  },
  {
    id: 'SRV-05',
    name: 'Super Express 3-5 Jam (Kiloan)',
    category: 'KILOAN',
    unit: 'Kg',
    description: 'Layanan super cepat untuk seragam atau pakaian darurat hari yang sama.',
    estimatedHours: 5,
    priceSantri: 16000,
    priceWarga: 18000,
    priceUmum: 20000,
    isActive: true,
    isExpress: true
  },
  // SATUAN
  {
    id: 'SRV-10',
    name: 'Gamis / Abaya Syar\'i',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Pencucian khusus bahan gamis/abaya syar\'i lembut anti rusak & disetrika presisi.',
    estimatedHours: 48,
    priceSantri: 12000,
    priceWarga: 14000,
    priceUmum: 16000,
    isActive: true
  },
  {
    id: 'SRV-11',
    name: 'Mukena Set (Atasan + Bawahan + Tas)',
    category: 'SATUAN',
    unit: 'Set',
    description: 'Pembersihan noda mukena, wangi segar semerbak, putih cemerlang.',
    estimatedHours: 48,
    priceSantri: 10000,
    priceWarga: 12000,
    priceUmum: 15000,
    isActive: true
  },
  {
    id: 'SRV-12',
    name: 'Jilbab / Khimar / Kerudung',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Perawatan jilbab segi empat, pashmina atau khimar tanpa merusak serat kain.',
    estimatedHours: 24,
    priceSantri: 4000,
    priceWarga: 5000,
    priceUmum: 6000,
    isActive: true
  },
  {
    id: 'SRV-13',
    name: 'Bed Cover Besar (King/Queen Size)',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Pencucian mesin kapasitas besar, pengeringan suhu pas, wangi tahan berminggu-minggu.',
    estimatedHours: 48,
    priceSantri: 25000,
    priceWarga: 30000,
    priceUmum: 35000,
    isActive: true
  },
  {
    id: 'SRV-14',
    name: 'Sprei Set + Sarung Bantal Guling',
    category: 'SATUAN',
    unit: 'Set',
    description: 'Pembersihan tungau, disinfektan higienis, setrika halus.',
    estimatedHours: 48,
    priceSantri: 12000,
    priceWarga: 15000,
    priceUmum: 18000,
    isActive: true
  },
  {
    id: 'SRV-15',
    name: 'Selimut Tebal / Fleece',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Cuci lembut serat selimut, bulu tetap halus dan mengembang.',
    estimatedHours: 48,
    priceSantri: 15000,
    priceWarga: 18000,
    priceUmum: 22000,
    isActive: true
  },
  {
    id: 'SRV-16',
    name: 'Handuk Mandi Tebal',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Pencucian antibakteri, serat lembut kembali berdaya serap tinggi.',
    estimatedHours: 24,
    priceSantri: 6000,
    priceWarga: 8000,
    priceUmum: 10000,
    isActive: true
  },
  {
    id: 'SRV-17',
    name: 'Karpet Masjid / Sajadah Panjang (per Meter)',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Pembersihan debu mendalam, cuci busa aktif, wangi kasturi.',
    estimatedHours: 72,
    priceSantri: 15000,
    priceWarga: 18000,
    priceUmum: 22000,
    isActive: true
  },
  {
    id: 'SRV-18',
    name: 'Sepatu Santri / Sneakers / Kanvas',
    category: 'SATUAN',
    unit: 'Pasang',
    description: 'Deep cleaning noda sol dan upper sepatu, unyellowing & anti bau apek.',
    estimatedHours: 48,
    priceSantri: 20000,
    priceWarga: 25000,
    priceUmum: 30000,
    isActive: true
  },
  {
    id: 'SRV-19',
    name: 'Tas Ransel Santri / Sekolah',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Cuci bersih menyeluruh saku dalam, resleting, dan tali ransel.',
    estimatedHours: 48,
    priceSantri: 15000,
    priceWarga: 18000,
    priceUmum: 22000,
    isActive: true
  },
  {
    id: 'SRV-20',
    name: 'Jas Almamater / Blazer',
    category: 'SATUAN',
    unit: 'Pcs',
    description: 'Dry cleaning & steam press menjaga bentuk kerah dan struktur busa bahu.',
    estimatedHours: 48,
    priceSantri: 18000,
    priceWarga: 22000,
    priceUmum: 25000,
    isActive: true
  }
];

export const initialCustomers: Customer[] = [
  // SANTRIWATI
  {
    id: 'SAN-000101',
    name: 'Aisyah Rahma Safitri',
    phone: '081298765432',
    type: 'SANTRIWATI',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-07-15',
    isActive: true,
    totalOrdersCount: 14,
    totalSpent: 420000,
    notes: 'Alergi parfum menyengat, gunakan aroma Lavender soft.',
    student: {
      nis: '2024090123',
      studentName: 'Aisyah Rahma Safitri',
      className: '10 Aliyah IPA 1',
      guardianName: 'H. Bambang Sulistyo',
      guardianPhone: '081298765432',
      level: 'Aliyah',
      packageId: 'PKG-MONTHLY-20KG',
      packageActiveUntil: '2026-09-15',
      packageQuotaKg: 20,
      packageRemainingKg: 8.5
    }
  },
  {
    id: 'SAN-000102',
    name: 'Fatimah Zahra Al-Athas',
    phone: '081388776655',
    type: 'SANTRIWATI',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-07-16',
    isActive: true,
    totalOrdersCount: 9,
    totalSpent: 280000,
    student: {
      nis: '2024090124',
      studentName: 'Fatimah Zahra Al-Athas',
      className: '10 Aliyah IPA 1',
      guardianName: 'Sayyid Ali Al-Athas',
      guardianPhone: '081388776655',
      level: 'Aliyah',
      packageId: 'PKG-MONTHLY-20KG',
      packageActiveUntil: '2026-09-10',
      packageQuotaKg: 20,
      packageRemainingKg: 14.0
    }
  },
  {
    id: 'SAN-000103',
    name: 'Maryam Qonitah',
    phone: '081911223344',
    type: 'SANTRIWATI',
    createdAt: '2025-08-01',
    isActive: true,
    totalOrdersCount: 6,
    totalSpent: 160000,
    student: {
      nis: '2024090125',
      studentName: 'Maryam Qonitah',
      className: '7 SMP A',
      guardianName: 'Drs. H. Mulyadi',
      guardianPhone: '081911223344',
      level: 'Tsanawiyyah'
    }
  },
  {
    id: 'SAN-000104',
    name: 'Zulfa Zakiyyah',
    phone: '081244556677',
    type: 'SANTRIWATI',
    createdAt: '2025-08-02',
    isActive: true,
    totalOrdersCount: 8,
    totalSpent: 195000,
    student: {
      nis: '2024090126',
      studentName: 'Zulfa Zakiyyah',
      className: '8 SMP B',
      guardianName: 'Ahmad Subagyo, S.Pd.',
      guardianPhone: '081244556677',
      level: 'Tsanawiyyah'
    }
  },
  {
    id: 'SAN-000105',
    name: 'Khadijah Al-Kubro',
    phone: '081377665544',
    type: 'SANTRIWATI',
    createdAt: '2025-08-03',
    isActive: true,
    totalOrdersCount: 5,
    totalSpent: 145000,
    student: {
      nis: '2024090127',
      studentName: 'Khadijah Al-Kubro',
      className: '9 SMP A',
      guardianName: 'H. Abdul Rasyid',
      guardianPhone: '081377665544',
      level: 'Tsanawiyyah'
    }
  },
  {
    id: 'SAN-000106',
    name: 'Naila Fauziah Syahid',
    phone: '085799887766',
    type: 'SANTRIWATI',
    createdAt: '2025-08-05',
    isActive: true,
    totalOrdersCount: 11,
    totalSpent: 330000,
    student: {
      nis: '2024090128',
      studentName: 'Naila Fauziah Syahid',
      className: '11 Aliyah Agama',
      guardianName: 'H. Syahid Mahmud',
      guardianPhone: '085799887766',
      level: 'Aliyah',
      packageId: 'PKG-MONTHLY-30KG',
      packageActiveUntil: '2026-09-20',
      packageQuotaKg: 30,
      packageRemainingKg: 18.0
    }
  },
  {
    id: 'SAN-000107',
    name: 'Hafshah Nur Azizah',
    phone: '081533445566',
    type: 'SANTRIWATI',
    createdAt: '2025-08-08',
    isActive: true,
    totalOrdersCount: 7,
    totalSpent: 210000,
    student: {
      nis: '2023080042',
      studentName: 'Hafshah Nur Azizah',
      className: '11 Aliyah IPA 2',
      guardianName: 'H. Muhammad Arifin',
      guardianPhone: '081533445566',
      level: 'Aliyah'
    }
  },
  {
    id: 'SAN-000108',
    name: 'Zahrotun Nisa',
    phone: '085611223399',
    type: 'SANTRIWATI',
    createdAt: '2025-08-09',
    isActive: true,
    totalOrdersCount: 4,
    totalSpent: 120000,
    student: {
      nis: '2023080049',
      studentName: 'Zahrotun Nisa',
      className: '3 KMI',
      guardianName: 'Drs. H. Miftahudin',
      guardianPhone: '085611223399',
      level: 'KMI'
    }
  },
  {
    id: 'SAN-000109',
    name: 'Tsabita Humaira',
    phone: '081399884422',
    type: 'SANTRIWATI',
    createdAt: '2025-08-10',
    isActive: true,
    totalOrdersCount: 10,
    totalSpent: 290000,
    student: {
      nis: '2023080052',
      studentName: 'Tsabita Humaira',
      className: '5 KMI',
      guardianName: 'K.H. Lukman Hakim',
      guardianPhone: '081399884422',
      level: 'KMI'
    }
  },
  {
    id: 'SAN-000110',
    name: 'Salma Khairunnisa',
    phone: '081266554433',
    type: 'SANTRIWATI',
    createdAt: '2025-08-10',
    isActive: true,
    totalOrdersCount: 8,
    totalSpent: 240000,
    student: {
      nis: '2023080055',
      studentName: 'Salma Khairunnisa',
      className: '12 Aliyah IPS 2',
      guardianName: 'Ir. Hendra Gunawan',
      guardianPhone: '081266554433',
      level: 'Aliyah'
    }
  },

  // WARGA PESANTREN
  {
    id: 'WPS-000001',
    name: 'Ustadzah Nurul Hidayah, Lc.',
    phone: '081234560001',
    type: 'WARGA_PESANTREN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-02-10',
    isActive: true,
    totalOrdersCount: 22,
    totalSpent: 1150000,
    warga: {
      category: 'USTAZAH',
      workUnit: 'Kulliyatul Mu\'allimat Al-Islamiyyah',
      position: 'Kepala Bagian Bahasa Arab & Fiqih',
      complexAddress: 'Rumah Dinas Asatidz Blok B No. 04',
      membershipTier: 'VIP',
      discountPercentage: 15
    }
  },
  {
    id: 'WPS-000002',
    name: 'Ustadz Ahmad Syarifudin, M.Pd.',
    phone: '081234560002',
    type: 'WARGA_PESANTREN',
    createdAt: '2025-02-12',
    isActive: true,
    totalOrdersCount: 18,
    totalSpent: 920000,
    warga: {
      category: 'GURU',
      workUnit: 'Madrasah Tsanawiyyah Al-Mawaddah',
      position: 'Guru Matematika & IPA',
      complexAddress: 'Kompleks Guru Blok A No. 10',
      membershipTier: 'MEMBER',
      discountPercentage: 10
    }
  },
  {
    id: 'WPS-000003',
    name: 'Nyai Hj. Siti Aminah (Keluarga Pengasuh)',
    phone: '081234560003',
    type: 'WARGA_PESANTREN',
    createdAt: '2025-01-15',
    isActive: true,
    totalOrdersCount: 35,
    totalSpent: 2850000,
    notes: 'Pelanggan VIP Pengasuh Utama. Layanan Express tanpa biaya tambahan.',
    warga: {
      category: 'PENGASUH',
      workUnit: 'Dalem Pengasuhan Pondok',
      position: 'Istri Pengasuh Pondok Pesantren',
      complexAddress: 'Ndhalem Utama Kompleks Pesantren Putri',
      membershipTier: 'VIP',
      discountPercentage: 20
    }
  },
  {
    id: 'WPS-000004',
    name: 'Pak Sugeng Riyadi',
    phone: '081234560004',
    type: 'WARGA_PESANTREN',
    createdAt: '2025-03-01',
    isActive: true,
    totalOrdersCount: 12,
    totalSpent: 480000,
    warga: {
      category: 'KARYAWAN',
      workUnit: 'Bagian Sarana & Prasarana',
      position: 'Teknisi Listrik & Genset',
      complexAddress: 'Mess Karyawan Blok C No. 02',
      membershipTier: 'REGULER',
      discountPercentage: 5
    }
  },

  // MASYARAKAT UMUM
  {
    id: 'UMU-000001',
    name: 'Ibu Ratna Dewi',
    phone: '081399001122',
    type: 'MASYARAKAT_UMUM',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    createdAt: '2025-04-10',
    isActive: true,
    totalOrdersCount: 15,
    totalSpent: 1250000,
    notes: 'Rutin laundry bed cover dan sprei setiap 2 minggu. Minta delivery sore jam 16:00.',
    umum: {
      subdistrict: 'Kecamatan Ponorogo',
      village: 'Kelurahan Kauman',
      fullAddress: 'Jl. Diponegoro No. 45 RT 02 / RW 04',
      loyaltyPoints: 125,
      isMember: true
    }
  },
  {
    id: 'UMU-000002',
    name: 'Bapak Hendro Wicaksono',
    phone: '081755667788',
    type: 'MASYARAKAT_UMUM',
    createdAt: '2025-05-18',
    isActive: true,
    totalOrdersCount: 8,
    totalSpent: 640000,
    umum: {
      subdistrict: 'Kecamatan Babadan',
      village: 'Desa Sukosari',
      fullAddress: 'Perumahan Griya Asri Blok D-14',
      loyaltyPoints: 64,
      isMember: false
    }
  },
  {
    id: 'UMU-000003',
    name: 'dr. Farah Savitri',
    phone: '081277889933',
    type: 'MASYARAKAT_UMUM',
    createdAt: '2025-06-01',
    isActive: true,
    totalOrdersCount: 20,
    totalSpent: 1890000,
    notes: 'Pakaian dokter jas putih steril & setrika sangat rapi.',
    umum: {
      subdistrict: 'Kecamatan Ponorogo',
      village: 'Kelurahan Bangunsari',
      fullAddress: 'Jl. Sultan Agung No. 88 (Dekat Apotek Kimia Farma)',
      loyaltyPoints: 189,
      isMember: true
    }
  }
];

export const initialDeliveryZones: DeliveryZone[] = [
  {
    id: 'ZONE-A',
    name: 'Zona A - Kompleks Internal Pesantren',
    description: 'Seluruh area asrama santriwati, rumah dinas asatidz, mess karyawan, dan ndalem pengasuh.',
    fee: 0,
    estimatedMinutes: 15,
    isActive: true
  },
  {
    id: 'ZONE-B',
    name: 'Zona B - Lingkungan Sekitar (Radius 1-3 Km)',
    description: 'Desa & kelurahan tetangga pondok pesantren (Kauman, Cokromenggalan, Keniten).',
    fee: 5000,
    estimatedMinutes: 30,
    isActive: true
  },
  {
    id: 'ZONE-C',
    name: 'Zona C - Area Kota & Luar Radius (> 3 Km)',
    description: 'Pusat kota, perumahan luar kecamatan, instansi perkantoran dan rumah sakit.',
    fee: 10000,
    estimatedMinutes: 45,
    isActive: true
  }
];

export const initialPromos: PromoVoucher[] = [
  {
    id: 'PROMO-JUMAT-BARAKAH',
    code: 'JUMATBERKAH',
    title: 'Diskon Jumat Berkah Warga Almawaddah',
    targetCustomerType: 'WARGA_PESANTREN',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minTransaction: 30000,
    validUntil: '2026-12-31',
    description: 'Potongan 10% setiap transaksi hari Jumat untuk seluruh asatidz dan karyawan pesantren.',
    usageCount: 48,
    isActive: true
  },
  {
    id: 'PROMO-SANTRI-BARU',
    code: 'SANTRIRAPI',
    title: 'Potongan Rp5.000 Cuci Pertama Santriwati',
    targetCustomerType: 'SANTRIWATI',
    discountType: 'FIXED',
    discountValue: 5000,
    minTransaction: 20000,
    validUntil: '2026-10-31',
    description: 'Potongan langsung Rp5.000 untuk paket kiloan atau satuan mukena/gamis.',
    usageCount: 72,
    isActive: true
  },
  {
    id: 'PROMO-UMUM-BEDCOVER',
    code: 'BEDCOVERWANGI',
    title: 'Promo Spesial Cuci Bed Cover & Karpet',
    targetCustomerType: 'MASYARAKAT_UMUM',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minTransaction: 50000,
    validUntil: '2026-11-30',
    description: 'Diskon 15% untuk layanan cuci satuan Bed Cover dan Karpet Masyarakat Umum.',
    usageCount: 31,
    isActive: true
  }
];

export const initialOrders: LaundryOrder[] = [
  {
    id: 'INV-20260825-0001',
    customerId: 'SAN-000101',
    customerName: 'Aisyah Rahma Safitri',
    customerPhone: '081298765432',
    customerType: 'SANTRIWATI',
    studentInfo: {
      nis: '2024090123',
      className: '10 Aliyah IPA 1',
      guardianName: 'H. Bambang Sulistyo',
      guardianPhone: '081298765432'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-1',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 4.5,
        unitPrice: 8000,
        subtotal: 36000,
        notes: 'Seragam putih Aliyah 2 pcs + gamis harian'
      }
    ],
    perfumeOption: 'Aroma Mawar Madinah (Soft & Fresh)',
    additionalAddons: [
      { id: 'ADD-1', name: 'Anti Bakteri Higienis', price: 2000, selected: true }
    ],
    totalWeightKg: 4.5,
    totalPieces: 9,
    itemsSubtotal: 36000,
    addonsSubtotal: 2000,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 38000,
    usedPackageQuotaKg: 4.5,
    paymentMethod: 'KUOTA_PAKET',
    paymentStatus: 'LUNAS',
    paidAmount: 38000,
    changeAmount: 0,
    paymentDate: '2026-08-25 08:30',
    orderDate: '2026-08-25 08:30',
    estimatedCompletionDate: '2026-08-27 10:00',
    currentStatus: 'DISETRIKA',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 08:30', staffName: 'Siti Rahmawati', notes: 'Diterima di loket santri' },
      { id: 'LOG-2', status: 'DITIMBANG', timestamp: '2026-08-25 08:35', staffName: 'Siti Rahmawati', notes: 'Berat netto 4.5 Kg' },
      { id: 'LOG-3', status: 'SORTIR', timestamp: '2026-08-25 09:10', staffName: 'Fatimah Dewi', notes: 'Pakaian dipisahkan warna putih & gelap' },
      { id: 'LOG-4', status: 'DICUCI', timestamp: '2026-08-25 10:00', staffName: 'Nurul Hidayati', notes: 'Mesin Cuci No. 3 Deterjen Eco' },
      { id: 'LOG-5', status: 'DIKERINGKAN', timestamp: '2026-08-25 11:30', staffName: 'Nurul Hidayati', notes: 'Dryer Kapasitas 10 Kg' },
      { id: 'LOG-6', status: 'DISETRIKA', timestamp: '2026-08-25 14:00', staffName: 'Fatimah Dewi', notes: 'Proses setrika uap rapi' }
    ],
    qualityCheck: {
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260825-0001'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Fatimah Dewi',
    specialInstructions: 'Seragam Aliyah IPA 1'
  },
  {
    id: 'INV-20260825-0002',
    customerId: 'SAN-000102',
    customerName: 'Fatimah Zahra Al-Athas',
    customerPhone: '081388776655',
    customerType: 'SANTRIWATI',
    studentInfo: {
      nis: '2024090124',
      className: '10 Aliyah IPA 1',
      guardianName: 'Sayyid Ali Al-Athas',
      guardianPhone: '081388776655'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-2',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 3.8,
        unitPrice: 8000,
        subtotal: 30400
      },
      {
        id: 'ITM-3',
        serviceId: 'SRV-11',
        serviceName: 'Mukena Set (Atasan + Bawahan + Tas)',
        unit: 'Set',
        quantity: 1,
        unitPrice: 10000,
        subtotal: 10000
      }
    ],
    perfumeOption: 'Aroma Melati Pesantren (Segar & Menenangkan)',
    additionalAddons: [],
    totalWeightKg: 3.8,
    totalPieces: 10,
    itemsSubtotal: 40400,
    addonsSubtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 40400,
    paymentMethod: 'KUOTA_PAKET',
    paymentStatus: 'LUNAS',
    paidAmount: 40400,
    changeAmount: 0,
    paymentDate: '2026-08-25 09:00',
    orderDate: '2026-08-25 09:00',
    estimatedCompletionDate: '2026-08-27 12:00',
    currentStatus: 'QUALITY_CHECK',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 09:00', staffName: 'Siti Rahmawati' },
      { id: 'LOG-2', status: 'DITIMBANG', timestamp: '2026-08-25 09:05', staffName: 'Siti Rahmawati' },
      { id: 'LOG-3', status: 'DICUCI', timestamp: '2026-08-25 10:30', staffName: 'Nurul Hidayati' },
      { id: 'LOG-4', status: 'DIKERINGKAN', timestamp: '2026-08-25 12:00', staffName: 'Nurul Hidayati' },
      { id: 'LOG-5', status: 'DISETRIKA', timestamp: '2026-08-25 14:30', staffName: 'Fatimah Dewi' },
      { id: 'LOG-6', status: 'QUALITY_CHECK', timestamp: '2026-08-25 15:30', staffName: 'Fatimah Dewi', notes: 'Pemeriksaan kebersihan & jumlah mukena cocok' }
    ],
    qualityCheck: {
      checkedAt: '2026-08-25 15:30',
      checkerStaffName: 'Fatimah Dewi',
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260825-0002'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Fatimah Dewi'
  },
  {
    id: 'INV-20260825-0006',
    customerId: 'SAN-000103',
    customerName: 'Maryam Qonitah',
    customerPhone: '081911223344',
    customerType: 'SANTRIWATI',
    studentInfo: {
      nis: '2024090125',
      className: '7 SMP A',
      guardianName: 'Drs. H. Mulyadi',
      guardianPhone: '081911223344'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-S3',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 6.0,
        unitPrice: 8000,
        subtotal: 48000,
        notes: 'Seragam pramuka & gamis'
      }
    ],
    perfumeOption: 'Aroma Lavender Dream (Relaksasi & Anti Bakteri)',
    additionalAddons: [],
    totalWeightKg: 6.0,
    totalPieces: 12,
    itemsSubtotal: 48000,
    addonsSubtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 48000,
    paymentMethod: 'TUNAI',
    paymentStatus: 'BELUM_BAYAR',
    paidAmount: 0,
    changeAmount: 0,
    orderDate: '2026-08-25 11:30',
    estimatedCompletionDate: '2026-08-27 15:00',
    currentStatus: 'DICUCI',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 11:30', staffName: 'Siti Rahmawati', notes: 'Kasbon / Hutang santri dicatat' },
      { id: 'LOG-2', status: 'DITIMBANG', timestamp: '2026-08-25 11:35', staffName: 'Siti Rahmawati' },
      { id: 'LOG-3', status: 'DICUCI', timestamp: '2026-08-25 13:00', staffName: 'Nurul Hidayati' }
    ],
    qualityCheck: {
      itemCountMatched: true,
      cleanlinessPassed: false,
      neatnessPassed: false,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260825-0006'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Siti Rahmawati',
    specialInstructions: 'Hutang santri menunggu kiriman orang tua'
  },
  {
    id: 'INV-20260824-0009',
    customerId: 'SAN-000104',
    customerName: 'Zulfa Zakiyyah',
    customerPhone: '081244556677',
    customerType: 'SANTRIWATI',
    studentInfo: {
      nis: '2024090126',
      className: '8 SMP B',
      guardianName: 'Ahmad Subagyo, S.Pd.',
      guardianPhone: '081244556677'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-S4',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 5.0,
        unitPrice: 8000,
        subtotal: 40000
      },
      {
        id: 'ITM-S5',
        serviceId: 'SRV-10',
        serviceName: 'Gamis / Abaya Syar\'i',
        unit: 'Pcs',
        quantity: 1,
        unitPrice: 12000,
        subtotal: 12000
      }
    ],
    perfumeOption: 'Aroma Sakura Blossom (Wangi Lembut Bunga)',
    additionalAddons: [],
    totalWeightKg: 5.0,
    totalPieces: 11,
    itemsSubtotal: 52000,
    addonsSubtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 52000,
    paymentMethod: 'TUNAI',
    paymentStatus: 'DP',
    paidAmount: 20000,
    changeAmount: 0,
    paymentDate: '2026-08-24 14:00',
    orderDate: '2026-08-24 14:00',
    estimatedCompletionDate: '2026-08-26 14:00',
    currentStatus: 'SIAP_DIAMBIL',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-24 14:00', staffName: 'Siti Rahmawati', notes: 'Bayar DP Rp20.000, sisa hutang Rp32.000' },
      { id: 'LOG-2', status: 'DICUCI', timestamp: '2026-08-24 15:30', staffName: 'Nurul Hidayati' },
      { id: 'LOG-3', status: 'DISETRIKA', timestamp: '2026-08-25 10:00', staffName: 'Fatimah Dewi' },
      { id: 'LOG-4', status: 'SIAP_DIAMBIL', timestamp: '2026-08-25 14:00', staffName: 'Siti Rahmawati' }
    ],
    qualityCheck: {
      checkedAt: '2026-08-25 13:30',
      checkerStaffName: 'Fatimah Dewi',
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260824-0009'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Siti Rahmawati'
  },
  {
    id: 'INV-20260823-0010',
    customerId: 'SAN-000108',
    customerName: 'Zahrotun Nisa',
    customerPhone: '085611223399',
    customerType: 'SANTRIWATI',
    studentInfo: {
      nis: '2023080049',
      className: '3 KMI',
      guardianName: 'Drs. H. Miftahudin',
      guardianPhone: '085611223399'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-S6',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 4.0,
        unitPrice: 8000,
        subtotal: 32000
      }
    ],
    perfumeOption: 'Aroma Mawar Madinah (Soft & Fresh)',
    additionalAddons: [],
    totalWeightKg: 4.0,
    totalPieces: 8,
    itemsSubtotal: 32000,
    addonsSubtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 32000,
    paymentMethod: 'TUNAI',
    paymentStatus: 'BELUM_BAYAR',
    paidAmount: 0,
    changeAmount: 0,
    orderDate: '2026-08-23 10:00',
    estimatedCompletionDate: '2026-08-25 10:00',
    actualCompletedDate: '2026-08-25 11:00',
    currentStatus: 'SELESAI',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-23 10:00', staffName: 'Siti Rahmawati' },
      { id: 'LOG-2', status: 'SELESAI', timestamp: '2026-08-25 11:00', staffName: 'Siti Rahmawati', notes: 'Pakaian diambil santri (belum bayar)' }
    ],
    qualityCheck: {
      checkedAt: '2026-08-25 09:00',
      checkerStaffName: 'Fatimah Dewi',
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260823-0010'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Siti Rahmawati'
  },
  {
    id: 'INV-20260825-0003',
    customerId: 'WPS-000001',
    customerName: 'Ustadzah Nurul Hidayah, Lc.',
    customerPhone: '081234560001',
    customerType: 'WARGA_PESANTREN',
    transactionMode: 'PICKUP_DELIVERY',
    items: [
      {
        id: 'ITM-4',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 6.0,
        unitPrice: 9000,
        subtotal: 54000
      },
      {
        id: 'ITM-5',
        serviceId: 'SRV-10',
        serviceName: 'Gamis / Abaya Syar\'i',
        unit: 'Pcs',
        quantity: 2,
        unitPrice: 14000,
        subtotal: 28000
      }
    ],
    perfumeOption: 'Aroma Kasturi Amber (Elegan & Tahan Lama)',
    additionalAddons: [
      { id: 'ADD-2', name: 'Plastik Hanger Gantung Khusus', price: 5000, selected: true }
    ],
    totalWeightKg: 6.0,
    totalPieces: 14,
    itemsSubtotal: 82000,
    addonsSubtotal: 5000,
    deliveryFee: 0,
    discountAmount: 13050, // 15% VIP discount
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 73950,
    paymentMethod: 'QRIS',
    paymentStatus: 'LUNAS',
    paidAmount: 73950,
    changeAmount: 0,
    paymentDate: '2026-08-25 10:15',
    orderDate: '2026-08-25 10:00',
    estimatedCompletionDate: '2026-08-27 14:00',
    currentStatus: 'SIAP_DIAMBIL',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 10:00', staffName: 'Siti Rahmawati' },
      { id: 'LOG-2', status: 'DICUCI', timestamp: '2026-08-25 11:00', staffName: 'Nurul Hidayati' },
      { id: 'LOG-3', status: 'DISETRIKA', timestamp: '2026-08-25 13:30', staffName: 'Fatimah Dewi' },
      { id: 'LOG-4', status: 'PACKING', timestamp: '2026-08-25 15:00', staffName: 'Fatimah Dewi', notes: 'Gamis digantung rapi dengan cover plastik' },
      { id: 'LOG-5', status: 'SIAP_DIAMBIL', timestamp: '2026-08-25 16:00', staffName: 'Ahmad Fauzi', notes: 'Siap diantar ke Rumah Dinas Asatidz B-04' }
    ],
    qualityCheck: {
      checkedAt: '2026-08-25 14:45',
      checkerStaffName: 'Fatimah Dewi',
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packedAt: '2026-08-25 15:00',
      packedByStaffName: 'Fatimah Dewi',
      packageCount: 2,
      bagType: 'TAS_SPUNBOND',
      qrCodeUrl: 'INV-20260825-0003'
    },
    delivery: {
      isDelivery: true,
      type: 'DELIVERY',
      zoneId: 'ZONE-A',
      zoneName: 'Zona A - Kompleks Internal Pesantren',
      fee: 0,
      address: 'Rumah Dinas Asatidz Blok B No. 04',
      courierStaffName: 'Ahmad Fauzi',
      deliveryStatus: 'SIAP_DIKIRIM'
    },
    staffInChargeName: 'Ahmad Fauzi',
    specialInstructions: 'Mohon ditaruh di teras jika rumah sedang kosong mengajar'
  },
  {
    id: 'INV-20260825-0004',
    customerId: 'UMU-000001',
    customerName: 'Ibu Ratna Dewi',
    customerPhone: '081399001122',
    customerType: 'MASYARAKAT_UMUM',
    transactionMode: 'PICKUP_DELIVERY',
    items: [
      {
        id: 'ITM-6',
        serviceId: 'SRV-13',
        serviceName: 'Bed Cover Besar (King/Queen Size)',
        unit: 'Pcs',
        quantity: 1,
        unitPrice: 35000,
        subtotal: 35000
      },
      {
        id: 'ITM-7',
        serviceId: 'SRV-14',
        serviceName: 'Sprei Set + Sarung Bantal Guling',
        unit: 'Set',
        quantity: 2,
        unitPrice: 18000,
        subtotal: 36000
      },
      {
        id: 'ITM-8',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 5.2,
        unitPrice: 10000,
        subtotal: 52000
      }
    ],
    perfumeOption: 'Aroma Sakura Blossom (Wangi Lembut Segar)',
    additionalAddons: [
      { id: 'ADD-1', name: 'Anti Bakteri Higienis', price: 2000, selected: true }
    ],
    totalWeightKg: 5.2,
    totalPieces: 7,
    itemsSubtotal: 123000,
    addonsSubtotal: 2000,
    deliveryFee: 5000,
    discountAmount: 10000, // Voucher BEDCOVERWANGI
    voucherCode: 'BEDCOVERWANGI',
    pointsUsed: 20,
    pointsDiscount: 10000, // 20 poin * Rp500
    grandTotal: 110000,
    paymentMethod: 'TRANSFER_BANK',
    paymentStatus: 'LUNAS',
    paidAmount: 110000,
    changeAmount: 0,
    paymentDate: '2026-08-25 11:30',
    orderDate: '2026-08-25 11:00',
    estimatedCompletionDate: '2026-08-27 16:00',
    currentStatus: 'DICUCI',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 11:00', staffName: 'Ahmad Fauzi', notes: 'Pickup dari rumah pelanggan' },
      { id: 'LOG-2', status: 'DITERIMA', timestamp: '2026-08-25 11:45', staffName: 'Siti Rahmawati' },
      { id: 'LOG-3', status: 'DITIMBANG', timestamp: '2026-08-25 11:50', staffName: 'Siti Rahmawati' },
      { id: 'LOG-4', status: 'SORTIR', timestamp: '2026-08-25 13:00', staffName: 'Fatimah Dewi' },
      { id: 'LOG-5', status: 'DICUCI', timestamp: '2026-08-25 14:00', staffName: 'Nurul Hidayati', notes: 'Mesin Bedcover Besar 20Kg' }
    ],
    qualityCheck: {
      itemCountMatched: true,
      cleanlinessPassed: false,
      neatnessPassed: false,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 2,
      bagType: 'PLASTIK_STANDAR',
      qrCodeUrl: 'INV-20260825-0004'
    },
    delivery: {
      isDelivery: true,
      type: 'BOTH',
      zoneId: 'ZONE-B',
      zoneName: 'Zona B - Lingkungan Sekitar (Radius 1-3 Km)',
      fee: 5000,
      address: 'Jl. Diponegoro No. 45 RT 02 / RW 04, Kel. Kauman',
      courierStaffName: 'Ahmad Fauzi',
      pickupStatus: 'SELESAI',
      deliveryStatus: 'DIJADWALKAN'
    },
    staffInChargeName: 'Nurul Hidayati'
  },
  {
    id: 'INV-20260824-0012',
    customerId: 'SAN-000106',
    customerName: 'Naila Fauziah Syahid',
    customerPhone: '085799887766',
    customerType: 'SANTRIWATI',
    studentDormInfo: {
      dormitoryName: 'Asrama Al-Mawaddah Utama',
      building: 'Gedung A (Khadijah)',
      roomNumber: 'Kamar A-03',
      guardianPhone: '085799887766'
    },
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-9',
        serviceId: 'SRV-01',
        serviceName: 'Cuci + Setrika Reguler (Kiloan)',
        unit: 'Kg',
        quantity: 5.0,
        unitPrice: 8000,
        subtotal: 40000
      }
    ],
    perfumeOption: 'Aroma Lavender Dream',
    additionalAddons: [],
    totalWeightKg: 5.0,
    totalPieces: 11,
    itemsSubtotal: 40000,
    addonsSubtotal: 0,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 40000,
    usedPackageQuotaKg: 5.0,
    paymentMethod: 'KUOTA_PAKET',
    paymentStatus: 'LUNAS',
    paidAmount: 40000,
    changeAmount: 0,
    paymentDate: '2026-08-24 09:00',
    orderDate: '2026-08-24 09:00',
    estimatedCompletionDate: '2026-08-26 12:00',
    actualCompletedDate: '2026-08-25 15:00',
    currentStatus: 'SELESAI',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-24 09:00', staffName: 'Siti Rahmawati' },
      { id: 'LOG-2', status: 'DICUCI', timestamp: '2026-08-24 11:00', staffName: 'Nurul Hidayati' },
      { id: 'LOG-3', status: 'DISETRIKA', timestamp: '2026-08-24 16:00', staffName: 'Fatimah Dewi' },
      { id: 'LOG-4', status: 'PACKING', timestamp: '2026-08-25 09:00', staffName: 'Fatimah Dewi' },
      { id: 'LOG-5', status: 'DALAM_PENGIRIMAN', timestamp: '2026-08-25 10:00', staffName: 'Ahmad Fauzi' },
      { id: 'LOG-6', status: 'SELESAI', timestamp: '2026-08-25 15:00', staffName: 'Ustadzah Maryam Jamilah', notes: 'Diterima santri di Kamar A-03' }
    ],
    qualityCheck: {
      checkedAt: '2026-08-25 08:30',
      checkerStaffName: 'Fatimah Dewi',
      itemCountMatched: true,
      cleanlinessPassed: true,
      neatnessPassed: true,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packedAt: '2026-08-25 09:00',
      packedByStaffName: 'Fatimah Dewi',
      packageCount: 1,
      bagType: 'LAUNDRY_BAG_SANTRI',
      qrCodeUrl: 'INV-20260824-0012',
      roomBatchId: 'BATCH-DORM-A03',
      isDeliveredToDorm: true,
      dormReceivedBy: 'Ustadzah Maryam Jamilah',
      dormReceivedAt: '2026-08-25 15:00'
    },
    delivery: {
      isDelivery: true,
      type: 'DELIVERY',
      zoneId: 'ZONE-A',
      zoneName: 'Zona A - Kompleks Internal Pesantren',
      fee: 0,
      address: 'Asrama Al-Mawaddah Utama - Kamar A-03',
      deliveryStatus: 'TERKIRIM'
    },
    staffInChargeName: 'Ustadzah Maryam Jamilah'
  },
  {
    id: 'INV-20260825-0005',
    customerId: 'UMU-000003',
    customerName: 'dr. Farah Savitri',
    customerPhone: '081277889933',
    customerType: 'MASYARAKAT_UMUM',
    transactionMode: 'DROP_OFF',
    items: [
      {
        id: 'ITM-10',
        serviceId: 'SRV-20',
        serviceName: 'Jas Almamater / Blazer / Jas Dokter',
        unit: 'Pcs',
        quantity: 2,
        unitPrice: 25000,
        subtotal: 50000
      },
      {
        id: 'ITM-11',
        serviceId: 'SRV-04',
        serviceName: 'Express Kilat 1 Hari (Kiloan)',
        unit: 'Kg',
        quantity: 3.0,
        unitPrice: 15000,
        subtotal: 45000
      }
    ],
    perfumeOption: 'Aroma Ocean Fresh & Antibakterial',
    additionalAddons: [
      { id: 'ADD-1', name: 'Anti Bakteri Higienis', price: 2000, selected: true }
    ],
    totalWeightKg: 3.0,
    totalPieces: 8,
    itemsSubtotal: 95000,
    addonsSubtotal: 2000,
    deliveryFee: 0,
    discountAmount: 0,
    pointsUsed: 0,
    pointsDiscount: 0,
    grandTotal: 97000,
    paymentMethod: 'TUNAI',
    paymentStatus: 'BELUM_BAYAR',
    paidAmount: 0,
    changeAmount: 0,
    orderDate: '2026-08-25 14:00',
    estimatedCompletionDate: '2026-08-26 14:00',
    currentStatus: 'ORDER_BARU',
    statusHistory: [
      { id: 'LOG-1', status: 'ORDER_BARU', timestamp: '2026-08-25 14:00', staffName: 'Siti Rahmawati', notes: 'Drop off di kasir' }
    ],
    qualityCheck: {
      itemCountMatched: true,
      cleanlinessPassed: false,
      neatnessPassed: false,
      fabricConditionPassed: true,
      hasIssues: false
    },
    packing: {
      packageCount: 1,
      bagType: 'PLASTIK_STANDAR',
      qrCodeUrl: 'INV-20260825-0005'
    },
    delivery: {
      isDelivery: false,
      type: 'NONE',
      fee: 0,
      address: 'Ambil di Tempat'
    },
    staffInChargeName: 'Siti Rahmawati'
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'EXP-001',
    category: 'DETERJEN',
    title: 'Pembelian Deterjen Cair Konsentrat 5x20 Liter (Eco Wash)',
    amount: 650000,
    date: '2026-08-20',
    recipient: 'Distributor Kimia Laundry Bersih',
    authorizedBy: 'Ustadzah Halimah Az-Zahra',
    notes: 'Stok operasional 2 minggu untuk mesin cuci industri'
  },
  {
    id: 'EXP-002',
    category: 'PEWANGI',
    title: 'Pembelian Pewangi Parfum Grade A (Mawar Madinah & Kasturi)',
    amount: 480000,
    date: '2026-08-22',
    recipient: 'Aroma Wangi Berkah',
    authorizedBy: 'Ustadzah Halimah Az-Zahra',
    notes: '2 jerigen 10L bibit parfum non-alkohol ramah ibadah'
  },
  {
    id: 'EXP-003',
    category: 'PLASTIK_PACKING',
    title: 'Plastik Seal Jinjing Transparan & Tas Spunbond Ramah Lingkungan',
    amount: 320000,
    date: '2026-08-23',
    recipient: 'Toko Plastik Maju Lancar',
    authorizedBy: 'Hj. Zulaikha, S.E.'
  },
  {
    id: 'EXP-004',
    category: 'PERAWATAN_MESIN',
    title: 'Servis Berkala Mesin Cuci Maytag & Pembersihan Filter Dryer',
    amount: 350000,
    date: '2026-08-24',
    recipient: 'Teknisi Prima Sentosa',
    authorizedBy: 'Ustadzah Halimah Az-Zahra',
    notes: 'Ganti v-belt mesin pengering unit #2'
  },
  {
    id: 'EXP-005',
    category: 'TRANSPORTASI',
    title: 'BBM Operasional Motor & Mobil Pickup Jemput Laundry Santri',
    amount: 150000,
    date: '2026-08-25',
    recipient: 'SPBU Sukosari',
    authorizedBy: 'Ahmad Fauzi'
  }
];

export const initialComplaints: ComplaintTicket[] = [
  {
    id: 'CMP-001',
    orderId: 'INV-20260824-0008',
    customerId: 'SAN-000103',
    customerName: 'Maryam Qonitah',
    customerPhone: '081911223344',
    category: 'PAKAIAN_TERTUKAR',
    description: 'Ada satu jilbab putih segitiga dengan inisial berbeda terselip di kantong santri.',
    status: 'DIPROSES',
    reportedAt: '2026-08-25 09:30',
    resolvedByStaff: 'Fatimah Dewi',
    resolutionNotes: 'Sudah ditemukan pemilik aslinya (santri Maryam), sedang ditukar dan diserahkan.'
  },
  {
    id: 'CMP-002',
    orderId: 'INV-20260822-0015',
    customerId: 'UMU-000002',
    customerName: 'Bapak Hendro Wicaksono',
    customerPhone: '081755667788',
    category: 'KURANG_BERSIH',
    description: 'Noda tinta kecil di saku kemeja batik belum hilang sempurna.',
    status: 'SELESAI',
    reportedAt: '2026-08-23 14:00',
    resolvedAt: '2026-08-24 10:00',
    resolvedByStaff: 'Nurul Hidayati',
    resolutionNotes: 'Dilakukan cuci ulang spot treatment penghilang tinta gratis. Pelanggan puas dan nota diperbarui.'
  }
];

export const initialSantriDebtPayments: SantriDebtPayment[] = [
  {
    id: 'PAY-DBT-001',
    studentId: 'SAN-000104',
    nis: '2024090126',
    studentName: 'Zulfa Zakiyyah',
    className: '8 SMP B',
    guardianName: 'Ahmad Subagyo, S.Pd.',
    guardianPhone: '081244556677',
    amount: 20000,
    paymentDate: '2026-08-24 14:00',
    paymentMethod: 'TUNAI',
    staffName: 'Siti Rahmawati',
    notes: 'DP Cucian INV-20260824-0009',
    receiptNumber: 'KWT-20260824-0001',
    allocatedOrderIds: ['INV-20260824-0009']
  },
  {
    id: 'PAY-DBT-002',
    studentId: 'SAN-000101',
    nis: '2024090123',
    studentName: 'Aisyah Rahma Safitri',
    className: '10 Aliyah IPA 1',
    guardianName: 'H. Bambang Sulistyo',
    guardianPhone: '081298765432',
    amount: 50000,
    paymentDate: '2026-08-20 10:30',
    paymentMethod: 'TRANSFER_BANK',
    staffName: 'Siti Rahmawati',
    notes: 'Pelunasan tagihan laundry pekan lalu via BSI',
    receiptNumber: 'KWT-20260820-0004'
  }
];
