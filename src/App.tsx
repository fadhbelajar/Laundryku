import React, { useState, useEffect } from 'react';
import { StorageService } from './data/storage';
import { Customer, LaundryOrder, StaffUser } from './types';
import { applyBrandingToDOM } from './utils/imageProcessor';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { SuperAdminDashboard } from './components/dashboard/SuperAdminDashboard';
import { StaffMobileDashboard } from './components/dashboard/StaffMobileDashboard';
import { CustomerPortalView } from './components/dashboard/CustomerPortalView';
import { OrderList } from './components/orders/OrderList';
import { PackingDistribution } from './components/packing/PackingDistribution';
import { PickupDeliveryManagement } from './components/pickup-delivery/PickupDeliveryManagement';
import { CustomerList } from './components/customers/CustomerList';
import { ServiceManagement } from './components/services/ServiceManagement';
import { FinanceModule } from './components/finance/FinanceModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { ComplaintManagement } from './components/complaints/ComplaintManagement';
import { PromoManagement } from './components/promos/PromoManagement';
import { StaffManagement } from './components/staff/StaffManagement';
import { SettingsModule } from './components/settings/SettingsModule';

// Common Modals
import { NewTransactionModal } from './components/pos/NewTransactionModal';
import { CustomerFormModal } from './components/customers/CustomerFormModal';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal';
import { StudentQrCardModal } from './components/common/StudentQrCardModal';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { StatusChangeModal } from './components/orders/StatusChangeModal';
import { QualityControlModal } from './components/orders/QualityControlModal';
import { QrScannerModal } from './components/common/QrScannerModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';

