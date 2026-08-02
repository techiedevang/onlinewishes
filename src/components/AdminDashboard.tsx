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

  // OTP Handlers connecting to real Nodemailer backend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setEmailStatusMessage(null);

    if (adminEmail.trim().toLowerCase() !== 'admin@onlinewishes.in') {
      setLoginError('Unauthorized Admin Email! Only admin@onlinewishes.in has master admin rights.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminEmail.trim() }),
      });
      
      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Non-JSON server response:", responseText);
        throw new Error("Server communication error. Please try again in a moment.");
      }

      if (res.ok && data.success) {
        setOtpSent(true);
        setIsWaitingForOtp(true);
        setEmailStatusMessage(data.message || 'Verification code sent to your Gmail inbox. Please check your email.');
        setOtpCountdown(60);

        const interval = setInterval(() => {
          setOtpCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setLoginError(data?.error || 'Failed to send OTP code.');
      }
    } catch (err: any) {
      console.error("Client OTP error:", err);
      const msg = err?.message || err?.toString() || '';
      setLoginError(msg ? msg : 'Failed to send verification code. Please check your network connection and try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: adminEmail.trim(), otp: userOtp.trim() }),
      });
      
      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Non-JSON server response:", responseText);
        throw new Error("Server communication error. Please try again.");
      }

      if (res.ok && data.success) {
        const adminUser: User = {
          id: 'admin-master-id',
          name: 'Master Admin',
          email: adminEmail.trim(),
          role: 'admin',
          mfaEnabled: true,
        };
        setIsAdminAuthenticated(true);
        if (onLogin) {
          onLogin(adminUser);
        }
        const newLog: SecurityLog = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          event: 'Admin Mail OTP Verified',
          severity: 'low',
          ipAddress: '127.0.0.1',
          userEmail: adminEmail.trim(),
        };
        setLogs((prev) => [newLog, ...prev]);
      } else {
        setLoginError(data.error || 'Invalid 6-Digit OTP. Please check your verification code.');
      }
    } catch (err) {
      setLoginError('Error verifying OTP code. Please try again.');
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Admin Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center space-x-2">
                <span>OnlineWishes.in Admin Console</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Live Production
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Revenue analytics, payment records, user accounts, wishes & cloud health
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Secure Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-900/50">
            <div className="max-w-md w-full bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-white">Admin Authentication</h3>
                <p className="text-sm text-slate-400">Verify your identity to access the cloud console</p>
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold text-center">
                  {loginError}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 px-1">Master Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@onlinewishes.in"
                    className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                
                {isWaitingForOtp ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 px-1">6-Digit Verification Code</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={userOtp}
                        onChange={(e) => setUserOtp(e.target.value)}
                        placeholder="Enter OTP..."
                        maxLength={6}
                        className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={isWaitingForOtp ? handleVerifyOtp : handleSendOtp}
                  disabled={isSendingOtp}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
                >
                  {isSendingOtp ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isWaitingForOtp ? 'Verify & Login' : 'Send OTP via Email'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-950 px-4 sm:px-6 pt-3 flex space-x-1 sm:space-x-2 border-b border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'custom_requests', label: 'Custom Requests', icon: Mic, badge: `${customRequests.length}` },
                { id: 'payments', label: 'Payments', icon: CreditCard, badge: `${transactions.length}` },
                { id: 'users', label: 'Users', icon: Users, badge: `${usersList.length}` },
                { id: 'wishes', label: 'Wishes', icon: Layout, badge: `${publishedWishes.length}` },
                { id: 'security', label: 'Security Logs', icon: Lock },
                { id: 'seo', label: 'SEO & Sitemap', icon: FileCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'bg-slate-900 text-white border-t-2 border-amber-500' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Total Revenue</span>
                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-3xl font-black text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{totalSuccessfulTxns} Successful Orders</p>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Active Sessions (Live)</span>
                        <Activity className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-3xl font-black text-white">{activeSessionsCount}</p>
                      <p className="text-[10px] text-slate-500 mt-1">out of {usersList.length} total users</p>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                      <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                        <span>Total Scrapbook Views</span>
                        <Eye className="w-4 h-4 text-sky-400" />
                      </div>
                      <p className="text-3xl font-black text-white">{totalViews.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-1">across {publishedWishes.length} published wishes</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4">Growth Metrics (Last 30 Days)</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={10} />
                          <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => Math.floor(val).toString()} allowDecimals={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line type="monotone" name="New Users" dataKey="newUsers" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                          <Line type="monotone" name="New Scrapbooks" dataKey="newScrapbooks" stroke="#38bdf8" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'custom_requests' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Custom Requests & Voice Notes</h4>
                      <p className="text-xs text-slate-400">Manage user submitted requests</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customRequests.map((req) => (
                      <div key={req.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-white">{req.recipientName}</h5>
                            <p className="text-xs text-slate-400">{req.whatsappNumber}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                            req.status === 'IN_PROGRESS' ? 'bg-sky-500/20 text-sky-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-800/60">
                          <p className="text-xs font-bold text-slate-300 mb-1">Occasion / Details</p>
                          <p className="text-sm text-slate-200">{req.relationship}</p>
                          {req.clientPrompt && <p className="text-xs text-slate-400 mt-2 bg-slate-900 p-2 rounded-lg">{req.clientPrompt}</p>}
                        </div>
                        {req.audioUrl && (
                          <div className="pt-3 border-t border-slate-800/60">
                            <p className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1"><Mic className="w-3 h-3" /> Voice Note Attached</p>
                            <audio controls src={req.audioUrl} className="w-full h-8" />
                          </div>
                        )}
                        <div className="pt-3 flex gap-2">
                          <button onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')} className="flex-1 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-bold rounded-lg transition-colors">Mark In-Progress</button>
                          <button onClick={() => handleUpdateStatus(req.id, 'COMPLETED')} className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-lg transition-colors">Mark Completed</button>
                        </div>
                      </div>
                    ))}
                    {customRequests.length === 0 && (
                      <div className="col-span-full p-8 text-center text-slate-500 text-sm">No custom requests found.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Total Collected</p>
                        <p className="text-xl font-bold text-emerald-400">₹{totalRevenue}</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Pending Authorization</p>
                        <p className="text-xl font-bold text-amber-400">₹{pendingRevenue}</p>
                      </div>
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Refunded Transactions</p>
                        <p className="text-xl font-bold text-rose-400">{transactions.filter(t => t.status === 'REFUNDED').length}</p>
                      </div>
                      <RefreshCcw className="w-6 h-6 text-rose-400" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <select
                      value={paymentFilterStatus}
                      onChange={(e) => setPaymentFilterStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="SUCCESS">Success Only</option>
                      <option value="PENDING">Pending Only</option>
                      <option value="REFUNDED">Refunded Only</option>
                    </select>
                  </div>

                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Template</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-mono text-amber-300">{txn.orderId}</td>
                            <td className="p-3 text-slate-200">{txn.userName}<br/><span className="text-[10px] text-slate-400">{txn.userEmail}</span></td>
                            <td className="p-3 text-slate-300">{txn.templateTitle}</td>
                            <td className="p-3 text-slate-400">{txn.paymentGateway}</td>
                            <td className="p-3 font-bold text-white">₹{txn.amount}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${txn.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : txn.status === 'REFUNDED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleResendReceipt(txn)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold flex items-center gap-1"
                                  title="Resend payment thank you receipt email"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send Email</span>
                                </button>
                                <button
                                  onClick={() => handleToggleRefundStatus(txn.id)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                                >
                                  {txn.status === 'REFUNDED' ? 'Mark Success' : 'Refund'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">Active Users & Role Management</h4>
                      <p className="text-xs text-slate-400">View registered user credentials and download reports</p>
                    </div>
                    <button 
                      onClick={handleDownloadCsv}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                  
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Last Login</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usersList.map((usr) => {
                          const lastLogin = usr.lastLoginAt ? new Date(usr.lastLoginAt) : null;
                          const isActive = lastLogin && (new Date().getTime() - lastLogin.getTime()) / (1000 * 60 * 60) < 24;
                          
                          return (
                            <tr key={usr.id} className="hover:bg-slate-900/40">
                              <td className="p-3 font-bold text-slate-200">
                                <div className="flex items-center space-x-2">
                                  <span>{usr.name}</span>
                                  {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>}
                                </div>
                              </td>
                              <td className="p-3 text-slate-400">{usr.email}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${usr.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                                  {usr.role}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">
                                {lastLogin ? lastLogin.toLocaleString() : 'Never'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleToggleUserRole(usr.id)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded"
                                >
                                  {usr.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {usersList.length === 0 && (
                          <tr><td colSpan={5} className="p-6 text-center text-slate-500">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'wishes' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {publishedWishes.map((w) => (
                    <div key={w.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full text-[10px]">{w.subdomain}.onlinewishes.in</span>
                        <span className="text-xs text-slate-400">{w.views} views</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-sm line-clamp-1">{w.title}</h5>
                        <p className="text-xs text-slate-400">For: <span className="text-slate-200">{w.recipientName}</span></p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between">
                        <a href={w.publishedUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline"><Eye className="w-3.5 h-3.5 inline mr-1" />Preview</a>
                        <button onClick={() => handleDeleteWish(w.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {publishedWishes.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 text-sm">No published wishes.</div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Event</th>
                          <th className="p-3">User</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/40">
                            <td className="p-3 text-slate-400">{log.timestamp}</td>
                            <td className="p-3 text-slate-200">{log.event}</td>
                            <td className="p-3 text-slate-300">{log.userEmail}</td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr><td colSpan={3} className="p-6 text-center text-slate-500">No logs generated yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-red-500/20 space-y-4">
                    <h4 className="text-base font-bold text-red-400">Database Reset (Start Fresh)</h4>
                    <p className="text-xs text-slate-400">Wipes all stored records from Cloud Firestore.</p>
                    {purgeSuccessMessage && <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-xl text-xs">{purgeSuccessMessage}</div>}
                    <button
                      onClick={handlePurgeAllData}
                      disabled={isPurging}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      {isPurging ? 'Purging...' : 'Wipe Cloud Database & Start Fresh'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-base font-bold text-white mb-2">Dynamic sitemap.xml</h4>
                    <pre className="p-4 bg-slate-900 rounded-xl text-xs text-amber-200/90 overflow-x-auto">{sitemapXml}</pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
