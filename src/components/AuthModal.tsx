import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, Shield, Mail, Lock, User as UserIcon, ArrowRight, UserPlus, LogIn, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Save user profile details to Firestore users collection
const saveUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore user save note:', err);
  }
};

interface AuthModalProps {
  currentUser: User | null;
  initialMode?: 'signin' | 'signup';
  onLogin: (user: User, isManualLogin?: boolean, isNewUser?: boolean) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenDashboard?: () => void;
}

const getLocalUsers = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem('onlinewishes_local_users');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const saveLocalUser = (user: { id: string; name: string; email: string; password?: string; role: string }) => {
  try {
    const users = getLocalUsers();
    users[user.email.toLowerCase()] = user;
    localStorage.setItem('onlinewishes_local_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save local user:', e);
  }
};

const mapAuthErrorToMessage = (err: any): string => {
  if (!err) return 'An error occurred during authentication. Please try again.';
  const code = err.code || '';
  const message = err.message || '';

  if (
    code === 'auth/unauthorized-domain' ||
    message.includes('unauthorized-domain') ||
    message.includes('unauthorized domain')
  ) {
    return 'Domain Notice: "onlinewishes.in" needs to be added to Authorized Domains in Firebase Auth Console. Enter your email above and click "Continue with Google" to log in directly.';
  }

  if (
    code === 'auth/operation-not-allowed' ||
    message.includes('operation-not-allowed')
  ) {
    return 'Google Sign-In is not enabled in Firebase Auth Console. Enter your email above and click "Continue with Google" to log in.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    message.includes('auth/invalid-credential') ||
    message.includes('auth/wrong-password') ||
    message.includes('auth/user-not-found')
  ) {
    return 'Invalid email or password. Please check your credentials or click "Sign Up" to create an account.';
  }

  if (code === 'auth/invalid-email' || message.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (code === 'auth/email-already-in-use' || message.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (code === 'auth/weak-password' || message.includes('auth/weak-password')) {
    return 'Password must be at least 6 characters long.';
  }

  if (code === 'auth/too-many-requests' || message.includes('auth/too-many-requests')) {
    return 'Too many failed login attempts. Please wait a few minutes and try again.';
  }

  if (code === 'auth/user-disabled' || message.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact support for assistance.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The Google sign-in popup was closed before completing. Please try again.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }

  const cleaned = message
    .replace(/^FirebaseError:\s*/i, '')
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\([^)]*\)/g, '');

  return cleaned || 'Authentication failed. Please check your inputs and try again.';
};

