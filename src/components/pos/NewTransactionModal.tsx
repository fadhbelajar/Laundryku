import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  QrCode, 
  User, 
  Sparkles, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Tag, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Building,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Customer, 
  CustomerType, 
  LaundryService, 
  OrderItem, 
  AdditionalOption, 
  TransactionMode, 
  PaymentMethod, 
  PaymentStatus, 
  LaundryOrder, 
  DeliveryZone, 
  PromoVoucher 
} from '../../types';
import { StorageService, formatRupiah } from '../../data/storage';
import { QrScannerModal } from '../common/QrScannerModal';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: LaundryOrder) => void;
  preSelectedCustomer?: Customer | null;
}

const AVAILABLE_PERFUMES = [
  'Aroma Mawar Madinah (Soft & Fresh)',
  'Aroma Melati Pesantren (Segar & Menenangkan)',
  'Aroma Kasturi Amber (Elegan & Tahan Lama)',
  'Aroma Sakura Blossom (Wangi Lembut Bunga)',
  'Aroma Lavender Dream (Relaksasi & Anti Bakteri)',
  'Aroma Ocean Fresh & Antibakterial'
];

const DEFAULT_ADDONS: AdditionalOption[] = [
  { id: 'ADD-1', name: 'Anti Bakteri Higienis Sanitizer', price: 2000, selected: false },
  { id: 'ADD-2', name: 'Plastik Hanger Gantung Khusus', price: 5000, selected: false },
  { id: 'ADD-3', name: 'Extra Pelembut & Pelicin Uap', price: 3000, selected: false },
  { id: 'ADD-4', name: 'Pewangi Extra Semprot (Tahan 30 Hari)', price: 4000, selected: false }
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  preSelectedCustomer
}) => {
  const [customerCategory, setCustomerCategory] = useState<CustomerType>('SANTRIWATI');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(preSelectedCustomer || null);
  const [showScanner, setShowScanner] = useState(false);

  // Cart & items
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedPerfume, setSelectedPerfume] = useState<string>(AVAILABLE_PERFUMES[0]);
  const [addons, setAddons] = useState<AdditionalOption[]>(DEFAULT_ADDONS);
  const [transactionMode, setTransactionMode] = useState<TransactionMode>('DROP_OFF');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ZONE-A');
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState('');

  // Discount & Vouchers
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<PromoVoucher | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('LUNAS');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Loaded Master Data
  const customers = StorageService.getCustomers();
  const services = StorageService.getServices().filter(s => s.isActive);
  const deliveryZones = StorageService.getZones().filter(z => z.isActive);
  const promos = StorageService.getPromos().filter(p => p.isActive);
  const currentStaff = StorageService.getCurrentStaff();

  // Set initial customer if passed
  React.useEffect(() => {
    if (preSelectedCustomer) {
      setSelectedCustomer(preSelectedCustomer);
      setCustomerCategory(preSelectedCustomer.type);
    }
  }, [preSelectedCustomer]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchType = c.type === customerCategory;
      if (!customerSearchQuery.trim()) return matchType;
      const q = customerSearchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchNis = c.student?.nis?.toLowerCase().includes(q);
      const matchClass = c.student?.className?.toLowerCase().includes(q);
      const matchGuardian = c.student?.guardianName?.toLowerCase().includes(q);
      return matchType && (matchName || matchId || matchPhone || matchNis || matchClass || matchGuardian);
    });
  }, [customers, customerCategory, customerSearchQuery]);

  // Helper to get service unit price for current customer category
  const getServicePrice = (service: LaundryService): number => {
    if (!selectedCustomer) return service.priceUmum;
    if (selectedCustomer.type === 'SANTRIWATI') return service.priceSantri;
    if (selectedCustomer.type === 'WARGA_PESANTREN') return service.priceWarga;
    return service.priceUmum;
  };

  // Add service to cart
  const handleAddServiceToCart = (service: LaundryService) => {
    const unitPrice = getServicePrice(service);
    const existingIndex = cartItems.findIndex(i => i.serviceId === service.id);

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + (service.category === 'KILOAN' ? 1 : 1);
      updated[existingIndex].quantity = Number(newQty.toFixed(1));
      updated[existingIndex].subtotal = updated[existingIndex].quantity * unitPrice;
      setCartItems(updated);
    } else {
      const defaultQty = service.category === 'KILOAN' ? 3.0 : 1;
      setCartItems(prev => [
        ...prev,
        {
          id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          serviceId: service.id,
          serviceName: service.name,
          unit: service.unit,
          quantity: defaultQty,
          unitPrice: unitPrice,
          subtotal: defaultQty * unitPrice,
          notes: ''
        }
      ]);
    }
  };

  const handleUpdateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== id));
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: Number(qty.toFixed(1)),
          subtotal: Math.round(Number(qty.toFixed(1)) * item.unitPrice)
        };
      }
      return item;
    }));
  };

  const handleUpdateItemNotes = (id: string, notes: string) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const handleToggleAddon = (id: string) => {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  // Calculate totals
  const itemsSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.subtotal, 0), [cartItems]);
  const addonsSubtotal = useMemo(() => addons.filter(a => a.selected).reduce((acc, a) => acc + a.price, 0), [addons]);
  
  const totalWeightKg = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return item.unit === 'Kg' ? acc + item.quantity : acc;
    }, 0);
  }, [cartItems]);

  const totalPieces = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return item.unit !== 'Kg' ? acc + item.quantity : acc + Math.round(item.quantity * 2.5);
    }, 0);
  }, [cartItems]);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryFee = transactionMode === 'PICKUP_DELIVERY' && selectedZone ? selectedZone.fee : 0;

  // Warga Pesantren VIP discount calculation
  const wargaDiscount = useMemo(() => {
    if (selectedCustomer?.type === 'WARGA_PESANTREN' && selectedCustomer.warga) {
      const pct = selectedCustomer.warga.discountPercentage || 0;
      return Math.round((itemsSubtotal * pct) / 100);
    }
    return 0;
  }, [selectedCustomer, itemsSubtotal]);

  // Voucher discount
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discountType === 'PERCENTAGE') {
      return Math.round((itemsSubtotal * appliedVoucher.discountValue) / 100);
    }
    return appliedVoucher.discountValue;
  }, [appliedVoucher, itemsSubtotal]);

  const totalDiscount = wargaDiscount + voucherDiscount;

  // Points discount for Masyarakat Umum (1 point = Rp500)
  const maxAvailablePoints = selectedCustomer?.umum?.loyaltyPoints || 0;
  const pointsUsed = usePoints ? Math.min(maxAvailablePoints, Math.floor(itemsSubtotal / 500)) : 0;
  const pointsDiscount = pointsUsed * 500;

  // Package Quota usage for Santri
  const hasSantriPackage = selectedCustomer?.type === 'SANTRIWATI' && (selectedCustomer.student?.packageRemainingKg || 0) > 0;
  const usedPackageQuotaKg = hasSantriPackage ? Math.min(totalWeightKg, selectedCustomer?.student?.packageRemainingKg || 0) : 0;

  const rawGrandTotal = itemsSubtotal + addonsSubtotal + deliveryFee - totalDiscount - pointsDiscount;
  const grandTotal = Math.max(0, rawGrandTotal);

  // Apply Voucher
  const handleApplyVoucher = () => {
    const code = voucherCodeInput.trim().toUpperCase();
    const found = promos.find(p => p.code.toUpperCase() === code);
    if (!found) {
      alert('Kode voucher tidak ditemukan atau sudah kadaluarsa.');
      return;
    }
    if (found.minTransaction && itemsSubtotal < found.minTransaction) {
      alert(`Minimal transaksi untuk voucher ini adalah ${formatRupiah(found.minTransaction)}`);
      return;
    }
    setAppliedVoucher(found);
  };

  const handleScanSuccess = (_code: string, foundEntity?: { type: 'CUSTOMER' | 'ORDER' | 'ROOM', data: any }) => {
    if (foundEntity && foundEntity.type === 'CUSTOMER') {
      setSelectedCustomer(foundEntity.data as Customer);
      setCustomerCategory(foundEntity.data.type);
    }
  };

  // Submit Order
  const handleSaveOrder = () => {
    if (!selectedCustomer) {
      alert('Silakan pilih pelanggan terlebih dahulu!');
      return;
    }
    if (cartItems.length === 0) {
      alert('Keranjang cucian masih kosong. Silakan pilih minimal 1 layanan!');
      return;
    }

    const now = new Date();
    const nowStr = now.toISOString().replace('T', ' ').slice(0, 16);

    // Calculate completion estimate (default 2 days / 48 hrs)
    const estDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const estDateStr = estDate.toISOString().replace('T', ' ').slice(0, 16);

    const invoiceNumber = StorageService.generateInvoiceNumber();

    const newOrder: LaundryOrder = {
      id: invoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerType: selectedCustomer.type,
      studentDormInfo: selectedCustomer.student ? {
        className: selectedCustomer.student.className,
        guardianName: selectedCustomer.student.guardianName,
        guardianPhone: selectedCustomer.student.guardianPhone
      } : undefined,
      transactionMode: transactionMode,
      items: cartItems,
      perfumeOption: selectedPerfume,
      additionalAddons: addons.filter(a => a.selected),
      totalWeightKg: Number(totalWeightKg.toFixed(1)),
      totalPieces: totalPieces,
      itemsSubtotal: itemsSubtotal,
      addonsSubtotal: addonsSubtotal,
      deliveryFee: deliveryFee,
      discountAmount: totalDiscount,
      voucherCode: appliedVoucher?.code,
      pointsUsed: pointsUsed,
      pointsDiscount: pointsDiscount,
      grandTotal: grandTotal,
      usedPackageQuotaKg: usedPackageQuotaKg,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paidAmount: paymentStatus === 'LUNAS' ? (cashGiven > grandTotal ? cashGiven : grandTotal) : (paymentStatus === 'DP' ? cashGiven : 0),
      changeAmount: paymentStatus === 'LUNAS' && cashGiven > grandTotal ? cashGiven - grandTotal : 0,
      orderDate: nowStr,
      estimatedCompletionDate: estDateStr,
      currentStatus: 'ORDER_BARU',
      statusHistory: [
        {
          id: `LOG-${Date.now()}`,
          status: 'ORDER_BARU',
          timestamp: nowStr,
          staffName: currentStaff.name,
          notes: `Transaksi dibuat oleh kasir ${currentStaff.name}`
        }
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
        bagType: selectedCustomer.type === 'SANTRIWATI' ? 'LAUNDRY_BAG_SANTRI' : 'PLASTIK_STANDAR',
        qrCodeUrl: invoiceNumber,
        roomBatchId: selectedCustomer.student ? `BATCH-${selectedCustomer.student.roomNumber.replace(/\s+/g, '')}` : undefined
      },
      delivery: {
        isDelivery: transactionMode === 'PICKUP_DELIVERY',
        type: transactionMode === 'PICKUP_DELIVERY' ? 'BOTH' : 'NONE',
        zoneId: selectedZone?.id,
        zoneName: selectedZone?.name,
        fee: deliveryFee,
        address: transactionMode === 'PICKUP_DELIVERY'
          ? (customDeliveryAddress || selectedCustomer.student?.dormitoryName || selectedCustomer.warga?.complexAddress || selectedCustomer.umum?.fullAddress || '')
          : 'Ambil di Tempat',
        deliveryStatus: transactionMode === 'PICKUP_DELIVERY' ? 'DIJADWALKAN' : undefined
      },
      staffInChargeName: currentStaff.name,
      specialInstructions: specialInstructions
    };

    StorageService.createOrder(newOrder);

    // Confetti effect on creation
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    onOrderCreated(newOrder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="new-pos-transaction-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-xs">
              <ShoppingBag className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                Kasir Transaksi Baru
                <span className="text-[11px] font-semibold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  POS Almawaddah
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90">
                Kasir: <strong className="text-white">{currentStaff.name}</strong> ({currentStaff.roleTitle})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Customer Selection & Services catalog (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-5 overflow-y-auto">
            
            {/* Step 1: Customer Category & Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  1. Pilih Kategori Pelanggan
                </label>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Scan QR Pelanggan
                </button>
              </div>

              {/* 3 Main Customer Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerCategory('SANTRIWATI');
                    if (selectedCustomer?.type !== 'SANTRIWATI') setSelectedCustomer(null);
                  }}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    customerCategory === 'SANTRIWATI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="block text-base mb-0.5">👧</span>
                  <span className="text-xs block">SANTRIWATI</span>
                  <span className="text-[10px] text-emerald-700/80 font-normal">Tarif Khusus & Paket</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerCategory('WARGA_PESANTREN');
                    if (selectedCustomer?.type !== 'WARGA_PESANTREN') setSelectedCustomer(null);
                  }}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    customerCategory === 'WARGA_PESANTREN'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="block text-base mb-0.5">🕌</span>
                  <span className="text-xs block">WARGA PESANTREN</span>
                  <span className="text-[10px] text-emerald-700/80 font-normal">Asatidz & Karyawan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerCategory('MASYARAKAT_UMUM');
                    if (selectedCustomer?.type !== 'MASYARAKAT_UMUM') setSelectedCustomer(null);
                  }}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    customerCategory === 'MASYARAKAT_UMUM'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="block text-base mb-0.5">👥</span>
                  <span className="text-xs block">MASYARAKAT UMUM</span>
                  <span className="text-[10px] text-emerald-700/80 font-normal">Pelanggan Luar & Member</span>
                </button>
              </div>

              {/* Customer Selector / Autocomplete */}
              {!selectedCustomer ? (
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Cari nama ${customerCategory === 'SANTRIWATI' ? 'santriwati / NIS / Kelas / Orang Tua' : 'pelanggan / nomor WA'}...`}
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="w-full text-left p-2.5 hover:bg-emerald-50/70 transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {customer.name}
                            <span className="font-mono text-[10px] text-slate-400 font-normal">({customer.student?.nis || customer.id})</span>
                          </div>
                          {customer.student && (
                            <span className="text-[11px] text-emerald-700 font-medium block">
                              Kelas: {customer.student.className} • Wali: {customer.student.guardianName || '-'}
                            </span>
                          )}
                          {customer.warga && (
                            <span className="text-[11px] text-teal-700 font-medium block">
                              {customer.warga.category} • {customer.warga.complexAddress} ({customer.warga.membershipTier})
                            </span>
                          )}
                          {customer.umum && (
                            <span className="text-[11px] text-slate-500 block">
                              {customer.umum.subdistrict}, {customer.umum.village} • Poin: {customer.umum.loyaltyPoints}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          Pilih
                        </span>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Tidak ditemukan pelanggan dengan kriteria tersebut.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Selected Customer Banner */
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {selectedCustomer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-emerald-950">{selectedCustomer.name}</h4>
                        <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                          {selectedCustomer.student?.nis || selectedCustomer.id}
                        </span>
                      </div>
                      {selectedCustomer.student && (
                        <div className="text-emerald-800 font-medium text-[11px] space-y-0.5">
                          <div>
                            Kelas: <strong>{selectedCustomer.student.className}</strong> • Wali: <strong>{selectedCustomer.student.guardianName || '-'}</strong>
                          </div>
                          {selectedCustomer.student.packageRemainingKg !== undefined && (
                            <div className="text-[10px] text-emerald-700 font-semibold">
                              ✨ Kuota Paket Tersedia: <span className="text-emerald-950 font-bold">{selectedCustomer.student.packageRemainingKg} Kg</span>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedCustomer.warga && (
                        <div className="text-teal-800 text-[11px]">
                          {selectedCustomer.warga.position} • Member: <strong className="text-teal-950">{selectedCustomer.warga.membershipTier} (Diskon {selectedCustomer.warga.discountPercentage}%)</strong>
                        </div>
                      )}
                      {selectedCustomer.umum && (
                        <div className="text-slate-600 text-[11px]">
                          {selectedCustomer.umum.fullAddress} • <strong>{selectedCustomer.umum.loyaltyPoints} Poin</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                  >
                    Ganti
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Service Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  2. Pilih Layanan Laundry
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  Harga Otomatis: <strong className="text-emerald-800">{customerCategory.replace('_', ' ')}</strong>
                </span>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {services.map(service => {
                  const price = getServicePrice(service);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleAddServiceToCart(service)}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-950 leading-tight">
                            {service.name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Est. {service.estimatedHours} Jam • {service.category}
                          </span>
                        </div>
                        <span className="p-1 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-slate-600">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-[10px] text-slate-500">Tarif per {service.unit}:</span>
                        <span className="font-bold text-emerald-800">{formatRupiah(price)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Add-ons & Fragrance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Perfume */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Pilihan Parfum Laundry:</label>
                <select
                  value={selectedPerfume}
                  onChange={(e) => setSelectedPerfume(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  {AVAILABLE_PERFUMES.map((perfume, idx) => (
                    <option key={idx} value={perfume}>{perfume}</option>
                  ))}
                </select>
              </div>

              {/* Transaction Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Mode Transaksi:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTransactionMode('DROP_OFF')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      transactionMode === 'DROP_OFF'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏪 Drop Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionMode('PICKUP_DELIVERY')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                      transactionMode === 'PICKUP_DELIVERY'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🚚 Pickup & Antar
                  </button>
                </div>
              </div>
            </div>

            {/* If Pickup & Delivery: Zone Selector */}
            {transactionMode === 'PICKUP_DELIVERY' && (
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    Pilih Zona Pengantaran:
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {deliveryZones.map(zone => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        selectedZoneId === zone.id
                          ? 'border-emerald-700 bg-white text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] block truncate">{zone.name.split('-')[0]}</span>
                      <span className="text-xs font-extrabold text-emerald-800 block">
                        {zone.fee === 0 ? 'GRATIS' : formatRupiah(zone.fee)}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Catatan / Alamat spesifik pengantaran..."
                  value={customDeliveryAddress}
                  onChange={(e) => setCustomDeliveryAddress(e.target.value)}
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            {/* Add-ons checkboxes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Layanan Tambahan:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {addons.map(addon => (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => handleToggleAddon(addon.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      addon.selected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="truncate">{addon.name}</span>
                    <span className="text-[11px] font-semibold text-emerald-800">+{formatRupiah(addon.price)}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Order Cart, Calculation, Payment & Submit (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-slate-50 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  Rincian Item Cucian ({cartItems.length})
                </h3>
                <span className="text-xs font-bold text-emerald-800">
                  {totalWeightKg > 0 ? `${totalWeightKg.toFixed(1)} Kg` : ''} 
                  {totalPieces > 0 ? ` • ${totalPieces} Pcs` : ''}
                </span>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.serviceName}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatRupiah(item.unitPrice)} / {item.unit}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(item.id, 0)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      {/* Qty controller */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.id, item.quantity - (item.unit === 'Kg' ? 0.5 : 1))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step={item.unit === 'Kg' ? '0.1' : '1'}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQty(item.id, parseFloat(e.target.value) || 0)}
                          className="w-14 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold py-0.5 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-medium">{item.unit}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(item.id, item.quantity + (item.unit === 'Kg' ? 0.5 : 1))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}

                {cartItems.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    Keranjang cucian masih kosong. Pilih layanan di sebelah kiri.
                  </div>
                )}
              </div>

              {/* Promo & Loyalty Points section */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                {/* Voucher input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode Voucher (misal: JUMATBERKAH)..."
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 uppercase focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                  >
                    Gunakan
                  </button>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 font-medium">
                    <span>✨ Voucher {appliedVoucher.code} ({appliedVoucher.title})</span>
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-rose-600 text-xs font-bold hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Loyalty points toggle for Umum */}
                {selectedCustomer?.type === 'MASYARAKAT_UMUM' && (selectedCustomer.umum?.loyaltyPoints || 0) > 0 && (
                  <div className="flex items-center justify-between text-xs bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <span className="text-amber-950 font-medium">
                      Punya {selectedCustomer.umum?.loyaltyPoints} Poin ({formatRupiah((selectedCustomer.umum?.loyaltyPoints || 0) * 500)})
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-amber-900 text-xs">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      Gunakan Poin
                    </label>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Cucian:</span>
                  <span>{formatRupiah(itemsSubtotal)}</span>
                </div>
                {addonsSubtotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tambahan / Addons:</span>
                    <span>{formatRupiah(addonsSubtotal)}</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Ongkir Pengantaran:</span>
                    <span>{formatRupiah(deliveryFee)}</span>
                  </div>
                )}
                {wargaDiscount > 0 && (
                  <div className="flex justify-between text-teal-700 font-semibold">
                    <span>Diskon Member Warga ({selectedCustomer?.warga?.discountPercentage}%):</span>
                    <span>-{formatRupiah(wargaDiscount)}</span>
                  </div>
                )}
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Diskon Voucher:</span>
                    <span>-{formatRupiah(voucherDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Potongan Poin:</span>
                    <span>-{formatRupiah(pointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-100">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="text-emerald-900">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Section */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Metode Bayar:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="TUNAI">💵 Tunai (Cash)</option>
                      <option value="QRIS">📱 QRIS Almawaddah</option>
                      <option value="TRANSFER_BANK">🏦 Transfer Bank BSI</option>
                      {hasSantriPackage && <option value="KUOTA_PAKET">✨ Potong Kuota Paket</option>}
                      <option value="SALDO_MEMBER">💳 Saldo Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Status Pembayaran:</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="LUNAS">🟢 Lunas Sekarang</option>
                      <option value="BELUM_BAYAR">🔴 Bayar Saat Ambil</option>
                      <option value="DP">🟡 Uang Muka (DP)</option>
                    </select>
                  </div>
                </div>

                {/* Cash tender calculator if cash */}
                {paymentMethod === 'TUNAI' && paymentStatus === 'LUNAS' && (
                  <div className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 shrink-0">Uang Diterima:</span>
                    <input
                      type="number"
                      placeholder={grandTotal.toString()}
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                    {cashGiven > grandTotal && (
                      <span className="text-emerald-700 font-bold shrink-0 text-[11px]">
                        Kembali: {formatRupiah(cashGiven - grandTotal)}
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Submit Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-extrabold py-3 px-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" />
                Simpan & Cetak Nota ({formatRupiah(grandTotal)})
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
