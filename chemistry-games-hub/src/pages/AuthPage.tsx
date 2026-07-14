import { useState } from 'react';
import type { User } from '../types';
import { registerUser, loginUser, setCurrentUser } from '../users';

interface Props {
  onAuthed: (user: User) => void;
  onBack: () => void;
}

export default function AuthPage({ onAuthed, onBack }: Props) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDisplay, setSignupDisplay] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = () => {
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword) { setLoginError('Please fill in all fields'); return; }
    setLoginLoading(true);
    setTimeout(() => {
      const user = loginUser(loginUsername, loginPassword);
      setLoginLoading(false);
      if (user) { setCurrentUser(user); onAuthed(user); }
      else setLoginError('Incorrect username or password');
    }, 400);
  };

  const handleSignup = () => {
    setSignupError('');
    if (!signupUsername.trim() || !signupPassword || !signupConfirm) { setSignupError('Please fill in all fields'); return; }
    if (signupPassword !== signupConfirm) { setSignupError('Passwords do not match'); return; }
    setSignupLoading(true);
    setTimeout(() => {
      const result = registerUser(signupUsername, signupPassword, signupDisplay);
      setSignupLoading(false);
      if (result.error) { setSignupError(result.error); return; }
      setCurrentUser(result.user!);
      onAuthed(result.user!);
    }, 400);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(192,132,252,0.35)',
    borderRadius: 12, padding: '13px 16px', color: 'white', fontSize: 15, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>⚗️</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Chemistry Games Hub
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>Teacher Platform</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(192,132,252,0.25)', borderRadius: 28, padding: '32px 28px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 4, marginBottom: 28, gap: 4 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, background: tab === t ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : 'transparent',
                border: 'none', borderRadius: 11, padding: '10px', color: tab === t ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t ? 700 : 400,
                transition: 'all 0.2s',
              }}>
                {t === 'login' ? '🔓 Log In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Username" style={inp} autoFocus />
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Password" style={inp} />
              {loginError && <div style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>⚠️ {loginError}</div>}
              <button onClick={handleLogin} disabled={loginLoading} style={{
                background: loginLoading ? 'rgba(192,132,252,0.4)' : 'linear-gradient(135deg, #c084fc, #a78bfa)',
                color: 'white', border: 'none', borderRadius: 14, padding: '14px',
                fontSize: 16, fontWeight: 800, cursor: loginLoading ? 'default' : 'pointer',
                fontFamily: 'inherit', marginTop: 4, boxShadow: '0 4px 20px rgba(192,132,252,0.35)',
              }}>
                {loginLoading ? '⏳ Logging in...' : '→ Enter Dashboard'}
              </button>
              <button onClick={() => setTab('signup')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                Don't have an account? Sign up →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input value={signupDisplay} onChange={e => setSignupDisplay(e.target.value)}
                placeholder="Your name (e.g. Ms. Nourhan)" style={inp} autoFocus />
              <input value={signupUsername} onChange={e => setSignupUsername(e.target.value)}
                placeholder="Username (at least 3 characters)" style={inp} />
              <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                placeholder="Password (at least 4 characters)" style={inp} />
              <input type="password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                placeholder="Confirm password" style={inp} />
              {signupError && <div style={{ color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>⚠️ {signupError}</div>}
              <button onClick={handleSignup} disabled={signupLoading} style={{
                background: signupLoading ? 'rgba(110,231,183,0.4)' : 'linear-gradient(135deg, #6ee7b7, #34d399)',
                color: '#064e3b', border: 'none', borderRadius: 14, padding: '14px',
                fontSize: 16, fontWeight: 800, cursor: signupLoading ? 'default' : 'pointer',
                fontFamily: 'inherit', marginTop: 4, boxShadow: '0 4px 20px rgba(110,231,183,0.3)',
              }}>
                {signupLoading ? '⏳ Creating account...' : '✨ Create Account'}
              </button>
              <button onClick={() => setTab('login')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                Already have an account? Log in →
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
