import QRCode from 'qrcode';
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
  OrderStatus,
  CustomerType,
  PaymentStatus,
  PaymentMethod,
  SantriDebtPayment
} from '../types';
import { 
  initialCustomers, 
  initialServices, 
  initialStudentPackages, 
  initialDormitories, 
  initialRooms, 
  initialOrders, 
  initialDeliveryZones, 
  initialPromos, 
  initialExpenses, 
  initialComplaints, 
  initialStaff, 
  initialSettings,
  initialSantriDebtPayments
} from './initialData';

// Storage Helper Keys
const STORAGE_PREFIX = 'almawaddah_laundry_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new Event('almawaddah_storage_updated'));
  } catch (e) {
    console.error(`Error saving ${key} to storage`, e);
  }
}

export const StorageService = {
  // Reset all to initial demo data
  resetAllData: () => {
    localStorage.clear();
    setStored('customers', initialCustomers);
    setStored('services', initialServices);
    setStored('packages', initialStudentPackages);
    setStored('dormitories', initialDormitories);
    setStored('rooms', initialRooms);
    setStored('orders', initialOrders);
    setStored('zones', initialDeliveryZones);
    setStored('promos', initialPromos);
    setStored('expenses', initialExpenses);
    setStored('complaints', initialComplaints);
    setStored('staff', initialStaff);
    setStored('settings', initialSettings);
    setStored('santriDebtPayments', initialSantriDebtPayments);
    setStored('currentStaffId', initialStaff[0].id);
    window.dispatchEvent(new Event('almawaddah_storage_updated'));
  },

  // Initialize if empty
  init: () => {
    if (!localStorage.getItem(STORAGE_PREFIX + 'customers')) {
      setStored('customers', initialCustomers);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'services')) {
      setStored('services', initialServices);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'packages')) {
      setStored('packages', initialStudentPackages);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'dormitories')) {
      setStored('dormitories', initialDormitories);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'rooms')) {
      setStored('rooms', initialRooms);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'orders')) {
      setStored('orders', initialOrders);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'zones')) {
      setStored('zones', initialDeliveryZones);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'promos')) {
      setStored('promos', initialPromos);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'expenses')) {
      setStored('expenses', initialExpenses);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'complaints')) {
      setStored('complaints', initialComplaints);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'staff')) {
      setStored('staff', initialStaff);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'settings')) {
      setStored('settings', initialSettings);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'santriDebtPayments')) {
      setStored('santriDebtPayments', initialSantriDebtPayments);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'currentStaffId')) {
      setStored('currentStaffId', initialStaff[0].id);
    }
  },

  // Getters
  getCustomers: (): Customer[] => getStored('customers', initialCustomers),
  getServices: (): LaundryService[] => getStored('services', initialServices),
  getPackages: (): StudentPackage[] => getStored('packages', initialStudentPackages),
  getDormitories: (): Dormitory[] => getStored('dormitories', initialDormitories),
  getRooms: (): DormitoryRoom[] => getStored('rooms', initialRooms),
  getOrders: (): LaundryOrder[] => getStored('orders', initialOrders),
  getZones: (): DeliveryZone[] => getStored('zones', initialDeliveryZones),
  getPromos: (): PromoVoucher[] => getStored('promos', initialPromos),
  getExpenses: (): ExpenseRecord[] => getStored('expenses', initialExpenses),
  getComplaints: (): ComplaintTicket[] => getStored('complaints', initialComplaints),
  getStaff: (): StaffUser[] => getStored('staff', initialStaff),
  getSettings: (): AppSettings => getStored('settings', initialSettings),
  getSantriDebtPayments: (): SantriDebtPayment[] => getStored('santriDebtPayments', initialSantriDebtPayments),
  
  getCurrentStaff: (): StaffUser => {
    const staffList = getStored('staff', initialStaff);
    const staffId = getStored('currentStaffId', initialStaff[0].id);
    return staffList.find(s => s.id === staffId) || staffList[0];
  },

  setCurrentStaffId: (staffId: string) => {
    setStored('currentStaffId', staffId);
  },

  // Save methods
  saveCustomers: (data: Customer[]) => setStored('customers', data),
  saveServices: (data: LaundryService[]) => setStored('services', data),
  savePackages: (data: StudentPackage[]) => setStored('packages', data),
  saveDormitories: (data: Dormitory[]) => setStored('dormitories', data),
  saveRooms: (data: DormitoryRoom[]) => setStored('rooms', data),
  saveOrders: (data: LaundryOrder[]) => setStored('orders', data),
  saveZones: (data: DeliveryZone[]) => setStored('zones', data),
  savePromos: (data: PromoVoucher[]) => setStored('promos', data),
  saveExpenses: (data: ExpenseRecord[]) => setStored('expenses', data),
  saveComplaints: (data: ComplaintTicket[]) => setStored('complaints', data),
  saveStaff: (data: StaffUser[]) => setStored('staff', data),
  saveSettings: (data: AppSettings) => setStored('settings', data),
  saveSantriDebtPayments: (data: SantriDebtPayment[]) => setStored('santriDebtPayments', data),

  // Customers Management
  upsertCustomer: (customer: Customer) => {
    const list = StorageService.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    StorageService.saveCustomers(list);
  },

  // Generate Auto IDs
  generateCustomerId: (type: CustomerType): string => {
    const list = StorageService.getCustomers().filter(c => c.type === type);
    const prefix = type === 'SANTRIWATI' ? 'SAN' : type === 'WARGA_PESANTREN' ? 'WPS' : 'UMU';
    const nextNum = list.length + 101;
    return `${prefix}-${String(nextNum).padStart(6, '0')}`;
  },

  generateInvoiceNumber: (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const orders = StorageService.getOrders();
    const todayOrders = orders.filter(o => o.orderDate.startsWith(`${y}-${m}-${d}`));
    const seq = String(todayOrders.length + 1).padStart(4, '0');
    return `INV-${y}${m}${d}-${seq}`;
  },

  // Orders Management
  createOrder: (order: LaundryOrder) => {
    const orders = StorageService.getOrders();
    orders.unshift(order);
    StorageService.saveOrders(orders);

    // Update customer total spend and orders count
    const customers = StorageService.getCustomers();
    const customer = customers.find(c => c.id === order.customerId);
    if (customer) {
      customer.totalOrdersCount = (customer.totalOrdersCount || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + order.grandTotal;

      // If santri used quota
      if (customer.type === 'SANTRIWATI' && customer.student && order.usedPackageQuotaKg) {
        customer.student.packageRemainingKg = Math.max(0, (customer.student.packageRemainingKg || 0) - order.usedPackageQuotaKg);
      }

      // If umum earned points (1 point per 10k)
      if (customer.type === 'MASYARAKAT_UMUM' && customer.umum) {
        const earned = Math.floor(order.grandTotal / 10000);
        const used = order.pointsUsed || 0;
        customer.umum.loyaltyPoints = Math.max(0, (customer.umum.loyaltyPoints || 0) - used + earned);
      }

      StorageService.saveCustomers(customers);
    }
  },

  updateOrderStatus: (orderId: string, newStatus: OrderStatus, staffName: string, notes?: string) => {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.currentStatus = newStatus;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
      order.statusHistory.push({
        id: `LOG-${Date.now()}`,
        status: newStatus,
        timestamp: now,
        staffName: staffName,
        notes: notes || `Status diubah ke ${STATUS_METADATA[newStatus].label}`
      });

      if (newStatus === 'SELESAI') {
        order.actualCompletedDate = now;
        if (order.delivery.isDelivery) {
          order.delivery.deliveryStatus = 'TERKIRIM';
        }
      }

      if (newStatus === 'DALAM_PENGIRIMAN' && order.delivery.isDelivery) {
        order.delivery.deliveryStatus = 'DALAM_PERJALANAN';
      }

      if (newStatus === 'SIAP_DIAMBIL' && order.delivery.isDelivery) {
        order.delivery.deliveryStatus = 'SIAP_DIKIRIM';
      }

      StorageService.saveOrders(orders);
    }
  },

  updateOrderPayment: (orderId: string, status: PaymentStatus, method: PaymentMethod, paidAmount: number) => {
    const orders = StorageService.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.paymentStatus = status;
      order.paymentMethod = method;
      order.paidAmount = paidAmount;
      order.changeAmount = Math.max(0, paidAmount - order.grandTotal);
      order.paymentDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
      StorageService.saveOrders(orders);
    }
  },

  // Santri Debt & Payment Methods
  getSantriUnpaidOrders: (studentId?: string): LaundryOrder[] => {
    const orders = StorageService.getOrders();
    return orders.filter(o => {
      const isSantri = o.customerType === 'SANTRIWATI';
      const matchesStudent = studentId ? o.customerId === studentId : true;
      const isUnpaid = o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP';
      return isSantri && matchesStudent && isUnpaid;
    });
  },

  getSantriDebtDetails: (studentId: string) => {
    const customer = StorageService.getCustomers().find(c => c.id === studentId);
    const orders = StorageService.getOrders().filter(o => o.customerId === studentId && o.customerType === 'SANTRIWATI');
    const unpaidOrders = orders.filter(o => o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP');
    
    const totalDebt = unpaidOrders.reduce((sum, o) => {
      const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
      return sum + remaining;
    }, 0);

    const totalSpent = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalPaid = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);

    const payments = StorageService.getSantriDebtPayments().filter(p => p.studentId === studentId);

    return {
      customer,
      student: customer?.student,
      orders,
      unpaidOrders,
      totalDebt,
      totalSpent,
      totalPaid,
      payments
    };
  },

  getAllSantriDebtSummaries: () => {
    const santriList = StorageService.getCustomers().filter(c => c.type === 'SANTRIWATI');
    const orders = StorageService.getOrders().filter(o => o.customerType === 'SANTRIWATI');
    const payments = StorageService.getSantriDebtPayments();

    return santriList.map(santri => {
      const studentOrders = orders.filter(o => o.customerId === santri.id);
      const unpaidOrders = studentOrders.filter(o => o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP');
      
      const totalDebt = unpaidOrders.reduce((sum, o) => {
        const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
        return sum + remaining;
      }, 0);

      const totalSpent = studentOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      const studentPayments = payments.filter(p => p.studentId === santri.id);

      return {
        customer: santri,
        student: santri.student,
        totalOrdersCount: studentOrders.length,
        totalSpent,
        totalDebt,
        hasDebt: totalDebt > 0,
        unpaidOrders,
        payments: studentPayments
      };
    });
  },

  recordSantriDebtPayment: (payment: SantriDebtPayment) => {
    // 1. Save payment record
    const payments = StorageService.getSantriDebtPayments();
    payments.unshift(payment);
    StorageService.saveSantriDebtPayments(payments);

    // 2. Automatically settle or reduce unpaid orders for this student
    const orders = StorageService.getOrders();
    const studentOrders = orders.filter(o => 
      o.customerId === payment.studentId && 
      o.customerType === 'SANTRIWATI' && 
      (o.paymentStatus === 'BELUM_BAYAR' || o.paymentStatus === 'DP')
    );

    let remainingPaymentBudget = payment.amount;
    const allocatedOrderIds: string[] = [];

    // Allocate from oldest to newest order
    studentOrders.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

    for (const order of studentOrders) {
      if (remainingPaymentBudget <= 0) break;
      const currentPaid = order.paidAmount || 0;
      const remainingNeed = Math.max(0, order.grandTotal - currentPaid);

      if (remainingNeed > 0) {
        allocatedOrderIds.push(order.id);
        if (remainingPaymentBudget >= remainingNeed) {
          order.paidAmount = order.grandTotal;
          order.paymentStatus = 'LUNAS';
          order.paymentMethod = payment.paymentMethod;
          order.paymentDate = payment.paymentDate;
          remainingPaymentBudget -= remainingNeed;
        } else {
          order.paidAmount = currentPaid + remainingPaymentBudget;
          order.paymentStatus = 'DP';
          order.paymentMethod = payment.paymentMethod;
          remainingPaymentBudget = 0;
        }
      }
    }

    payment.allocatedOrderIds = allocatedOrderIds;
    StorageService.saveOrders(orders);
    StorageService.saveSantriDebtPayments(payments);
  }
};

