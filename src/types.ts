export type CustomerType = 'SANTRIWATI' | 'WARGA_PESANTREN' | 'MASYARAKAT_UMUM';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'KASIR'
  | 'PETUGAS_CUCI'
  | 'PETUGAS_SORTIR'
  | 'PETUGAS_DELIVERY'
  | 'BENDAHARA'
  | 'PENGURUS_ASRAMA';

export type MembershipTier = 'REGULER' | 'MEMBER' | 'VIP';

export type WargaCategory = 
  | 'USTAZAH'
  | 'GURU'
  | 'PENGASUH'
  | 'KARYAWAN'
  | 'KELUARGA'
  | 'WARGA_PESANTREN';

export type OrderStatus =
  | 'ORDER_BARU'
  | 'DITERIMA'
  | 'DITIMBANG'
  | 'SORTIR'
  | 'DICUCI'
  | 'DIBILAS'
  | 'DIKERINGKAN'
  | 'DISETRIKA'
  | 'QUALITY_CHECK'
  | 'PACKING'
  | 'SIAP_DIAMBIL'
  | 'DALAM_PENGIRIMAN'
  | 'SELESAI';

export type TransactionMode = 'DROP_OFF' | 'PICKUP_DELIVERY';

export type PaymentMethod = 'TUNAI' | 'TRANSFER_BANK' | 'QRIS' | 'SALDO_MEMBER' | 'KUOTA_PAKET';

export type PaymentStatus = 'BELUM_BAYAR' | 'DP' | 'SEBAGIAN' | 'LUNAS';

export type ServiceType = 'KILOAN' | 'SATUAN' | 'EXPRESS';

export type PackageType = 'BULANAN' | 'MINGGUAN' | 'KILOAN';

export interface StudentProfile {
  nis: string;            // ID Santri / Nomor Induk Santri
  studentName: string;    // Nama Lengkap Santriwati
  className: string;      // Kelas Santri (e.g. 7A, 8B, 10 IPA 1, 1 KMI, 2 KMI, dll)
  guardianName: string;   // Nama Orang Tua / Wali Santri
  guardianPhone: string;  // Kontak Orang Tua / Nomor WhatsApp Wali
  level?: string;         // Jenjang (Tsanawiyyah / SMP / Aliyah / SMA / KMI)
  packageId?: string;
  packageActiveUntil?: string;
  packageQuotaKg?: number;
  packageRemainingKg?: number;
}

export interface SantriDebtPayment {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  staffName: string;
  notes?: string;
  receiptNumber: string;
  allocatedOrderIds?: string[];
}

export interface WargaProfile {
  category: WargaCategory;
  workUnit: string;        // e.g., 'Biro Pengasuhan', 'Madrasah Aliyah', 'Dapur Umum'
  position: string;        // e.g., 'Guru Fiqih', 'Kepala Tata Usaha', 'Wali Asrama'
  complexAddress: string;  // e.g., 'Kompleks Guru No. 12', 'Wisma Asatidz B-04'
  membershipTier: MembershipTier;
  discountPercentage: number;
}

export interface UmumProfile {
  subdistrict: string;    // Kecamatan
  village: string;        // Kelurahan / Desa
  fullAddress: string;
  loyaltyPoints: number;
  isMember: boolean;
}

export interface Customer {
  id: string;             // SAN-000123, WPS-000001, UMU-000001
  name: string;
  phone: string;
  type: CustomerType;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
  notes?: string;
  // Detail based on type
  student?: StudentProfile;
  warga?: WargaProfile;
  umum?: UmumProfile;
  totalOrdersCount: number;
  totalSpent: number;
}

export interface LaundryService {
  id: string;
  name: string;
  category: 'KILOAN' | 'SATUAN';
  unit: string;           // 'Kg', 'Pcs', 'Pasang', 'Set'
  description?: string;
  estimatedHours: number;
  iconName?: string;
  // Dynamic Pricing based on Customer Type
  priceSantri: number;
  priceWarga: number;
  priceUmum: number;
  isActive: boolean;
  isExpress?: boolean;
}

export interface StudentPackage {
  id: string;
  name: string;
  type: PackageType;
  price: number;
  quotaKg: number;
  durationDays: number;
  description: string;
  isActive: boolean;
}

export interface DormitoryRoom {
  id: string;
  dormitoryId: string;
  dormitoryName: string;
  building: string;
  roomNumber: string;
  capacity: number;
  studentIds: string[];
  picSupervisorName?: string;
  picSupervisorPhone?: string;
}

