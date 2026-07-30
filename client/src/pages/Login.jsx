import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithFirebase, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await loginWithFirebase(idToken);
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-2xl text-white shadow-glow mb-4">
            NV
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to continue to Note Vault Pro</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-400">Password</label>
            </div>
            <input
              type="password"
              required
              autoComplete="new-password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-primary w-full py-3 mt-4"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-dark-card text-dark-muted font-medium">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-dark-card hover:bg-dark-cardHover text-dark-text font-medium py-3 px-4 rounded-xl border border-dark-border hover:border-primary/30 transition-all duration-300 transform active:scale-[0.98] shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.77 3.02,-4.38 3.02,-7.4c0,-0.63 -0.06,-1.24 -0.16,-1.8z" fill="#4285F4" />
              <path d="M12,21c2.43,0 4.47,-0.8 5.96,-2.2l-3.28,-2.6C13.78,16.8 12.97,17.1 12,17.1c-2.34,0 -4.33,-1.57 -5.04,-3.7H3.6v2.7C5.08,19.1 8.28,21 12,21z" fill="#34A853" />
              <path d="M6.96,13.4c-0.18,-0.54 -0.29,-1.11 -0.29,-1.7c0,-0.59 0.11,-1.16 0.29,-1.7V7.3H3.6C3,8.5 2.65,9.9 2.65,11.4c0,1.5 0.35,2.9 0.95,4.1l2.84,-2.1H6.96z" fill="#FBBC05" />
              <path d="M12,5.7c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.9 14.43,2.1 12,2.1C8.28,2.1 5.08,4 3.6,7.1l3.36,2.7C7.67,7.27 9.66,5.7 12,5.7z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-light font-medium transition-colors">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
