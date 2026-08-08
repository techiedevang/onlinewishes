import React, { useState, useEffect } from 'react';
import { SecurityLog, SystemMetric, User, PaymentTransaction, SavedProject, CustomWebsiteRequest } from '../types';
import { 
  Shield, Activity, RefreshCw, AlertTriangle, CheckCircle2, Server, Database, 
  GitBranch, Lock, Cpu, HardDrive, Wifi, FileCode, Search, Copy, Check, 
  CreditCard, IndianRupee, Users, Layout, Eye, Trash2, UserX,
  TrendingUp, Filter, Plus, FileText, Clock, XCircle, RefreshCcw,
  Mic, MessageSquare, Phone, ExternalLink, Globe, Volume2, Sparkles, Send,
  LogOut, X, Key, ChevronRight
} from 'lucide-react';
import { fetchCustomWebsiteRequests, updateCustomWebsiteRequestStatus } from '../lib/customRequestService';
import { db } from '../lib/firebase';
import { collection, getDocs, query, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onClose: () => void;
  onLogin?: (user: User) => void;
  onLogout?: () => void;
}

export function AdminDashboard({ currentUser, onClose, onLogin, onLogout }: AdminDashboardProps) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    currentUser?.role === 'admin'
  );
  const [adminEmail, setAdminEmail] = useState<string>('admin@onlinewishes.in');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [userOtp, setUserOtp] = useState<string>('');
  const [isWaitingForOtp, setIsWaitingForOtp] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('overview');

  const [customRequests, setCustomRequests] = useState<CustomWebsiteRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  
  useEffect(() => {
    let unsubUsers;
    let unsubScrapbooks;
    let unsubSessions;

    if (isAdminAuthenticated) {
      loadCustomRequests();
      
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const loadedUsers = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loadedUsers.push({
            id: docSnap.id,
            name: d.name || d.displayName || 'Unnamed User',
            email: d.email || '',
            role: d.role || 'user',
            mfaEnabled: d.mfaEnabled || false,
            createdAt: d.createdAt || new Date().toISOString(),
            lastLoginAt: d.lastLoginAt || d.createdAt || new Date().toISOString()
          });
        });
        setUsersList(loadedUsers.filter(u => u.email !== 'admin@onlinewishes.in'));
      }, (err) => {
        console.warn("Users onSnapshot error:", err);
      });

      unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
        // active sessions
        let count = 0;
        const now = Date.now();
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          // Assuming session is active if lastActive is within 1 hour
          if (d.lastActive) {
            const lastActiveTime = new Date(d.lastActive).getTime();
            if (now - lastActiveTime < 60 * 60 * 1000) {
              count++;
            }
          } else {
            count++; // default to counting it if no lastActive
          }
        });
        setActiveSessionsCount(count);
      }, (err) => {
        console.warn("Sessions onSnapshot error:", err);
      });

      unsubScrapbooks = onSnapshot(collection(db, 'scrapbooks'), (snapshot) => {
        const loadedWishes = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loadedWishes.push({
            id: docSnap.id,
            title: d.title || `${d.recipientName || 'Bestie'}'s Surprise Page`,
            recipientName: d.recipientName || 'Bestie',
            templateId: d.occasion || 'bestie-21',
            subdomain: d.subdomain || docSnap.id,
            publishedUrl: `https://onlinewishes.in/p/${d.subdomain || docSnap.id}`,
            createdAt: d.createdAt ? d.createdAt.substring(0, 16).replace('T', ' ') : new Date().toISOString().substring(0, 10),
            status: 'published',
            views: d.views || 0,
          });
        });
        setPublishedWishes(loadedWishes);
      }, (err) => {
        console.warn("Scrapbooks onSnapshot error:", err);
      });

      // Keep payments as getDocs for now or also make it onSnapshot
      getDocs(collection(db, 'payments')).then(paymentsSnap => {
        const loadedTxns = [];
        paymentsSnap.forEach((docSnap) => {
          const d = docSnap.data();
          loadedTxns.push({
            id: docSnap.id,
            orderId: d.orderId || docSnap.id,
            userEmail: d.userEmail || '',
            userName: d.userName || 'Anonymous',
            amount: d.amount || 199,
            currency: d.currency || 'INR',
            templateTitle: d.templateTitle || 'Surprise Website License',
            paymentGateway: d.paymentGateway || 'Razorpay UPI',
            status: d.status || 'SUCCESS',
            createdAt: d.createdAt ? d.createdAt.replace('T', ' ').substring(0, 19) : new Date().toISOString().substring(0, 10),
            receiptUrl: d.receiptUrl || '#',
          });
        });
        setTransactions(loadedTxns);
      });
    }

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubScrapbooks) unsubScrapbooks();
      if (unsubSessions) unsubSessions();
    };
  }, [isAdminAuthenticated]);


  
  const loadCustomRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const list = await fetchCustomWebsiteRequests();
      setCustomRequests(list);
    } catch (err) {
      console.error('Failed to fetch custom requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: CustomWebsiteRequest['status']) => {
    try {
      await updateCustomWebsiteRequestStatus(id, newStatus);
      setCustomRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err) {
      console.error('Failed to update request status:', err);
      alert('Could not update request status.');
    }
  };

  const [copiedSitemap, setCopiedSitemap] = useState(false);

  // Search & Filter States for Payments
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<string>('ALL');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // New Payment Form state
  const [newOrderEmail, setNewOrderEmail] = useState('');
  const [newOrderName, setNewOrderName] = useState('');
  const [newOrderAmount, setNewOrderAmount] = useState('299');
  const [newOrderTemplate, setNewOrderTemplate] = useState('Box of 21 Wishes Premium');
  const [newOrderGateway, setNewOrderGateway] = useState<'Razorpay UPI' | 'PhonePe QR' | 'Credit/Debit Card' | 'NetBanking' | 'Google Pay'>('Razorpay UPI');

  // Initial Real-time/Cloud states instead of fake data
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [activeSessionsCount, setActiveSessionsCount] = useState<number>(0);
  const [publishedWishes, setPublishedWishes] = useState<SavedProject[]>([]);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://onlinewishes.in/</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://onlinewishes.in/#templates</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://onlinewishes.in/#customizer</loc>
    <lastmod>2026-07-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  const handleCopySitemap = () => {
    navigator.clipboard?.writeText(sitemapXml);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  const [logs, setLogs] = useState<SecurityLog[]>([]);

  

  
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccessMessage, setPurgeSuccessMessage] = useState<string | null>(null);

  const handlePurgeAllData = async () => {
    const confirm1 = window.confirm("WARNING: You are about to DELETE ALL DATABASE RECORDS from this application (Users, Scrapbooks, Payments, Custom Requests, Images). This is irreversible. Do you want to proceed?");
    if (!confirm1) return;

    const confirm2 = window.confirm("FINAL CONFIRMATION: Type OK to completely clear the Firestore database and start fresh.");
    if (!confirm2) return;

    setIsPurging(true);
    setPurgeSuccessMessage(null);

    try {
      const collections = ['users', 'scrapbooks', 'payments', 'projects', 'custom_requests', 'uploaded_images'];
      let totalDeleted = 0;

      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        if (!snap.empty) {
          const promises = snap.docs.map(docSnap => deleteDoc(doc(db, colName, docSnap.id)));
          await Promise.all(promises);
          totalDeleted += snap.size;
        }
      }

      setPurgeSuccessMessage(`SUCCESS: Cleared all old database data! Deleted ${totalDeleted} records across collections. You now have a 100% fresh, empty database!`);
      
      // Instantly clear client states
      setTransactions([]);
      setUsersList([]);
      setPublishedWishes([]);
      setCustomRequests([]);
      
      
      const nowStr = new Date().toISOString().substring(0, 19).replace('T', ' ');
      
      
      

    } catch (err: any) {
      console.error("Failed to purge database:", err);
      alert("Error purging database: " + err.message);
    } finally {
      setIsPurging(false);
    }
  };

  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);

  // Direct Master Passwords for quick emergency access
  const MASTER_ADMIN_PASSWORDS = [
    'admin123', 'admin@123', 'admin', 'devu16', 'onlinewishes', 
    'onlinewishes@2025', 'devuadmin@123', 'codelearnpoint', 
    'onlinewishesadmin', 'itsmedevu16'
  ];

  // Admin Login Handler - verifies OTP or Master Password via backend
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setEmailStatusMessage(null);

    const emailToUse = adminEmail.trim().toLowerCase() || 'admin@onlinewishes.in';
    const passOrOtp = userOtp.trim();

    if (!passOrOtp) {
      setLoginError('Please enter your 6-digit OTP code or Admin Password.');
      return;
    }

    // Direct Instant Master Pass Check for quick admin convenience
    const passLower = passOrOtp.toLowerCase();
    if (MASTER_ADMIN_PASSWORDS.includes(passLower)) {
      const adminUser: User = {
        id: 'admin-master-id',
        name: 'Master Admin',
        email: emailToUse,
        role: 'admin',
        mfaEnabled: true,
      };
      setIsAdminAuthenticated(true);
      if (onLogin) onLogin(adminUser);
      const newLog: SecurityLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        event: 'Admin Console Authenticated (Master Pass)',
        severity: 'low',
        userEmail: emailToUse,
      };
      setLogs((prev) => [newLog, ...prev]);
      return;
    }

    // Otherwise, verify OTP against backend & Firestore
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: emailToUse, password: passOrOtp, otp: passOrOtp }),
      }).catch(() => null);
      
      let data: any = {};
      if (res) {
        const responseText = await res.text().catch(() => '');
        try {
          data = JSON.parse(responseText);
        } catch {
          // non-json
        }
      }

      if (res && res.ok && data.success) {
        const adminUser: User = {
          id: 'admin-master-id',
          name: 'Master Admin',
          email: emailToUse,
          role: 'admin',
          mfaEnabled: true,
        };
        setIsAdminAuthenticated(true);
        if (onLogin) onLogin(adminUser);

        const newLog: SecurityLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          event: 'Admin Console Authenticated (OTP Verified)',
          severity: 'low',
          userEmail: emailToUse,
        };
        setLogs((prev) => [newLog, ...prev]);
      } else {
        setLoginError(data?.error || 'Incorrect OTP code. Please enter the valid 6-digit OTP sent to your email.');
      }
    } catch (err: any) {
      console.error("Admin OTP verify error:", err);
      setLoginError('Error verifying OTP with server. Try master password "admin123" or "devu16".');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendOtpOnly = async () => {
    setLoginError(null);
    setEmailStatusMessage(null);

    const emailToUse = adminEmail.trim().toLowerCase() || 'admin@onlinewishes.in';
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: emailToUse }),
      }).catch(() => null);
      
      let data: any = {};
      if (res) {
        data = await res.json().catch(() => ({}));
      }

      if (data && data.success === false) {
        setLoginError(data.error || 'Failed to send OTP email.');
      } else if (data && data.message) {
        setEmailStatusMessage(data.message);
      } else {
        setEmailStatusMessage('OTP code sent! Please check your email inbox or spam folder.');
      }
    } catch (err: any) {
      setLoginError('OTP process error. You can also use Admin Password "admin123" or "devu16".');
    } finally {
      setIsSendingOtp(false);
    }
  };

  
  const handleResendReceipt = async (txn: PaymentTransaction) => {
    if (!txn.userEmail) {
      alert("No email address for this transaction.");
      return;
    }
    try {
      const res = await fetch('/api/send-payment-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: txn.userEmail,
          name: txn.userName,
          paymentId: txn.id,
          orderId: txn.orderId,
          amount: txn.amount,
          templateTitle: txn.templateTitle,
          websiteUrl: 'https://onlinewishes.in'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Receipt email sent successfully to ${txn.userEmail} from support@onlinewishes.in!`);
      } else {
        alert(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error sending receipt: ${err.message}`);
    }
  };

  const handleToggleRefundStatus = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txnId
          ? { ...t, status: t.status === 'REFUNDED' ? 'SUCCESS' : 'REFUNDED' }
          : t
      )
    );
  };

  const handleCreateManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderEmail.trim() || !newOrderName.trim()) return;

    const newTxn: PaymentTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userEmail: newOrderEmail.trim(),
      userName: newOrderName.trim(),
      amount: parseInt(newOrderAmount) || 299,
      currency: 'INR',
      templateTitle: newOrderTemplate,
      paymentGateway: newOrderGateway,
      status: 'SUCCESS',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      receiptUrl: '#manual-receipt',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setShowAddPaymentModal(false);
    setNewOrderEmail('');
    setNewOrderName('');
  };

  const handleToggleUserRole = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
          : u
      )
    );
  };

  const handleDeleteWish = (wishId: string) => {
    setPublishedWishes((prev) => prev.filter((w) => w.id !== wishId));
  };

  // Filtered payments
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.userEmail.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.orderId.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesStatus =
      paymentFilterStatus === 'ALL' || t.status === paymentFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate revenue stats
  const totalRevenue = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingRevenue = transactions
    .filter((t) => t.status === 'PENDING')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSuccessfulTxns = transactions.filter((t) => t.status === 'SUCCESS').length;

  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    // Group users by date
    const usersByDate = {};
    usersList.forEach(u => {
      if (u.createdAt) {
        const d = new Date(u.createdAt).toISOString().split('T')[0];
        usersByDate[d] = (usersByDate[d] || 0) + 1;
      }
    });

    // Group scrapbooks by date
    const scrapbooksByDate = {};
    publishedWishes.forEach(w => {
      if (w.createdAt) {
        const d = new Date(w.createdAt).toISOString().split('T')[0];
        scrapbooksByDate[d] = (scrapbooksByDate[d] || 0) + 1;
      }
    });

    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDate = dateStr.substring(5); // MM-DD
      
      data.push({
        date: shortDate,
        fullDate: dateStr,
        newUsers: usersByDate[dateStr] || 0,
        newScrapbooks: scrapbooksByDate[dateStr] || 0
      });
    }
    return data;
  };

  const chartData = getChartData();
  const totalViews = publishedWishes.reduce((acc, w) => acc + (w.views || 0), 0);
  // activeSessions removed in favor of firestore sessions collection

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Created At', 'Last Login'];
    const rows = usersList.map(u => [
      u.id, 
      `"${u.name.replace(/"/g, '""')}"`, 
      u.email, 
      u.role, 
      u.createdAt || 'N/A',
      u.lastLoginAt || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex overflow-hidden font-sans">
      {!isAdminAuthenticated ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-xl space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-gray-900">Admin Console</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-sm text-gray-500">Sign in to manage the platform</p>
            {loginError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">{loginError}</div>}
            {emailStatusMessage && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-200">{emailStatusMessage}</div>}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@onlinewishes.in"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">Password / OTP</label>
                  <button type="button" onClick={handleSendOtpOnly} disabled={isSendingOtp} className="text-xs text-blue-600 hover:underline">
                    {isSendingOtp ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                <div className="relative">
                  <Key className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={userOtp}
                    onChange={(e) => setUserOtp(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                {isSendingOtp ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Admin Console</span>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: Layout },
                { id: 'custom_requests', label: 'Custom Requests', icon: MessageSquare, badge: customRequests.length },
                { id: 'payments', label: 'Transactions', icon: CreditCard, badge: transactions.length },
                { id: 'users', label: 'Users', icon: Users, badge: usersList.length },
                { id: 'wishes', label: 'Projects', icon: FileCode, badge: publishedWishes.length },
                { id: 'security', label: 'Security Logs', icon: Lock },
                { id: 'seo', label: 'SEO Settings', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => { setIsAdminAuthenticated(false); if (onClose) onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-800 capitalize">
                {activeTab.replace('_', ' ')}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Live Production Environment</span>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                      <h3 className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> {totalSuccessfulTxns} Orders</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                      <h3 className="text-3xl font-bold text-gray-900">{usersList.length}</h3>
                      <p className="text-sm text-blue-600 mt-2 flex items-center gap-1"><Activity className="w-4 h-4" /> {activeSessionsCount} currently online</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-500 mb-1">Published Projects</p>
                      <h3 className="text-3xl font-bold text-gray-900">{publishedWishes.length}</h3>
                      <p className="text-sm text-purple-600 mt-2 flex items-center gap-1"><Eye className="w-4 h-4" /> {totalViews.toLocaleString()} total views</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth (30 Days)</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickMargin={10} />
                          <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => Math.floor(val).toString()} allowDecimals={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend />
                          <Line type="monotone" name="New Users" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" name="New Projects" dataKey="newScrapbooks" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom_requests' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Custom Website Requests</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {customRequests.map((req) => (
                      <div key={req.id} className="p-6 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{req.recipientName}</h4>
                            <p className="text-sm text-gray-500 font-medium">{req.whatsappNumber}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-700"><strong>Relationship:</strong> {req.relationship}</p>
                          {req.clientPrompt && <p className="text-sm text-gray-600 mt-2 bg-gray-100 p-3 rounded-lg">{req.clientPrompt}</p>}
                        </div>
                        {req.audioUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2"><Mic className="w-4 h-4 text-blue-500" /> Voice Note</p>
                            <audio controls src={req.audioUrl} className="w-full max-w-md h-10" />
                          </div>
                        )}
                        <div className="mt-4 flex gap-3">
                          <button onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Mark In-Progress</button>
                          <button onClick={() => handleUpdateStatus(req.id, 'COMPLETED')} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Mark Completed</button>
                        </div>
                      </div>
                    ))}
                    {customRequests.length === 0 && (
                      <div className="p-8 text-center text-gray-500">No requests found.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative max-w-md w-full">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={paymentFilterStatus}
                      onChange={(e) => setPaymentFilterStatus(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SUCCESS">Success</option>
                      <option value="PENDING">Pending</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{txn.orderId}</div>
                              <div className="text-sm text-gray-500">{txn.templateTitle}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{txn.userName}</div>
                              <div className="text-sm text-gray-500">{txn.userEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">₹{txn.amount}</div>
                              <div className="text-xs text-gray-500">{txn.paymentGateway}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : txn.status === 'REFUNDED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleResendReceipt(txn)} className="text-blue-600 hover:text-blue-900 mr-4">Receipt</button>
                              <button onClick={() => handleToggleRefundStatus(txn.id)} className="text-red-600 hover:text-red-900">
                                {txn.status === 'REFUNDED' ? 'Undo' : 'Refund'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button onClick={handleDownloadCsv} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-4 h-4 text-gray-500" /> Export CSV
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersList.map((usr) => (
                          <tr key={usr.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{usr.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usr.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usr.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                {usr.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => handleToggleUserRole(usr.id)} className="text-blue-600 hover:text-blue-900">
                                {usr.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'wishes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedWishes.map((w) => (
                    <div key={w.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                          {w.subdomain}.onlinewishes.in
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{w.views} views</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{w.title}</h4>
                      <p className="text-sm text-gray-500 mb-4">Recipient: {w.recipientName}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <a href={w.publishedUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" /> Open
                        </a>
                        <button onClick={() => handleDeleteWish(w.id)} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {publishedWishes.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">No projects published yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.event}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userEmail}</td>
                          </tr>
                        ))}
                        {logs.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No recent security events.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                    <h4 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-4">Wipe the entire database. This action cannot be undone.</p>
                    {purgeSuccessMessage && <div className="mb-4 bg-green-100 text-green-800 p-3 rounded-md text-sm">{purgeSuccessMessage}</div>}
                    <button onClick={handlePurgeAllData} disabled={isPurging} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">
                      {isPurging ? 'Purging Database...' : 'Wipe Database'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Sitemap Configuration</h4>
                  <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 overflow-x-auto">
                    {sitemapXml}
                  </pre>
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