// 13 ORDER STATUS WORKFLOW CONSTANTS & METADATA
export const ORDER_STATUS_WORKFLOW: OrderStatus[] = [
  'ORDER_BARU',
  'DITERIMA',
  'DITIMBANG',
  'SORTIR',
  'DICUCI',
  'DIBILAS',
  'DIKERINGKAN',
  'DISETRIKA',
  'QUALITY_CHECK',
  'PACKING',
  'SIAP_DIAMBIL',
  'DALAM_PENGIRIMAN',
  'SELESAI'
];

export const STATUS_METADATA: Record<OrderStatus, { 
  label: string; 
  step: number; 
  color: string; 
  bgLight: string;
  badgeClass: string;
  iconName: string;
  description: string;
}> = {
  ORDER_BARU: {
    label: 'Order Baru',
    step: 1,
    color: 'text-amber-400',
    bgLight: 'bg-amber-950/30 border-amber-800/40 text-amber-300',
    badgeClass: 'bg-amber-900/40 text-amber-300 border border-amber-700/50',
    iconName: 'Sparkles',
    description: 'Order laundry baru dicatat dalam sistem kasir/POS'
  },
  DITERIMA: {
    label: 'Diterima',
    step: 2,
    color: 'text-blue-400',
    bgLight: 'bg-blue-950/30 border-blue-800/40 text-blue-300',
    badgeClass: 'bg-blue-900/40 text-blue-300 border border-blue-700/50',
    iconName: 'Inbox',
    description: 'Pakaian fisik telah diterima di loket/workshop laundry'
  },
  DITIMBANG: {
    label: 'Ditimbang',
    step: 3,
    color: 'text-cyan-400',
    bgLight: 'bg-cyan-950/30 border-cyan-800/40 text-cyan-300',
    badgeClass: 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50',
    iconName: 'Scale',
    description: 'Berat netto dan jumlah potong pakaian telah diverifikasi'
  },
  SORTIR: {
    label: 'Sortir Pakaian',
    step: 4,
    color: 'text-indigo-400',
    bgLight: 'bg-indigo-950/30 border-indigo-800/40 text-indigo-300',
    badgeClass: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50',
    iconName: 'Layers',
    description: 'Pemisahan pakaian putih, berwarna, bahan sensitif, & cek noda'
  },
  DICUCI: {
    label: 'Sedang Dicuci',
    step: 5,
    color: 'text-sky-400',
    bgLight: 'bg-sky-950/30 border-sky-800/40 text-sky-300',
    badgeClass: 'bg-sky-900/40 text-sky-300 border border-sky-700/50',
    iconName: 'RotateCw',
    description: 'Pencucian mesin cuci higienis dengan deterjen eco wash'
  },
  DIBILAS: {
    label: 'Pembilasan & Softener',
    step: 6,
    color: 'text-teal-400',
    bgLight: 'bg-teal-950/30 border-teal-800/40 text-teal-300',
    badgeClass: 'bg-teal-900/40 text-teal-300 border border-teal-700/50',
    iconName: 'Droplets',
    description: 'Pembilasan bersih tuntas dan pemberian pelembut harum'
  },
  DIKERINGKAN: {
    label: 'Pengeringan',
    step: 7,
    color: 'text-orange-400',
    bgLight: 'bg-orange-950/30 border-orange-800/40 text-orange-300',
    badgeClass: 'bg-orange-900/40 text-orange-300 border border-orange-700/50',
    iconName: 'Sun',
    description: 'Proses pengeringan mesin dryer bebas bau apek'
  },
  DISETRIKA: {
    label: 'Setrika Uap',
    step: 8,
    color: 'text-purple-400',
    bgLight: 'bg-purple-950/30 border-purple-800/40 text-purple-300',
    badgeClass: 'bg-purple-900/40 text-purple-300 border border-purple-700/50',
    iconName: 'Flame',
    description: 'Penyetrikaan uap rapi berstandar pesantren & parfum semerbak'
  },
  QUALITY_CHECK: {
    label: 'Quality Check (QC)',
    step: 9,
    color: 'text-rose-400',
    bgLight: 'bg-rose-950/30 border-rose-800/40 text-rose-300',
    badgeClass: 'bg-rose-900/40 text-rose-300 border border-rose-700/50',
    iconName: 'CheckCircle2',
    description: 'Pemeriksaan kebersihan, jumlah item cocok, & anti-tertukar'
  },
  PACKING: {
    label: 'Packing Rapi',
    step: 10,
    color: 'text-emerald-400',
    bgLight: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300',
    badgeClass: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
    iconName: 'PackageCheck',
    description: 'Pengemasan higienis, grouping per kamar / per invoice'
  },
  SIAP_DIAMBIL: {
    label: 'Siap Diambil / Kirim',
    step: 11,
    color: 'text-emerald-300',
    bgLight: 'bg-emerald-900/40 border-emerald-600/50 text-emerald-200',
    badgeClass: 'bg-emerald-600 text-white font-semibold',
    iconName: 'Store',
    description: 'Laundry selesai sempurna, siap diambil santri/pelanggan'
  },
  DALAM_PENGIRIMAN: {
    label: 'Dalam Pengiriman',
    step: 12,
    color: 'text-blue-300',
    bgLight: 'bg-blue-900/40 border-blue-600/50 text-blue-200',
    badgeClass: 'bg-blue-600 text-white font-semibold',
    iconName: 'Truck',
    description: 'Kurir sedang mengantar ke asrama / alamat tujuan'
  },
  SELESAI: {
    label: 'Selesai & Diterima',
    step: 13,
    color: 'text-slate-400',
    bgLight: 'bg-slate-800/50 border-slate-700/50 text-slate-300',
    badgeClass: 'bg-slate-800 text-slate-200 border border-slate-700 font-semibold',
    iconName: 'CheckCheck',
    description: 'Laundry telah diserahterimakan dan transaksi tuntas'
  }
};