export interface Dormitory {
  id: string;
  name: string;
  buildings: string[];
  headSupervisor: string;
  totalRooms: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  unit: string;
  quantity: number;       // Weight in Kg or Item Count
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface AdditionalOption {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface QualityCheckDetail {
  checkedAt?: string;
  checkerStaffName?: string;
  itemCountMatched: boolean;
  cleanlinessPassed: boolean;
  neatnessPassed: boolean;
  fabricConditionPassed: boolean;
  hasIssues: boolean;
  issueNotes?: string;
  photos?: string[];
}

export interface PackingDetail {
  packedAt?: string;
  packedByStaffName?: string;
  packageCount: number;
  bagType: 'PLASTIK_STANDAR' | 'TAS_SPUNBOND' | 'KARDUS' | 'LAUNDRY_BAG_SANTRI';
  qrCodeUrl: string;
  roomBatchId?: string; // Grouping ID for student rooms
  isDeliveredToDorm?: boolean;
  dormReceivedBy?: string;
  dormReceivedAt?: string;
}

export interface StatusHistoryLog {
  id: string;
  status: OrderStatus;
  timestamp: string;
  staffName: string;
  notes?: string;
}

export interface DeliveryDetail {
  isDelivery: boolean;
  type: 'PICKUP' | 'DELIVERY' | 'BOTH' | 'NONE';
  zoneId?: string;
  zoneName?: string;
  fee: number;
  address: string;
  courierStaffName?: string;
  pickupTime?: string;
  deliveryTime?: string;
  pickupStatus?: 'MENUNGGU' | 'DIJADWALKAN' | 'DALAM_PERJALANAN' | 'DIAMBIL' | 'SELESAI' | 'DIBATALKAN';
  deliveryStatus?: 'SIAP_DIKIRIM' | 'DIJADWALKAN' | 'DALAM_PERJALANAN' | 'TERKIRIM' | 'GAGAL';
}

export interface LaundryOrder {
  id: string;             // Format: INV-20260826-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerType: CustomerType;
  // Specific student details snapshot
  studentInfo?: {
    nis: string;
    className: string;
    guardianName: string;
    guardianPhone: string;
  };
  studentDormInfo?: {
    className?: string;
    guardianName?: string;
    guardianPhone?: string;
    dormitoryName?: string;
    building?: string;
    roomNumber?: string;
  };
  transactionMode: TransactionMode;
  items: OrderItem[];
  perfumeOption?: string;
  additionalAddons: AdditionalOption[];
  totalWeightKg: number;
  totalPieces: number;
  
  // Pricing
  itemsSubtotal: number;
  addonsSubtotal: number;
  deliveryFee: number;
  discountAmount: number;
  voucherCode?: string;
  pointsUsed: number;
  pointsDiscount: number;
  grandTotal: number;
  
  // Package quota usage if applicable
  usedPackageQuotaKg?: number;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  changeAmount: number;
  paymentDate?: string;
  paymentProofUrl?: string;

  // Timestamps
  orderDate: string;
  estimatedCompletionDate: string;
  actualCompletedDate?: string;

  // Workflow State
  currentStatus: OrderStatus;
  statusHistory: StatusHistoryLog[];
  qualityCheck: QualityCheckDetail;
  packing: PackingDetail;
  delivery: DeliveryDetail;
  
  staffInChargeName: string;
  specialInstructions?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  fee: number;
  estimatedMinutes: number;
  isActive: boolean;
}

export interface ExpenseRecord {
  id: string;
  category: 'DETERJEN' | 'PEWANGI' | 'PLASTIK_PACKING' | 'LISTRIK' | 'AIR' | 'PERAWATAN_MESIN' | 'TRANSPORTASI' | 'GAJI' | 'LAINNYA';
  title: string;
  amount: number;
  date: string;
  recipient: string;
  authorizedBy: string;
  notes?: string;
  receiptProof?: string;
}

export interface ComplaintTicket {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: 'PAKAIAN_HILANG' | 'PAKAIAN_TERTUKAR' | 'PAKAIAN_RUSAK' | 'PAKAIAN_KURANG' | 'KURANG_BERSIH' | 'KETERLAMBATAN' | 'SALAH_TAGIHAN' | 'LAINNYA';
  description: string;
  status: 'BARU' | 'DIPROSES' | 'SELESAI';
  reportedAt: string;
  resolvedAt?: string;
  resolvedByStaff?: string;
  resolutionNotes?: string;
  compensationAmount?: number;
}

export interface PromoVoucher {
  id: string;
  code: string;
  title: string;
  targetCustomerType: 'ALL' | 'SANTRIWATI' | 'WARGA_PESANTREN' | 'MASYARAKAT_UMUM';
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minTransaction: number;
  validUntil: string;
  description: string;
  usageCount: number;
  isActive: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  phone: string;
  username: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  storeName: string;
  tagline: string;
  phone: string;
  address: string;
  instagram: string;
  qrisImageUrl?: string;
  appLogoUrl?: string;          // Main Application Logo (base64 / URL)
  faviconUrl?: string;          // Favicon for browser tab (32x32 / 64x64)
  pwaIcon192Url?: string;       // PWA Mobile App Icon 192x192
  pwaIcon512Url?: string;       // PWA Splash / Store Icon 512x512
  appleTouchIconUrl?: string;   // Apple Touch Icon 180x180
  receiptMonochromeUrl?: string;// Thermal receipt optimized monochrome logo
  logoShape?: 'rounded' | 'circle' | 'square' | 'original';
  logoOriginalSizeKb?: number;
  logoCompressedSizeKb?: number;
  logoUpdatedDate?: string;
  receiptFooterNote: string;
  pointsRatePerTenThousand: number; // 1 point per 10k
  pointsValueInRupiah: number;      // 1 point = Rp500
  enableAutoWhatsAppPrompt: boolean;
  bankAccountDetails: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }[];
}
