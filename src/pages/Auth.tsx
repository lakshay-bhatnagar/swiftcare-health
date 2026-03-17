import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import authService from '@/services/authService';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignup) {
        await authService.signUp(form.email, form.password, form.name, form.phone);
        // DON'T call login(user) yet because they aren't verified
        toast.success('Verification email sent! Please check your inbox.');
        setIsSignup(false); // Switch to sign-in mode
      } else {
        const user = await authService.signIn(form.email, form.password);
        login(user);
        toast.success('Welcome back');
        navigate('/');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top safe-bottom">
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">{isSignup ? 'Create account' : 'Sign In'}</h1>
      </div>

      <div className="flex-1 px-6 py-4">
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={onSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="swift-input pl-11" placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="swift-input pl-11" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" className="swift-input pl-11" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="password" className="swift-input pl-11" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>

          <Button type="submit" size="xl" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : isSignup ? 'Create account' : 'Sign in'}
          </Button>

          <button type="button" onClick={() => setIsSignup((v) => !v)} className="w-full text-sm text-primary">
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Auth;
