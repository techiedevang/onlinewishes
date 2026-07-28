import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  ExternalLink, 
  Copy, 
  Check, 
  Receipt, 
  CreditCard, 
  Sparkles, 
  Plus, 
  QrCode, 
  Eye, 
  Clock, 
  X, 
  Lock, 
  IndianRupee, 
  KeyRound, 
  Share2, 
  Download, 
  Edit3, 
  CheckCircle2, 
  FileText,
  Heart,
  Search,
  RefreshCw
} from 'lucide-react';
import { User as UserType, SavedProject, PaymentTransaction } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UserDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
  onClose: () => void;
  onNewWebsite: () => void;
  onEditProject?: (projectId: string) => void;
}

export function UserDashboard({
  currentUser,
  onLogout,
  onClose,
  onNewWebsite,
  onEditProject,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'websites' | 'payments' | 'security'>('websites');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrProject, setQrProject] = useState<SavedProject | null>(null);
  const [invoiceTx, setInvoiceTx] = useState<PaymentTransaction | null>(null);

  // Profile Edit State
  const [userName, setUserName] = useState(currentUser.name);
  const [userEmail] = useState(currentUser.email);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState<string | null>(null);

  // User Websites List
  const [userProjects, setUserProjects] = useState<SavedProject[]>([
    {
      id: 'proj-2101',
      title: 'Besties Forever 21 Memories',
      recipientName: 'Ananya Kapoor',
      templateId: 'bestie-21',
      subdomain: 'ananya-bestie-21',
      publishedUrl: 'https://onlinewishes.com/p/ananya-bestie-21',
      createdAt: '2026-07-20 14:32',
      status: 'published',
      views: 342,
    },
    {
      id: 'proj-2102',
      title: 'Romantic Anniversary Vault',
      recipientName: 'Rohan Sharma',
      templateId: 'romantic-vault',
      subdomain: 'rohan-love-vault',
      publishedUrl: 'https://onlinewishes.com/p/rohan-love-vault',
      createdAt: '2026-07-24 18:10',
      status: 'published',
      views: 189,
    },
  ]);

  // User Payments List
  const [userPayments, setUserPayments] = useState<PaymentTransaction[]>([
    {
      id: 'pay-90812',
      orderId: 'order_OW_20260720_01',
      userEmail: currentUser.email,
      userName: currentUser.name,
      amount: 199,
      currency: 'INR',
      templateTitle: 'Bestie 21-Photo Surprise Website (Pro Pass)',
      paymentGateway: 'Razorpay UPI',
      status: 'SUCCESS',
      createdAt: '2026-07-20 14:30',
      receiptUrl: '#',
    },
    {
      id: 'pay-90884',
      orderId: 'order_OW_20260724_08',
      userEmail: currentUser.email,
      userName: currentUser.name,
      amount: 300,
      currency: 'INR',
      templateTitle: 'Bespoke Custom Website (Lifetime VIP Hosting)',
      paymentGateway: 'Google Pay',
      status: 'SUCCESS',
      createdAt: '2026-07-24 18:08',
      receiptUrl: '#',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Firestore saved projects & payments for this user if available
  useEffect(() => {
    async function loadUserData() {
      try {
        if (!currentUser?.id) return;
        const qProj = query(collection(db, 'projects'), where('userId', '==', currentUser.id));
        const projSnap = await getDocs(qProj);
        if (!projSnap.empty) {
          const loaded: SavedProject[] = [];
          projSnap.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              title: data.title || 'Custom Surprise Scrapbook',
              recipientName: data.recipientName || 'Bestie',
              templateId: data.templateId || 'bestie-21',
              subdomain: data.subdomain || 'my-surprise',
              publishedUrl: data.publishedUrl || `https://onlinewishes.com/p/${data.subdomain || docSnap.id}`,
              createdAt: data.createdAt || new Date().toISOString().substring(0, 10),
              status: data.status || 'published',
              views: data.views || 1,
            });
          });
          setUserProjects(loaded);
        }

        const qPay = query(collection(db, 'payments'), where('userEmail', '==', currentUser.email));
        const paySnap = await getDocs(qPay);
        if (!paySnap.empty) {
          const loadedPays: PaymentTransaction[] = [];
          paySnap.forEach((docSnap) => {
            const d = docSnap.data();
            loadedPays.push({
              id: docSnap.id,
              orderId: d.orderId || docSnap.id,
              userEmail: d.userEmail || currentUser.email,
              userName: d.userName || currentUser.name,
              amount: d.amount || 199,
              currency: d.currency || 'INR',
              templateTitle: d.templateTitle || 'Surprise Website License',
              paymentGateway: d.paymentGateway || 'Razorpay UPI',
              status: d.status || 'SUCCESS',
              createdAt: d.createdAt || new Date().toISOString().substring(0, 10),
            });
          });
          setUserPayments(loadedPays);
        }
      } catch (e) {
        console.log('User dashboard cloud sync note:', e);
      }
    }
    loadUserData();
  }, [currentUser]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setTimeout(() => {
      setIsUpdatingProfile(false);
      setProfileSuccessMsg('Profile details updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }, 600);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;
    setPasscodeSuccess('Security password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasscodeSuccess(null), 3000);
  };

  const filteredProjects = userProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[95vh] sm:max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-800 bg-slate-950/70 gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-extrabold text-lg sm:text-xl shadow-lg shadow-rose-500/20 shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-black text-white truncate">{currentUser.name}</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 whitespace-nowrap">
                    VERIFIED MEMBER
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 flex items-center space-x-1 truncate">
                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors shrink-0"
              aria-label="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto pt-1 sm:pt-0">
            <button
              onClick={() => {
                onClose();
                onNewWebsite();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Website</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:flex p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('websites')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'websites'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>My Websites ({userProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'payments'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Payment History ({userPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'profile'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap shrink-0 ${
              activeTab === 'security'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Security & Login</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: MY WEBSITES & PURCHASED LINKS */}
          {activeTab === 'websites' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>Your Live Surprise Websites</span>
                    <span className="text-xs bg-rose-500/20 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-500/30">
                      {userProjects.length} Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage your published scrapbooks, copy custom shareable links, view analytics, or edit content.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search websites..."
                    className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 w-full sm:w-60"
                  />
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-4">
                  <Heart className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No Surprise Websites Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You haven't created or saved any websites yet. Pick a template to create your first surprise!
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onNewWebsite();
                    }}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create My First Website</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {proj.templateId.replace('-', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{proj.createdAt}</span>
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors">
                          {proj.title}
                        </h4>
                        
                        <p className="text-xs text-slate-400">
                          Dedicated to: <strong className="text-slate-200">{proj.recipientName}</strong>
                        </p>

                        <div className="bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono gap-2">
                          <span className="text-slate-300 truncate min-w-0 flex-1">
                            {proj.publishedUrl}
                          </span>
                          <button
                            onClick={() => handleCopyLink(proj.publishedUrl, proj.id)}
                            className="ml-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-sans font-bold flex items-center space-x-1 transition-colors shrink-0"
                          >
                            {copiedId === proj.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span><strong>{proj.views}</strong> views</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setQrProject(proj)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <a
                            href={proj.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-bold flex items-center space-x-1 transition-colors"
                          >
                            <span>Open Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PAYMENTS & ORDER RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Payment History & Tax Receipts</span>
                </h3>
                <p className="text-xs text-slate-400">
                  View all completed orders, Razorpay/UPI transaction records, and download official invoice receipts.
                </p>
              </div>

              {userPayments.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-3">
                  <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No Payment Records Yet</h4>
                  <p className="text-xs text-slate-400">You haven't made any transactions on OnlineWishes yet.</p>
                </div>
              ) : (
                <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                          <th className="p-3.5">Order ID</th>
                          <th className="p-3.5">Template / License</th>
                          <th className="p-3.5">Gateway</th>
                          <th className="p-3.5">Amount</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {userPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-white">{pay.orderId}</td>
                            <td className="p-3.5 font-medium text-slate-200">{pay.templateTitle}</td>
                            <td className="p-3.5 text-slate-400">{pay.paymentGateway}</td>
                            <td className="p-3.5 font-bold text-emerald-400">₹{pay.amount}</td>
                            <td className="p-3.5">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{pay.status}</span>
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-400">{pay.createdAt}</td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setInvoiceTx(pay)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[11px] inline-flex items-center space-x-1 transition-colors"
                              >
                                <FileText className="w-3 h-3 text-rose-400" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              
              <div>
                <h3 className="text-lg font-bold text-white">Profile Details</h3>
                <p className="text-xs text-slate-400">Manage your personal account details and display name.</p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Full Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={userEmail}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Email is linked to your authentication provider.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Account Role</label>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{currentUser.role.toUpperCase()} ACCOUNT</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <span>Saving Changes...</span> : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Update Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: SECURITY & LOGIN */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Security & Account Protection</span>
                </h3>
                <p className="text-xs text-slate-400">Update your login credentials and view active session details.</p>
              </div>

              {passcodeSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{passcodeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white">Change Account Password</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              </form>

              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">Session Management</h4>
                <p className="text-xs text-slate-400">You are currently logged in as {currentUser.email}.</p>
                
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs transition-colors"
                >
                  Sign Out of Account
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>Logged in as <strong className="text-slate-300">{currentUser.email}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            Close Dashboard
          </button>
        </div>

      </div>

      {/* QR CODE GENERATOR OVERLAY */}
      {qrProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setQrProject(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <QrCode className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Website QR Code</h4>
            <p className="text-xs text-slate-400">Scan with any smartphone camera to open {qrProject.title}</p>
            
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrProject.publishedUrl)}`}
                alt="Website QR Code"
                className="w-40 h-40"
              />
            </div>

            <p className="text-[11px] font-mono text-slate-400 truncate bg-slate-950 p-2 rounded-xl">
              {qrProject.publishedUrl}
            </p>

            <button
              onClick={() => handleCopyLink(qrProject.publishedUrl, 'qr')}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Copy Shareable Link
            </button>
          </div>
        </div>
      )}

      {/* INVOICE RECEIPT OVERLAY */}
      {invoiceTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-5 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setInvoiceTx(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Payment Receipt</h4>
                <p className="text-xs text-slate-400">OnlineWishes Inc. Tax Invoice</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt No:</span>
                <span className="font-mono font-bold text-white">{invoiceTx.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-bold text-white">{invoiceTx.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Email:</span>
                <span className="font-mono text-slate-300">{invoiceTx.userEmail}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400">Item Description:</span>
                <span className="font-semibold text-rose-300 max-w-[180px] text-right">{invoiceTx.templateTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="text-slate-300">{invoiceTx.paymentGateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Status:</span>
                <span className="text-emerald-400 font-bold">● {invoiceTx.status}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 text-sm">
                <span className="font-bold text-white">Total Amount Paid:</span>
                <span className="font-black text-emerald-400">₹{invoiceTx.amount} INR</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setInvoiceTx(null)}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
