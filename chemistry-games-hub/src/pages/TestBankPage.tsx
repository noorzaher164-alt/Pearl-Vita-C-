import { useState } from 'react';
import type { GameType, Page } from '../types';
import { TEST_BANK } from '../testBank';
import { TEST_BANK_S2 } from '../testBankS2';
import { getFolders, saveGame } from '../storage';
import type { Folder } from '../types';
import { getTheme } from '../theme';
import type { Theme } from '../theme';

interface Props {
  onBack: () => void;
  semester?: 's1' | 's2'; // which test bank to load
  onNavigate?: (page: Page, extra?: Record<string, unknown>) => void;
}

const PRACTICE_TYPES: { value: GameType; label: string; icon: string }[] = [
  { value: 'quiz-battle', label: 'Quiz Battle', icon: '⚔️' },
  { value: 'true-false', label: 'True or False', icon: '✅' },
  { value: 'flashcards', label: 'Flashcards', icon: '🃏' },
  { value: 'match-terms', label: 'Match Terms', icon: '🔗' },
  { value: 'drag-drop', label: 'Drag & Drop', icon: '🧩' },
];

const COMPETITIVE_TYPES: { value: GameType; label: string; icon: string }[] = [
  { value: 'fastest-molecule', label: 'Fastest Molecule', icon: '⚡' },
  { value: 'periodic-challenge', label: 'Periodic Challenge', icon: '🔬' },
  { value: 'reaction-race', label: 'Reaction Race', icon: '🏃' },
  { value: 'energy-points', label: 'Energy Points', icon: '💎' },
];

const TEMPLATES = ['periodic-table', 'lab-dark', 'neon-glow', 'deep-space', 'volcano'];