// Printer Modals (Receipt & Bag Label)
import { ThermalReceiptModal } from './components/common/ThermalReceiptModal';
import { BagLabelModal } from './components/common/BagLabelModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<StaffUser>(StorageService.getCurrentStaff());

  // Modal States
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);

  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [defaultCustomerType, setDefaultCustomerType] = useState<any>('SANTRIWATI');

  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [viewingQrCustomer, setViewingQrCustomer] = useState<Customer | null>(null);

  const [viewingOrder, setViewingOrder] = useState<LaundryOrder | null>(null);
  const [statusChangingOrder, setStatusChangingOrder] = useState<LaundryOrder | null>(null);
  const [qcOrder, setQcOrder] = useState<LaundryOrder | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [whatsAppOrder, setWhatsAppOrder] = useState<LaundryOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<LaundryOrder | null>(null);
  const [bagLabelOrder, setBagLabelOrder] = useState<LaundryOrder | null>(null);

  // Sync staff on switch
  const handleRoleChanged = () => {
    setCurrentStaff(StorageService.getCurrentStaff());
  };

  // Sync Branding & Favicon & Title on mount & storage updates
  useEffect(() => {
    applyBrandingToDOM(StorageService.getSettings());

    const handleStorageUpdate = () => {
      applyBrandingToDOM(StorageService.getSettings());
    };

    window.addEventListener('almawaddah_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('almawaddah_storage_updated', handleStorageUpdate);
  }, []);

  // QR Scan Handler
  const handleScanResult = (result: string) => {
    setIsScannerOpen(false);
    const clean = result.trim();

    // Check if it matches an Invoice ID
    const orders = StorageService.getOrders();
    const matchedOrder = orders.find(o => o.id.toLowerCase() === clean.toLowerCase());
    if (matchedOrder) {
      setViewingOrder(matchedOrder);
      return;
    }

    // Check if it matches a Customer ID or NIS
    const customers = StorageService.getCustomers();
    const matchedCustomer = customers.find(c => 
      c.id.toLowerCase() === clean.toLowerCase() || 
      (c.student?.nis && c.student.nis.toLowerCase() === clean.toLowerCase())
    );
    if (matchedCustomer) {
      setViewingCustomer(matchedCustomer);
      return;
    }

    alert(`Hasil Scan: ${result}\nTidak ditemukan transaksi atau kartu santri yang cocok.`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans antialiased">
      
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentStaff={currentStaff}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top Sticky Header */}
        <Header
          currentStaff={currentStaff}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewTransaction={() => {
            setPreselectedCustomer(null);
            setIsNewTxOpen(true);
          }}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenStaffModal={() => setActiveTab('STAFF')}
          activeTab={activeTab}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {activeTab === 'DASHBOARD' && (
            <SuperAdminDashboard
              onOpenNewTransaction={() => {
                setPreselectedCustomer(null);
                setIsNewTxOpen(true);
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectOrder={setViewingOrder}
              onNavigateTab={setActiveTab}
              onOpenReceipt={setReceiptOrder}
              onOpenBagLabel={setBagLabelOrder}
              onOpenWhatsApp={setWhatsAppOrder}
            />
          )}

          {activeTab === 'STAFF_MOBILE' && (
            <StaffMobileDashboard
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectOrder={setViewingOrder}
              onOpenStatusModal={setStatusChangingOrder}
              onOpenQcModal={setQcOrder}
              onOpenBagLabel={setBagLabelOrder}
            />
          )}

          {activeTab === 'ORDERS' && (
            <OrderList
              onSelectOrder={setViewingOrder}
              onOpenNewTransaction={() => {
                setPreselectedCustomer(null);
                setIsNewTxOpen(true);
              }}
              onOpenStatusModal={setStatusChangingOrder}
              onOpenQcModal={setQcOrder}
              onOpenReceipt={setReceiptOrder}
              onOpenBagLabel={setBagLabelOrder}
              onOpenWhatsApp={setWhatsAppOrder}
            />
          )}

          {activeTab === 'PACKING' && (
            <PackingDistribution
              onOpenReceipt={setReceiptOrder}
              onOpenBagLabel={setBagLabelOrder}
              onOpenWhatsApp={setWhatsAppOrder}
              onSelectOrder={setViewingOrder}
            />
          )}

          {activeTab === 'PICKUP_DELIVERY' && (
            <PickupDeliveryManagement
              onSelectOrder={setViewingOrder}
              onOpenWhatsApp={setWhatsAppOrder}
            />
          )}

          {activeTab === 'CUSTOMERS' && (
            <CustomerList
              onOpenAddCustomer={(type) => {
                setEditingCustomer(null);
                setDefaultCustomerType(type);
                setIsCustomerFormOpen(true);
              }}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setIsCustomerFormOpen(true);
              }}
              onViewCustomer={setViewingCustomer}
              onViewQrCard={setViewingQrCustomer}
              onNewOrder={(cust) => {
                setPreselectedCustomer(cust);
                setIsNewTxOpen(true);
              }}
            />
          )}

          {activeTab === 'PORTAL_PUBLIC' && (
            <CustomerPortalView
              onOpenWhatsApp={setWhatsAppOrder}
            />
          )}

          {activeTab === 'SERVICES' && (
            <ServiceManagement />
          )}

          {activeTab === 'FINANCE' && (
            <FinanceModule />
          )}

          {activeTab === 'REPORTS' && (
            <ReportsModule />
          )}

          {activeTab === 'COMPLAINTS' && (
            <ComplaintManagement />
          )}

          {activeTab === 'PROMOS' && (
            <PromoManagement />
          )}

          {activeTab === 'STAFF' && (
            <StaffManagement onRoleChanged={handleRoleChanged} />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsModule />
          )}

        </main>
      </div>

      {/* Global Modals */}

      {/* 1. POS New Transaction */}
      {isNewTxOpen && (
        <NewTransactionModal
          isOpen={isNewTxOpen}
          onClose={() => setIsNewTxOpen(false)}
          preselectedCustomer={preselectedCustomer}
          onOrderCreated={(order) => {
            setIsNewTxOpen(false);
            setReceiptOrder(order);
          }}
        />
      )}

      {/* 2. Customer Form (Add/Edit) */}
      {isCustomerFormOpen && (
        <CustomerFormModal
          isOpen={isCustomerFormOpen}
          onClose={() => setIsCustomerFormOpen(false)}
          customer={editingCustomer}
          defaultCustomerType={defaultCustomerType}
          onCustomerSaved={(c) => {
            setIsCustomerFormOpen(false);
          }}
        />
      )}

      {/* 3. Customer Detail */}
      {viewingCustomer && (
        <CustomerDetailModal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          customer={viewingCustomer}
          onNewOrder={(c) => {
            setViewingCustomer(null);
            setPreselectedCustomer(c);
            setIsNewTxOpen(true);
          }}
          onOpenQrCard={(c) => {
            setViewingCustomer(null);
            setViewingQrCustomer(c);
          }}
          onSelectOrder={(o) => {
            setViewingCustomer(null);
            setViewingOrder(o);
          }}
        />
      )}

      {/* 4. Student QR Member Card */}
      {viewingQrCustomer && (
        <StudentQrCardModal
          isOpen={!!viewingQrCustomer}
          onClose={() => setViewingQrCustomer(null)}
          customer={viewingQrCustomer}
        />
      )}

      {/* 5. Order Detail */}
      {viewingOrder && (
        <OrderDetailModal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          order={viewingOrder}
          onOpenStatusModal={(o) => {
            setViewingOrder(null);
            setStatusChangingOrder(o);
          }}
          onOpenQcModal={(o) => {
            setViewingOrder(null);
            setQcOrder(o);
          }}
          onOpenReceipt={(o) => setReceiptOrder(o)}
          onOpenBagLabel={(o) => setBagLabelOrder(o)}
          onOpenWhatsApp={(o) => setWhatsAppOrder(o)}
        />
      )}

      {/* 6. Status Workflow Modal */}
      {statusChangingOrder && (
        <StatusChangeModal
          isOpen={!!statusChangingOrder}
          onClose={() => setStatusChangingOrder(null)}
          order={statusChangingOrder}
          onStatusUpdated={() => {
            setStatusChangingOrder(null);
          }}
        />
      )}

      {/* 7. Quality Control Checklist Modal */}
      {qcOrder && (
        <QualityControlModal
          isOpen={!!qcOrder}
          onClose={() => setQcOrder(null)}
          order={qcOrder}
          onQcCompleted={() => {
            setQcOrder(null);
          }}
        />
      )}

      {/* 8. QR Code / Barcode Scanner */}
      {isScannerOpen && (
        <QrScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanResult={handleScanResult}
        />
      )}

      {/* 9. WhatsApp Generator Modal */}
      {whatsAppOrder && (
        <WhatsAppModal
          isOpen={!!whatsAppOrder}
          onClose={() => setWhatsAppOrder(null)}
          order={whatsAppOrder}
        />
      )}

      {/* 10. Thermal Receipt Print Modal */}
      {receiptOrder && (
        <ThermalReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* 11. Dormitory Bag Label Print Modal */}
      {bagLabelOrder && (
        <BagLabelModal
          isOpen={!!bagLabelOrder}
          onClose={() => setBagLabelOrder(null)}
          order={bagLabelOrder}
        />
      )}

      {/* 12. PWA Install Banner with 20s Countdown */}
      <PwaInstallBanner />

    </div>
  );
}
