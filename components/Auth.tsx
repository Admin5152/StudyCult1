import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Star, ArrowRight, Loader2 } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="flex items-center gap-2 justify-center mb-8">
           <div className="relative">
             <Star className="text-primary fill-primary w-10 h-10 animate-bounce-small" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"></div>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cultists</h1>
        </div>

        <h2 className="text-xl font-bold text-center mb-6 text-slate-800">
          {isLogin ? "Welcome Back, Initiate." : "Join the Cult of Knowledge."}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isLogin ? "Log In" : "Sign Up"} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 hover:text-primary font-medium text-sm"
          >
            {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
