import { useState, useEffect, useRef, useCallback } from 'react';
import { getGameById } from '../storage';
import { getTemplate, type GameTemplate } from '../templates';
import { subscribeSession, submitAnswer, joinSession, type LiveSession, type StudentSlot } from '../firebase';

interface Props {
  pin: string;
  nickname: string;
  onFinish: () => void;
  onBack: () => void;
}

type LocalPhase = 'waiting' | 'playing' | 'reveal' | 'leaderboard' | 'finished';

// Car colors for racing
const CAR_COLORS = ['#e74c3c', '#2980e4', '#f1c40f', '#27ae60', '#c084fc', '#fb923c', '#06b6d4', '#f472b6'];
const CAR_EMOJIS = ['🏎️', '🚗', '🚕', '🚙', '🛻', '🏍️', '🚓', '🚑'];
const FISH = ['🐟', '🐠', '🐡', '🦈', '🐬', '🦑', '🐙', '🦐'];

// ── Racing Track Game ──────────────────────────────────────────────────────
function RacingGame({
  session, nickname, tpl, onAnswer, myScore, answered,
}: {
  session: LiveSession; nickname: string; tpl: GameTemplate;
  onAnswer: (idx: number) => void; myScore: number; answered: boolean;
}) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];
  const students = Object.values(session.students);
  const maxScore = Math.max(...students.map(s => s.score), 1);
  const totalQ = session.questionCount;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: tpl.bg }}>
      {/* Header */}
      <div style={{ background: tpl.headerBg, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Q {session.currentQuestion + 1}/{totalQ}</div>
        <div style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 16 }}>{myScore} pts</div>
      </div>

      {/* Race track */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderBottom: `1px solid ${tpl.accentColor}20` }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {students.slice(0, 6).map((s, i) => {
            const pct = Math.min((s.score / (maxScore || 1)) * 85, 85);
            const isMe = s.nickname === nickname;
            return (
              <div key={s.nickname} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 22, fontSize: 12, color: tpl.accentColor, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>
                  {i + 1}.
                </div>
                <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'visible', position: 'relative' }}>
                  {/* Track stripes */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 22px)', borderRadius: 100 }} />
                  {/* Car */}
                  <div style={{
                    position: 'absolute', top: '50%',
                    left: `calc(${pct}% - 14px)`,
                    transform: 'translateY(-50%)',
                    fontSize: 20, transition: 'left 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                    filter: isMe ? 'drop-shadow(0 0 8px white)' : 'none',
                  }}>
                    {CAR_EMOJIS[i % CAR_EMOJIS.length]}
                  </div>
                  {/* Finish flag at end */}
                  <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🏁</div>
                </div>
                <div style={{ width: 80, fontSize: 11, color: isMe ? tpl.accentColor : 'rgba(255,255,255,0.5)', fontWeight: isMe ? 800 : 400, flexShrink: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {isMe ? `⭐ ${s.nickname}` : s.nickname}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '20px 16px', textAlign: 'center', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <div style={{ background: tpl.cardBg, border: `1px solid ${tpl.accentColor}30`, borderRadius: 18, padding: '20px', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(16px,3vw,24px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{q?.text}</h2>
        </div>

        {/* Answer buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {q?.choices.map((choice, ci) => {
            const color = tpl.choiceColors[ci] || CAR_COLORS[ci];
            return (
              <button
                key={ci}
                onClick={() => !answered && onAnswer(ci)}
                disabled={answered}
                style={{
                  background: answered ? `${color}40` : color,
                  border: `2px solid ${answered ? color + '40' : color}`,
                  borderRadius: 14, padding: '18px 14px', color: answered ? 'rgba(255,255,255,0.4)' : 'white',
                  cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit',
                  fontSize: 'clamp(13px,2.5vw,17px)', fontWeight: 700, textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                  minHeight: 64, boxShadow: answered ? 'none' : `0 4px 20px ${color}50`,
                  transform: answered ? 'scale(0.97)' : 'scale(1)',
                }}
              >
                <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, flexShrink: 0 }}>
                  {['▲','◆','●','■'][ci]}
                </span>
                <span style={{ lineHeight: 1.3 }}>{choice}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ color: tpl.accentColor, marginTop: 16, fontWeight: 700, animation: 'fadeIn 0.4s ease' }}>
            ✓ Answer submitted — waiting for teacher...
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

// ── Fishing Game ───────────────────────────────────────────────────────────
function FishingGame({
  session, tpl, onAnswer, answered,
}: {
  session: LiveSession; tpl: GameTemplate; onAnswer: (idx: number) => void; answered: boolean;
}) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];

  // Animate fish positions
  const [fishPositions, setFishPositions] = useState(() =>
    q?.choices.map((_, i) => ({
      x: 10 + Math.random() * 60,
      y: 30 + (i * 22) + Math.random() * 10,
      dir: Math.random() > 0.5 ? 1 : -1,
    })) || []
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setFishPositions(prev => prev.map(p => {
        let nx = p.x + p.dir * 0.6;
        let nd = p.dir;
        if (nx > 80 || nx < 5) nd = -nd;
        return { ...p, x: nx, dir: nd };
      }));
    }, 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0c1445 0%, #0e4d7b 60%, #1a6fa0 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Water surface sparkle */}
      <div style={{ height: 6, background: 'linear-gradient(90deg, #67e8f9, #38bdf8, #0ea5e9, #38bdf8, #67e8f9)', animation: 'wave 3s ease-in-out infinite' }} />

      {/* Question bubble */}
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(14,82,123,0.9)', border: '2px solid #38bdf880', borderRadius: 20, padding: '16px 20px', maxWidth: 600, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>🎣 Catch the correct fish!</p>
          <h2 style={{ color: 'white', fontSize: 'clamp(16px,3vw,22px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{q?.text}</h2>
        </div>
      </div>

      {/* Fish pond */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', margin: '0 16px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 20, border: '2px solid #38bdf840' }}>
        {/* Bubbles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: 8 + i * 3, height: 8 + i * 3, borderRadius: '50%',
            border: '1px solid rgba(103,232,249,0.3)',
            left: `${10 + i * 11}%`, bottom: `${5 + (i % 3) * 20}%`,
            animation: `bubble ${2 + i * 0.4}s ${i * 0.3}s ease-in-out infinite alternate`,
          }} />
        ))}

        {/* Fish buttons */}
        {q?.choices.map((choice, ci) => {
          const pos = fishPositions[ci] || { x: 20 + ci * 15, y: 30 + ci * 18, dir: 1 };
          return (
            <button
              key={ci}
              onClick={() => !answered && onAnswer(ci)}
              disabled={answered}
              style={{
                position: 'absolute',
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: `scaleX(${pos.dir}) translateX(-50%)`,
                background: 'none', border: 'none', cursor: answered ? 'default' : 'pointer',
                fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                transition: 'top 0.08s linear',
                opacity: answered ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 38, filter: `drop-shadow(0 0 8px ${tpl.choiceColors[ci] || '#38bdf8'})` }}>
                {FISH[ci % FISH.length]}
              </span>
              <span style={{
                background: tpl.choiceColors[ci] || '#0ea5e9', color: 'white',
                borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700,
                whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
                transform: `scaleX(${pos.dir})`,
              }}>
                {choice}
              </span>
            </button>
          );
        })}

        {answered && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', borderRadius: 18,
          }}>
            <div style={{ color: '#67e8f9', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
              🎣 Fish caught!<br/>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>Waiting for teacher...</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave { 0%,100% { opacity:0.8; } 50% { opacity:1; } }
        @keyframes bubble { 0% { opacity:0.3; transform:translateY(0); } 100% { opacity:0.6; transform:translateY(-12px); } }
      `}</style>
    </div>
  );
}

// ── Reveal Screen ──────────────────────────────────────────────────────────
function RevealScreen({ session, tpl, myAnswerIdx }: {
  session: LiveSession; tpl: GameTemplate; myAnswerIdx: number | null;
}) {
  const game = getGameById(session.gameId);
  if (!game) return null;
  const q = game.questions[session.currentQuestion];
  const isCorrect = myAnswerIdx === q?.correctIndex;

  return (
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>{isCorrect ? '🎉' : myAnswerIdx === null ? '⏰' : '❌'}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: isCorrect ? '#6ee7b7' : myAnswerIdx === null ? '#fde68a' : '#fca5a5', marginBottom: 8 }}>
        {isCorrect ? 'Correct!' : myAnswerIdx === null ? "Time's up!" : 'Wrong!'}
      </div>
      {q?.explanation && (
        <div style={{ background: `${tpl.accentColor}15`, border: `1px solid ${tpl.accentColor}40`, borderRadius: 14, padding: '14px 20px', maxWidth: 500, marginTop: 12 }}>
          <span style={{ color: tpl.accentColor }}>💡 </span>
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>{q.explanation}</span>
        </div>
      )}
      <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: 20, fontSize: 14 }}>⏳ Waiting for teacher...</div>
    </div>
  );
}

// ── Leaderboard Screen ─────────────────────────────────────────────────────
function LeaderboardScreen({ session, nickname, tpl }: {
  session: LiveSession; nickname: string; tpl: GameTemplate;
}) {
  const sorted = Object.values(session.students).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.nickname === nickname) + 1;

  return (
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: 24, margin: 0 }}>Leaderboard</h2>
        {myRank > 0 && <p style={{ color: tpl.accentColor, marginTop: 4 }}>You're in {myRank}{myRank===1?'st':myRank===2?'nd':myRank===3?'rd':'th'} place!</p>}
      </div>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {sorted.slice(0, 10).map((s, i) => {
          const isMe = s.nickname === nickname;
          return (
            <div key={s.nickname} style={{
              background: isMe ? `${tpl.accentColor}20` : tpl.cardBg,
              border: `2px solid ${isMe ? tpl.accentColor : 'transparent'}`,
              borderRadius: 14, padding: '14px 18px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: 20, width: 28 }}>{['🥇','🥈','🥉'][i] || `${i+1}`}</span>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: tpl.choiceColors[i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {s.nickname[0].toUpperCase()}
              </div>
              <span style={{ flex: 1, color: isMe ? tpl.accentColor : 'white', fontWeight: isMe ? 800 : 600 }}>{s.nickname}{isMe ? ' (you)' : ''}</span>
              <span style={{ color: tpl.accentColor, fontWeight: 800, fontSize: 18 }}>{s.score}</span>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 14 }}>⏳ Next question coming...</div>
    </div>
  );
}

// ── Finished Screen ────────────────────────────────────────────────────────
function FinishedScreen({ session, nickname, tpl, onFinish }: {
  session: LiveSession; nickname: string; tpl: GameTemplate; onFinish: () => void;
}) {
  const sorted = Object.values(session.students).sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex(s => s.nickname === nickname) + 1;
  const me = sorted.find(s => s.nickname === nickname);

  return (
    <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>
        {myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎓'}
      </div>
      <h2 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Game Over!</h2>
      <p style={{ color: tpl.accentColor, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
        {myRank === 1 ? '🎉 You won!' : `You came in ${myRank}${myRank===2?'nd':myRank===3?'rd':'th'} place`}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Final score: <strong style={{ color: tpl.accentColor }}>{me?.score || 0} points</strong></p>

      <div style={{ maxWidth: 400, width: '100%', marginBottom: 32 }}>
        {sorted.slice(0, 5).map((s, i) => (
          <div key={s.nickname} style={{ display: 'flex', alignItems: 'center', gap: 12, background: tpl.cardBg, borderRadius: 12, padding: '12px 16px', marginBottom: 8, border: `1px solid ${s.nickname === nickname ? tpl.accentColor : 'transparent'}` }}>
            <span style={{ width: 24 }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
            <span style={{ flex: 1, color: s.nickname === nickname ? tpl.accentColor : 'white', fontWeight: 600 }}>{s.nickname}</span>
            <span style={{ color: tpl.accentColor, fontWeight: 800 }}>{s.score} pts</span>
          </div>
        ))}
      </div>

      <button onClick={onFinish} style={{ background: `linear-gradient(135deg, ${tpl.accentColor}, ${tpl.choiceColors[0]})`, color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
        🏠 Home
      </button>
    </div>
  );
}

// ── Main StudentGamePage ───────────────────────────────────────────────────
export default function StudentGamePage({ pin, nickname, onFinish, onBack }: Props) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [localPhase, setLocalPhase] = useState<LocalPhase>('waiting');
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [myAnswers, setMyAnswers] = useState<Record<number, number>>({});
  const joinedRef = useRef(false);

  const tpl = getTemplate(session?.templateId || 'periodic-table');

  // Join session + subscribe
  useEffect(() => {
    const join = async () => {
      if (!joinedRef.current) {
        joinedRef.current = true;
        const slot: StudentSlot = {
          nickname, score: 0, streak: 0, answers: {}, answeredAt: {},
        };
        await joinSession(pin, slot);
      }
    };
    join();

    const unsub = subscribeSession(pin, s => {
      if (!s) return;
      setSession(s);
      setLocalPhase(s.status === 'finished' ? 'finished'
        : s.status === 'leaderboard' ? 'leaderboard'
        : s.status === 'reveal' ? 'reveal'
        : s.status === 'playing' ? 'playing'
        : 'waiting');
    });

    return unsub;
  }, [pin, nickname]);

  const handleAnswer = useCallback(async (choiceIdx: number) => {
    if (!session || myAnswers[session.currentQuestion] !== undefined) return;
    const game = getGameById(session.gameId);
    if (!game) return;
    const q = game.questions[session.currentQuestion];
    const isCorrect = choiceIdx === q.correctIndex;
    const newStreak = isCorrect ? myStreak + 1 : 0;
    const pts = isCorrect ? 100 + newStreak * 30 : 0;
    const newScore = myScore + pts;

    setMyAnswers(prev => ({ ...prev, [session.currentQuestion]: choiceIdx }));
    setMyScore(newScore);
    setMyStreak(newStreak);

    await submitAnswer(pin, nickname, session.currentQuestion, choiceIdx, newScore, newStreak);
  }, [session, myAnswers, myScore, myStreak, pin, nickname]);

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a1a,#1a0a2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48, animation: 'spin 1s linear infinite' }}>⚛️</div>
        <div style={{ color: 'white', fontSize: 18 }}>Connecting...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Waiting for teacher to start
  if (localPhase === 'waiting') {
    const students = Object.values(session.students);
    return (
      <div style={{ minHeight: '100vh', background: tpl.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</div>
        <h2 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{session.title}</h2>
        <p style={{ color: tpl.accentColor, marginBottom: 8, fontWeight: 700 }}>Welcome, {nickname}!</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Waiting for teacher to start the game...</p>
        <div style={{ background: tpl.cardBg, borderRadius: 16, padding: '16px 24px', marginBottom: 20 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 8 }}>Students joined</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {students.map((s, i) => (
              <div key={s.nickname} style={{ background: tpl.choiceColors[i % 4] + '30', border: `1px solid ${tpl.choiceColors[i % 4]}`, borderRadius: 100, padding: '4px 12px', color: 'white', fontSize: 13, fontWeight: s.nickname === nickname ? 700 : 400 }}>
                {s.nickname === nickname ? `⭐ ${s.nickname}` : s.nickname}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Leave</button>
        <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
      </div>
    );
  }

  if (localPhase === 'finished') {
    return <FinishedScreen session={session} nickname={nickname} tpl={tpl} onFinish={onFinish} />;
  }

  if (localPhase === 'leaderboard') {
    return <LeaderboardScreen session={session} nickname={nickname} tpl={tpl} />;
  }

  if (localPhase === 'reveal') {
    const myAns = myAnswers[session.currentQuestion] ?? null;
    return <RevealScreen session={session} tpl={tpl} myAnswerIdx={myAns} />;
  }

  // Playing
  const answered = myAnswers[session.currentQuestion] !== undefined;

  if (session.gameType === 'fastest-molecule') {
    return <FishingGame session={session} tpl={tpl} onAnswer={handleAnswer} answered={answered} />;
  }

  return (
    <RacingGame
      session={session} nickname={nickname} tpl={tpl}
      onAnswer={handleAnswer} myScore={myScore} answered={answered}
    />
  );
}