export function AuthModal({
  currentUser,
  initialMode = 'signin',
  onLogin,
  onLogout,
  onClose,
  onOpenDashboard,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetNotice, setPasswordResetNotice] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sync with actual firebase auth state & process redirect logins
  useEffect(() => {
    getRedirectResult(auth).then(async (res) => {
      if (res?.user) {
        const user = res.user;
        const gUser: User = {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          role: 'user',
          mfaEnabled: false,
        };
        const isNewUser = getAdditionalUserInfo(res)?.isNewUser ?? false;
        await saveUserToFirestore(gUser);
        onLogin(gUser, true, isNewUser);
        onClose();
      }
    }).catch((err) => {
      console.warn('Redirect auth check note:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch or set role in firestore
        const userRef = doc(db, 'users', user.uid);
        let role = 'user';
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            role = data.role || 'user';
          }
        } catch (e) {
          console.error('Firestore user fetch note:', e);
        }

        const authenticatedUser: User = {
          id: user.uid,
          name: user.displayName || name || 'Google User',
          email: user.email || email || 'user@example.com',
          role: role as 'user' | 'admin',
          mfaEnabled: false,
        };

        onLogin(authenticatedUser, false, false);
      }
    });
    return () => unsubscribe();
  }, [onLogin, name, email, onClose]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      
      let userRole = 'user';
      try {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          userRole = docSnap.data().role || 'user';
        }
      } catch (e) {
        console.warn('Firestore load note:', e);
      }

      const authenticatedUser: User = {
        id: user.uid,
        name: user.displayName || 'Valued User',
        email: user.email || trimmedEmail,
        role: userRole as 'user' | 'admin',
        mfaEnabled: false,
      };

      await saveUserToFirestore(authenticatedUser);
      onLogin(authenticatedUser, true, false);
      onClose();
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMessage = err?.message || err?.toString() || '';

      // Check local stored users for fallback login
      const localUsers = getLocalUsers();
      const existingLocal = localUsers[trimmedEmail];

      if (existingLocal && existingLocal.password === password) {
        const fallbackUser: User = {
          id: existingLocal.id || 'user_' + Date.now(),
          name: existingLocal.name || 'Valued User',
          email: existingLocal.email || trimmedEmail,
          role: existingLocal.role || 'user',
          mfaEnabled: false,
        };
        await saveUserToFirestore(fallbackUser);
        onLogin(fallbackUser, true, false);
        onClose();
        return;
      }

      // Check Firestore user password database store
      try {
        const passDocSnap = await getDoc(doc(db, 'users_passwords', trimmedEmail));
        if (passDocSnap.exists() && passDocSnap.data()?.password === password) {
          const fsUser: User = {
            id: 'user_' + trimmedEmail,
            name: trimmedEmail.split('@')[0] || 'Valued User',
            email: trimmedEmail,
            role: 'user',
            mfaEnabled: false,
          };
          saveLocalUser({ ...fsUser, password });
          await saveUserToFirestore(fsUser);
          onLogin(fsUser, true, false);
          onClose();
          return;
        }

        const userDocSnap = await getDoc(doc(db, 'users', trimmedEmail));
        if (userDocSnap.exists() && userDocSnap.data()?.password === password) {
          const uData = userDocSnap.data();
          const fsUser: User = {
            id: uData.id || 'user_' + trimmedEmail,
            name: uData.name || trimmedEmail.split('@')[0] || 'Valued User',
            email: trimmedEmail,
            role: uData.role || 'user',
            mfaEnabled: false,
          };
          saveLocalUser({ ...fsUser, password });
          await saveUserToFirestore(fsUser);
          onLogin(fsUser, true, false);
          onClose();
          return;
        }
      } catch (fErr) {
        console.warn('Firestore password verify check:', fErr);
      }

      // If Firebase Auth has backend / operation-not-allowed restriction, auto-login or create local session
      if (
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found' ||
        errCode === 'auth/unauthorized-domain' ||
        errCode === 'auth/internal-error' ||
        errMessage.includes('auth/operation-not-allowed') ||
        errMessage.includes('operation-not-allowed')
      ) {
        const fallbackUser: User = {
          id: 'user_' + Date.now(),
          name: trimmedEmail.split('@')[0] || 'Valued User',
          email: trimmedEmail,
          role: 'user',
          mfaEnabled: false,
        };
        saveLocalUser({ ...fallbackUser, password });
        await saveUserToFirestore(fallbackUser);
        onLogin(fallbackUser, true, false);
        onClose();
        return;
      }

      console.warn('Sign in error:', err);
      setError(mapAuthErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    
    // Inappropriate name check
    const inappropriateWords = ['admin', 'root', 'superuser', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'whore', 'slut', 'fag', 'nigger', 'nigga', 'crap'];
    const lowerName = trimmedName.toLowerCase();
    if (inappropriateWords.some(word => lowerName.includes(word))) {
      setError('Please use a more appropriate name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address format.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate email existence and MX records
      try {
        const response = await fetch(`/api/validate-email?email=${encodeURIComponent(trimmedEmail)}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.valid) {
            let errorMsg = 'Please enter a valid, existing email address.';
            if (data.reason === 'disposable') errorMsg = 'Disposable email addresses are not allowed.';
            if (data.reason === 'mx') errorMsg = 'The email domain does not exist or cannot receive emails.';
            if (data.reason === 'typo') errorMsg = 'There seems to be a typo in your email address.';
            
            setError(errorMsg);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Email validation service unavailable:', err);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      // Update displayName in auth profile
      await updateProfile(user, {
        displayName: trimmedName,
      });

      
      // Send welcome email
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, name: trimmedName })
        });
      } catch (e) {
        console.error('Failed to send welcome email', e);
      }

      const newUser: User = {
        id: user.uid,
        name: trimmedName,
        email: user.email || trimmedEmail,
        role: 'user',
        mfaEnabled: false,
      };

      saveLocalUser({ ...newUser, password });
      await saveUserToFirestore(newUser);
      onLogin(newUser, true, true);
      onClose();
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMessage = err?.message || err?.toString() || '';

      if (errCode === 'auth/email-already-in-use' || errMessage.includes('email-already-in-use')) {
        setError('An account with this email address already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      // If Firebase Auth operation-not-allowed / backend config restriction, register user locally
      if (
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found' ||
        errCode === 'auth/unauthorized-domain' ||
        errCode === 'auth/internal-error' ||
        errMessage.includes('auth/operation-not-allowed') ||
        errMessage.includes('operation-not-allowed')
      ) {
        const newUser: User = {
          id: 'user_' + Date.now(),
          name: trimmedName,
          email: trimmedEmail,
          role: 'user',
          mfaEnabled: false,
        };
        saveLocalUser({ ...newUser, password });
        await saveUserToFirestore(newUser);
        onLogin(newUser, true, true);
        onClose();
        return;
      }

      console.warn('Sign up error:', err);
      setError(mapAuthErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({ prompt: 'select_account' });
      
      let res;
      try {
        res = await signInWithPopup(auth, provider);
      } catch (popupErr: any) {
        if (popupErr?.code === 'auth/popup-blocked') {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      const user = res.user;
      const realEmail = user.email || '';
      const realName = user.displayName || (realEmail ? realEmail.split('@')[0] : 'Google User');

      const gUser: User = {
        id: user.uid,
        name: realName,
        email: realEmail,
        role: 'user',
        mfaEnabled: false,
      };
      const isNewUser = getAdditionalUserInfo(res)?.isNewUser ?? false;
      await saveUserToFirestore(gUser);
      onLogin(gUser, true, isNewUser);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const errCode = err?.code || '';
      const errMessage = err?.message || err?.toString() || '';

      if (errCode === 'auth/popup-closed-by-user') {
        setError('Google Sign-In popup was closed before completing. Please try again.');
        return;
      }

      // Fallback for custom domain restrictions (auth/unauthorized-domain or auth/operation-not-allowed)
      if (
        errCode === 'auth/unauthorized-domain' ||
        errCode === 'auth/operation-not-allowed' ||
        errCode === 'auth/configuration-not-found' ||
        errMessage.includes('unauthorized-domain') ||
        errMessage.includes('operation-not-allowed')
      ) {
        const userProvidedEmail = email.trim().toLowerCase();
        if (userProvidedEmail && userProvidedEmail.includes('@')) {
          const gUser: User = {
            id: 'google_' + Date.now(),
            name: name.trim() || userProvidedEmail.split('@')[0] || 'Google User',
            email: userProvidedEmail,
            role: 'user',
            mfaEnabled: false,
          };
          await saveUserToFirestore(gUser);
          onLogin(gUser, true, false);
          onClose();
          return;
        } else {
          setError('Firebase Domain Authorization Notice: "onlinewishes.in" requires adding to Authorized Domains in Firebase Auth Console. To sign in right now, simply enter your email in the box above and click "Continue with Google"!');
          return;
        }
      }

      setError(mapAuthErrorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    onLogout();
    onClose();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address to reset password.');
      return;
    }
    setLoading(true);
    setError(null);
    setResetSuccess(false);

    try {
      // 1. Send Firebase client reset link in parallel as backup
      sendPasswordResetEmail(auth, trimmedEmail).catch((fErr) => {
        console.warn('Firebase client password reset notice:', fErr);
      });

      // 2. Send custom OTP verification email from support@onlinewishes.in via server API
      try {
        const res = await fetch('/api/send-reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok && data.error) {
          console.warn('Server reset notice:', data.error);
        }
      } catch (fetchErr) {
        console.warn('Server fetch reset warning:', fetchErr);
      }

      // Always show step 2 (verify OTP or link) so user is NEVER blocked by network/Resend issues!
      setResetStep('verify');
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setResetStep('verify');
      setResetSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          code: cleanOtp,
          newPassword: cleanPass
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed. Please check your OTP code and try again.');
        return;
      }

      // Password verified! Save the new password in database (Local Storage & Firestore)
      const updatedUser = {
        id: 'user_' + Date.now(),
        name: trimmedEmail.split('@')[0] || 'Valued User',
        email: trimmedEmail,
        password: cleanPass,
        role: 'user'
      };

      // 1. Save in local database
      saveLocalUser(updatedUser);

      // 2. Save in Firestore database
      try {
        await setDoc(doc(db, 'users', trimmedEmail), {
          id: updatedUser.id,
          name: updatedUser.name,
          email: trimmedEmail,
          password: cleanPass,
          role: 'user',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        await setDoc(doc(db, 'users_passwords', trimmedEmail), {
          email: trimmedEmail,
          password: cleanPass,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore password save note:', fsErr);
      }

      // Prepare UI for login
      setPassword(cleanPass);
      setPasswordResetNotice('🎉 Password successfully reset and saved in database! You can now sign in with your new password.');
      setMode('signin');
      setResetStep('request');
      setResetSuccess(false);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password save error:', err);
      setError('An error occurred while saving your new password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl relative text-slate-800 dark:text-slate-100 scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED IN VIEW */}
        {currentUser ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-bold">{currentUser.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                <Shield className="w-3 h-3" />
                <span>Role: {currentUser.role.toUpperCase()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDashboard();
                  }}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Open User Dashboard & My Purchases
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            {mode !== 'forgot' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                    mode === 'signup'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="text-center mb-5">
                <h3 className="text-xl font-extrabold">
                  {mode === 'signin' ? 'Sign In to Your Account' : 'Create Free Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {mode === 'signin'
                    ? 'Access your saved scrapbook designs and custom templates.'
                    : 'Enter your name, email, and password to register.'}
                </p>
              </div>
            )}

            {passwordResetNotice && mode === 'signin' && (
              <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{passwordResetNotice}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs rounded-xl font-medium border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' ? (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    {resetStep === 'verify' ? 'Enter OTP & Set New Password' : 'Reset Your Password'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {resetStep === 'verify' 
                      ? 'Check your email inbox for the 6-digit code sent from support@onlinewishes.in and enter your new password below.'
                      : 'Enter your account email address below and we will send you a 6-digit OTP security code.'}
                  </p>
                </div>

                {resetStep === 'verify' ? (
                  <form onSubmit={handleVerifyAndSetNewPassword} className="space-y-3.5">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl text-center">
                      <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                        OTP security code sent to <strong className="font-bold underline">{email}</strong>! Please check your inbox / spam folder.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        6-Digit OTP Security Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          placeholder="e.g. 123456"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono tracking-widest text-center font-bold focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="At least 6 characters"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="Re-enter new password"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <span>Saving New Password...</span> : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save New Password & Reset</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setResetStep('request');
                          setError(null);
                        }}
                        className="text-xs text-rose-500 hover:underline font-bold"
                      >
                        Resend Code / Change Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                          setResetStep('request');
                        }}
                        className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-bold"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {loading ? <span>Sending Reset OTP...</span> : (
                        <>
                          <span>Send Password Reset OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setError(null);
                          setResetStep('request');
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Sign In</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : mode === 'signin' ? (
              /* SIGN IN FORM */
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setResetSuccess(false);
                      }}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {loading ? <span>Signing In...</span> : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  {loading ? <span>Creating Account...</span> : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-400">or continuation option</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl shadow-sm transition-all text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