// QR CODE UTILITIES
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 1,
      color: {
        dark: '#064e3b', // emerald 900
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR code generation failed', err);
    return '';
  }
}

// WHATSAPP TEMPLATES BUILDER
export function buildWhatsAppLink(
  phone: string, 
  templateType: 'ORDER_DITERIMA' | 'SEDANG_DIPROSES' | 'SIAP_DIAMBIL' | 'DELIVERY' | 'SELESAI' | 'TAGIHAN' | 'SANTRI_ASRAMA',
  order: LaundryOrder
): string {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
  const store = StorageService.getSettings();
  
  let msg = '';
  const formattedGrandTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.grandTotal);

  switch (templateType) {
    case 'ORDER_DITERIMA':
      msg = `*LAUNDRY ALMAWADDAH*\n_Bersih, Wangi, Rapi, Amanah_\n\nAssalamu'alaikum Wr. Wb.\nHalo Kak *${order.customerName}*,\n\nLaundry Anda dengan No. Invoice *${order.id}* telah kami terima dengan rincian:\n- Berat/Qty: ${order.totalWeightKg} Kg (${order.totalPieces} potong)\n- Total Biaya: ${formattedGrandTotal}\n- Status Bayar: *${order.paymentStatus}*\n- Estimasi Selesai: ${order.estimatedCompletionDate}\n\nTerima kasih atas kepercayaannya. Kami proses dengan sepenuh hati dan amanah.\n\nWassalamu'alaikum Wr. Wb.`;
      break;

    case 'SEDANG_DIPROSES':
      msg = `*LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nHalo Kak *${order.customerName}*,\n\nLaundry dengan No. Invoice *${order.id}* saat ini sedang dalam proses *${STATUS_METADATA[order.currentStatus].label}*.\nKami pastikan setiap pakaian dicuci bersih, wangi, higienis, dan amanah.\n\nSalam hangat,\nTim Laundry Almawaddah`;
      break;

    case 'SIAP_DIAMBIL':
      msg = `*LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nHalo Kak *${order.customerName}*,\n\nAlhamdulillah! Laundry Anda dengan No. Invoice *${order.id}* sudah *SELESAI & SIAP DIAMBIL* di outlet Laundry Almawaddah.\n\n- Total Tagihan: ${formattedGrandTotal}\n- Status Pembayaran: *${order.paymentStatus}*\n\nSilakan datang mengambil dengan menunjukkan pesan ini atau sebutkan nama Anda. Syukron katsiran!`;
      break;

    case 'DELIVERY':
      msg = `*LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nHalo Kak *${order.customerName}*,\n\nLaundry Anda (*${order.id}*) sedang dalam perjalanan menuju alamat tujuan:\n📍 *${order.delivery.address}*\nPetugas Pengantar: *${order.delivery.courierStaffName || 'Kurir Almawaddah'}*\n\nMohon pastikan ada penerima di lokasi. Terima kasih!`;
      break;

    case 'SELESAI':
      msg = `*LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nTerima kasih Kak *${order.customerName}* telah mempercayakan cucian Anda di *Laundry Almawaddah* (Invoice: *${order.id}*).\n\nSemoga pakaian senantiasa bersih, wangi, dan berkah untuk menunjang aktivitas ibadah dan keseharian Anda. Ditunggu kedatangannya kembali! 😊`;
      break;

    case 'TAGIHAN':
      msg = `*TAGIHAN LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nYth. Kak *${order.customerName}*,\n\nBerikut rincian tagihan laundry Anda:\n- No. Invoice: *${order.id}*\n- Tanggal Masuk: ${order.orderDate}\n- Total Tagihan: *${formattedGrandTotal}*\n- Status: *${order.paymentStatus}*\n\nPembayaran dapat ditransfer melalui Rekening BSI: *7123-4567-8901* a.n. Koperasi Almawaddah Laundry atau QRIS di kasir.\n\nJazaakumullahu khairan.`;
      break;

    case 'SANTRI_ASRAMA':
      const info = order.studentInfo;
      msg = `*INFORMASI LAUNDRY SANTRIWATI*\n*LAUNDRY ALMAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\nYth. Bapak/Ibu Wali Santri (*${info?.guardianName || 'Orang Tua'}*),\n\nLaundry santriwati ananda *${order.customerName}* (NIS: ${info?.nis || order.customerId}, Kelas: ${info?.className || '-'}) telah *SELESAI & SIAP DIAMBIL* di loket laundry pondok.\n\n- No. Invoice: ${order.id}\n- Berat: ${order.totalWeightKg} Kg (${order.totalPieces} pcs)\n- Status Bayar: *${order.paymentStatus}*\n\nSyukron katsiran wa jazaakumullahu khairan.\n\nSalam hangat,\nPengelola Laundry Almawaddah`;
      break;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

// WhatsApp Link for Santri Debt / Tagihan Wali
export function buildSantriDebtWhatsAppLink(
  guardianPhone: string,
  studentName: string,
  nis: string,
  className: string,
  guardianName: string,
  totalDebt: number,
  unpaidOrders: LaundryOrder[]
): string {
  const cleanPhone = (guardianPhone || '').replace(/\D/g, '').replace(/^0/, '62');
  const formattedDebt = formatRupiah(totalDebt);
  
  let orderBreakdown = '';
  if (unpaidOrders && unpaidOrders.length > 0) {
    orderBreakdown = unpaidOrders.map(o => {
      const remaining = Math.max(0, o.grandTotal - (o.paidAmount || 0));
      return `• *${o.id}* (${o.orderDate.slice(0, 10)}) : ${formatRupiah(remaining)} (${o.totalWeightKg} Kg)`;
    }).join('\n');
  }

  const msg = `*PEMBERITAHUAN TAGIHAN LAUNDRY SANTRIWATI*\n*PONDOK PESANTREN AL-MAWADDAH*\n\nAssalamu'alaikum Wr. Wb.\n\nYth. Bapak/Ibu *${guardianName || 'Wali Santri'}*,\nOrang tua dari santriwati ananda:\n👤 *${studentName}*\n🆔 NIS: *${nis}*\n🏫 Kelas: *${className}*\n\nBerikut kami sampaikan rincian tagihan / sisa hutang laundry ananda di Laundry Pesantren Almawaddah per tanggal hari ini:\n\n${orderBreakdown ? `${orderBreakdown}\n\n` : ''}💰 *TOTAL TUNGGAKAN / SISA HUTANG: ${formattedDebt}*\n\nPembayaran dapat dilakukan secara tunai di kasir laundry atau transfer ke rekening resmi pondok:\n🏦 *Bank Syariah Indonesia (BSI)*\nNo. Rekening: *7123-4567-8901*\nAtas Nama: *Koperasi Almawaddah Laundry*\n\n_Mohon konfirmasi bukti transfer melalui nomor WhatsApp ini jika sudah melakukan pembayaran._\n\nAtas perhatian dan kerjasamanya kami ucapkan terima kasih. Jazaakumullahu khairan katsiran.\n\nWassalamu'alaikum Wr. Wb.\n\n*Bendahara & Administrasi Laundry Almawaddah*`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

// FORMATTER HELPERS
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}
