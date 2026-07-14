import { useState } from 'react';
import type { User } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { registerUser, loginUser, setCurrentUser, seedAdmin } from '../users';

interface Props {
  onAuthed: (user: User) => void;
  onBack: () => void;
  theme: Theme;
}

export default function AuthPage({ onAuthed, onBack, theme }: Props) {
  const th = getTheme(theme);
  seedAdmin();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupDisplay, setSignupDisplay] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = () => {
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) { setLoginError('Please enter your email and password'); return; }
    setLoginLoading(true);
    setTimeout(() => {
      const user = loginUser(loginEmail, loginPassword);
      setLoginLoading(false);
      if (user) { setCurrentUser(user); onAuthed(user); }
      else setLoginError('Incorrect email or password');
    }, 350);
  };

  const handleSignup = () => {
    setSignupError('');
    if (!signupEmail.trim() || !signupPassword || !signupDisplay.trim()) { setSignupError('Please fill in all fields'); return; }
    if (signupPassword !== signupConfirm) { setSignupError('Passwords do not match'); return; }
    setSignupLoading(true);
    setTimeout(() => {
      const result = registerUser(signupEmail, signupPassword, signupDisplay);
      setSignupLoading(false);
      if (result.error) { setSignupError(result.error); return; }
      setCurrentUser(result.user!); onAuthed(result.user!);
    }, 350);
  };

  const inp: React.CSSProperties = {
    width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`,
    borderRadius: 12, padding: '13px 16px', color: th.text, fontSize: 15,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>⚗️</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg, #f093fb, #a78bfa, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Chemistry Games Hub
          </h1>
          <p style={{ color: th.textMuted, fontSize: 14, marginTop: 6 }}>Sign in with your school email to continue</p>
        </div>

        <div style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: '28px 24px', boxShadow: th.shadow }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: th.badge, borderRadius: 14, padding: 4, marginBottom: 24, gap: 4 }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, background: tab === t ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : 'transparent',
                border: 'none', borderRadius: 11, padding: '10px', color: tab === t ? 'white' : th.textMuted,
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t ? 700 : 400, transition: 'all 0.2s',
              }}>
                {t === 'login' ? '🔓 Log In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>School Email</label>
                <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="teacher@school.edu" type="email" style={inp} autoFocus />
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••" style={inp} />
              </div>
              {loginError && <div style={{ color: '#ef4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '10px 12px' }}>⚠️ {loginError}</div>}
              <button onClick={handleLogin} disabled={loginLoading} style={{
                background: loginLoading ? th.badge : 'linear-gradient(135deg, #c084fc, #a78bfa)',
                color: 'white', border: 'none', borderRadius: 14, padding: '14px',
                fontSize: 16, fontWeight: 800, cursor: loginLoading ? 'default' : 'pointer',
                fontFamily: 'inherit', marginTop: 4, boxShadow: loginLoading ? 'none' : '0 4px 20px rgba(192,132,252,0.35)',
              }}>
                {loginLoading ? '⏳ Signing in...' : '→ Enter Dashboard'}
              </button>
              <button onClick={() => setTab('signup')} style={{ background: 'transparent', border: 'none', color: th.textFaint, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 2 }}>
                New here? Create a teacher account →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Full Name</label>
                <input value={signupDisplay} onChange={e => setSignupDisplay(e.target.value)}
                  placeholder="e.g. Ms. Sarah Ahmed" style={inp} autoFocus />
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>School Email</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  placeholder="teacher@school.edu" style={inp} />
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password <span style={{ color: th.textFaint, fontWeight: 400 }}>(min. 6 characters)</span></label>
                <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  placeholder="••••••••" style={inp} />
              </div>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input type="password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()}
                  placeholder="••••••••" style={inp} />
              </div>
              {signupError && <div style={{ color: '#ef4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: '10px 12px' }}>⚠️ {signupError}</div>}
              <button onClick={handleSignup} disabled={signupLoading} style={{
                background: signupLoading ? th.badge : 'linear-gradient(135deg, #6ee7b7, #34d399)',
                color: '#064e3b', border: 'none', borderRadius: 14, padding: '14px',
                fontSize: 16, fontWeight: 800, cursor: signupLoading ? 'default' : 'pointer',
                fontFamily: 'inherit', marginTop: 4, boxShadow: signupLoading ? 'none' : '0 4px 20px rgba(110,231,183,0.3)',
              }}>
                {signupLoading ? '⏳ Creating account...' : '✨ Create Teacher Account'}
              </button>
              <button onClick={() => setTab('login')} style={{ background: 'transparent', border: 'none', color: th.textFaint, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 2 }}>
                Already have an account? Log in →
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: th.textFaint, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