export default function TestBankPage({ onBack, semester = 's1' }: Props) {
  const theme = (localStorage.getItem('cgh_theme') as Theme) || 'dark';
  const C = getTheme(theme);
  const isDark = theme === 'dark';

  const BANK = semester === 's2' ? TEST_BANK_S2 : TEST_BANK;
  const folders = getFolders();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [gameType, setGameType] = useState<GameType>('quiz-battle');
  const [folderId, setFolderId] = useState(folders[0]?.id || '');
  const [templateId, setTemplateId] = useState('periodic-table');
  const [shuffle, setShuffle] = useState(true);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<string | null>(null);

  const unit = selectedUnit !== null ? BANK[selectedUnit] : null;
  const lesson = unit && selectedLesson !== null ? unit.lessons[selectedLesson] : null;
  const availableQ = lesson?.questions.length || 0;
  const maxQ = Math.min(availableQ, 15);

  const handleGenerate = () => {
    if (!lesson || !folderId) return;
    setCreating(true);

    let qs = [...lesson.questions];
    if (shuffle) qs = qs.sort(() => Math.random() - 0.5);
    qs = qs.slice(0, questionCount);

    const questions = qs.map(q => ({
      id: crypto.randomUUID(),
      text: q.text,
      choices: [...q.choices],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));

    const isCompetitive = ['quiz-battle', 'fastest-molecule', 'periodic-challenge', 'reaction-race', 'energy-points'].includes(gameType);

    const game = {
      id: crypto.randomUUID(),
      title: `${lesson.name.replace(/^الدرس\s+[\d-]+:\s*/, '')} — اختبار`,
      folderId,
      lessonName: lesson.name,
      gameType,
      questions,
      isCompetitive,
      templateId,
      createdAt: new Date().toISOString(),
      pin: undefined,
    };

    saveGame(game);
    setTimeout(() => { setCreating(false); setCreated(game.id); }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        background: C.cardBg, backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={onBack} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#ede9fe', border: `1px solid ${C.cardBorder}`, color: C.text, borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back</button>
        <div>
          <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>بنك الأسئلة</div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: 20 }}>🏫 توليد لعبة من بنك الأسئلة</div>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: 100, padding: '4px 14px', fontSize: 12, color: '#c084fc' }}>
          الصف الثاني عشر — الفصل الأول
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Step 1: Unit */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 24 }}>
          <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>الخطوة 1 — اختر الوحدة</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BANK.map((u, ui) => (
              <button key={ui} onClick={() => { setSelectedUnit(ui); setSelectedLesson(null); setCreated(null); }}
                style={{
                  background: selectedUnit === ui ? 'rgba(192,132,252,0.2)' : C.cardBg,
                  border: `2px solid ${selectedUnit === ui ? '#c084fc' : C.cardBorder}`,
                  borderRadius: 14, padding: '16px 20px', color: C.text, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 15, fontWeight: selectedUnit === ui ? 700 : 400,
                  textAlign: 'right', transition: 'all 0.2s', direction: 'rtl',
                }}>
                <span style={{ color: selectedUnit === ui ? '#c084fc' : C.textFaint, fontSize: 13, display: 'block', marginBottom: 2 }}>
                  {u.lessons.reduce((s, l) => s + l.questions.length, 0)} سؤال — {u.lessons.length} دروس
                </span>
                {u.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Lesson */}
        {unit && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>الخطوة 2 — اختر الدرس</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unit.lessons.map((l, li) => (
                <button key={li} onClick={() => { setSelectedLesson(li); setCreated(null); setQuestionCount(Math.min(10, l.questions.length)); }}
                  style={{
                    background: selectedLesson === li ? 'rgba(125,211,252,0.2)' : C.cardBg,
                    border: `2px solid ${selectedLesson === li ? '#7dd3fc' : C.cardBorder}`,
                    borderRadius: 14, padding: '16px 20px', color: C.text, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 15, fontWeight: selectedLesson === li ? 700 : 400,
                    textAlign: 'right', transition: 'all 0.2s', direction: 'rtl',
                  }}>
                  <span style={{ color: selectedLesson === li ? '#7dd3fc' : C.textFaint, fontSize: 13, display: 'block', marginBottom: 2 }}>
                    {l.questions.length} سؤال MCQ
                  </span>
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {lesson && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 24 }}>
            <div style={{ color: C.textMuted, fontSize: 11, letterSpacing: 2, fontWeight: 700, marginBottom: 20 }}>الخطوة 3 — إعدادات اللعبة</div>

            {/* Question count */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: C.textMuted, fontSize: 13, display: 'block', marginBottom: 10 }}>
                عدد الأسئلة: <strong style={{ color: C.text }}>{questionCount}</strong> من {availableQ}
              </label>
              <input type="range" min={3} max={maxQ} value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#c084fc', height: 6, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: C.textFaint, fontSize: 12, marginTop: 4 }}>
                <span>3</span><span>{maxQ}</span>
              </div>
            </div>

            {/* Shuffle */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setShuffle(s => !s)} style={{
                width: 48, height: 26, borderRadius: 100,
                background: shuffle ? '#c084fc' : (isDark ? 'rgba(255,255,255,0.1)' : '#ede9fe'),
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
              }}>
                <span style={{ position: 'absolute', top: 3, left: shuffle ? 24 : 4, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.3s' }} />
              </button>
              <span style={{ color: C.textMuted, fontSize: 14 }}>خلط الأسئلة عشوائياً</span>
            </div>

            {/* Game type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: C.textMuted, fontSize: 13, display: 'block', marginBottom: 10 }}>نوع اللعبة</label>
              <div style={{ marginBottom: 8 }}>
                <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>⚔️ COMPETITIVE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {COMPETITIVE_TYPES.map(t => (
                    <button key={t.value} onClick={() => setGameType(t.value)}
                      style={{ background: gameType === t.value ? 'rgba(239,68,68,0.25)' : C.cardBg, border: `2px solid ${gameType === t.value ? '#ef4444' : C.cardBorder}`, color: C.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: gameType === t.value ? 700 : 400 }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>📚 PRACTICE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {PRACTICE_TYPES.map(t => (
                    <button key={t.value} onClick={() => setGameType(t.value)}
                      style={{ background: gameType === t.value ? 'rgba(34,197,94,0.2)' : C.cardBg, border: `2px solid ${gameType === t.value ? '#22c55e' : C.cardBorder}`, color: C.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: gameType === t.value ? 700 : 400 }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Folder */}
            {folders.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: C.textMuted, fontSize: 13, display: 'block', marginBottom: 10 }}>حفظ في مجلد</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {folders.map((f: Folder) => (
                    <button key={f.id} onClick={() => setFolderId(f.id)}
                      style={{ background: folderId === f.id ? `${f.color}25` : C.cardBg, border: `2px solid ${folderId === f.id ? f.color : C.cardBorder}`, color: folderId === f.id ? f.color : C.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                      {f.icon} {f.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#fbbf24', fontSize: 13 }}>
                ⚠️ لازم تعملي مجلد أول من الـ Dashboard عشان تحفظي فيه اللعبة.
              </div>
            )}

            {/* Theme */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: C.textMuted, fontSize: 13, display: 'block', marginBottom: 10 }}>ثيم اللعبة</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TEMPLATES.map(t => (
                  <button key={t} onClick={() => setTemplateId(t)}
                    style={{ background: templateId === t ? 'rgba(192,132,252,0.25)' : C.cardBg, border: `2px solid ${templateId === t ? '#c084fc' : C.cardBorder}`, color: C.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {created ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                <div style={{ color: '#6ee7b7', fontWeight: 800, fontSize: 18, marginBottom: 4 }}>تم إنشاء اللعبة!</div>
                <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>
                  {questionCount} سؤال — {lesson.name.replace(/^الدرس\s+[\d-]+:\s*/, '')}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => { setCreated(null); setSelectedLesson(null); }}
                    style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#ede9fe', border: `1px solid ${C.cardBorder}`, color: C.text, borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>
                    ＋ إنشاء لعبة أخرى
                  </button>
                  <button onClick={() => onBack()}
                    style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700 }}>
                    🏠 الرجوع للـ Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleGenerate} disabled={!folderId || creating}
                style={{
                  width: '100%', background: creating ? (isDark ? 'rgba(255,255,255,0.1)' : '#ede9fe') : 'linear-gradient(135deg, #c084fc 0%, #a78bfa 50%, #7dd3fc 100%)',
                  color: 'white', border: 'none', borderRadius: 16, padding: '18px',
                  fontSize: 18, fontWeight: 800, cursor: creating || !folderId ? 'default' : 'pointer',
                  fontFamily: 'inherit', boxShadow: creating ? 'none' : '0 8px 30px rgba(167,139,250,0.5)',
                  transition: 'all 0.3s',
                }}>
                {creating ? '⏳ جاري الإنشاء...' : `✨ إنشاء اللعبة (${questionCount} سؤال)`}
              </button>
            )}
          </div>
        )}

        {/* Preview */}
        {lesson && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20, padding: 20 }}>
            <div style={{ color: C.textFaint, fontSize: 12, letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>معاينة الأسئلة</div>
            {lesson.questions.slice(0, 3).map((q, i) => (
              <div key={i} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f9f7ff', borderRadius: 12, padding: '12px 16px', marginBottom: 8, direction: 'rtl', textAlign: 'right' }}>
                <div style={{ color: '#c084fc', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>س{i + 1}</div>
                <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{q.text}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {q.choices.map((c, ci) => (
                    <span key={ci} style={{ background: ci === q.correctIndex ? 'rgba(34,197,94,0.2)' : C.cardBg, border: `1px solid ${ci === q.correctIndex ? 'rgba(34,197,94,0.5)' : C.cardBorder}`, borderRadius: 8, padding: '3px 10px', fontSize: 12, color: ci === q.correctIndex ? '#6ee7b7' : C.textMuted }}>
                      {['أ', 'ب', 'ج', 'د'][ci]}) {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {lesson.questions.length > 3 && (
              <div style={{ color: C.textFaint, fontSize: 13, textAlign: 'center' }}>... و{lesson.questions.length - 3} أسئلة أخرى</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
