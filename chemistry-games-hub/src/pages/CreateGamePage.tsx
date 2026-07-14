import { useState, useEffect } from 'react';
import type { Game, GameType, Question } from '../types';
import { getGameById, saveGame } from '../storage';
import TemplatePicker from '../components/TemplatePicker';

interface Props {
  folderId: string;
  editGameId: string | null;
  onBack: () => void;
  onSaved: () => void;
}

const GAME_TYPES: { value: GameType; label: string; icon: string; competitive: boolean; desc: string; disney: string; disneyName: string; color: string }[] = [
  { value: 'quiz-battle', label: 'Quiz Battle', icon: '⚔️', competitive: true, desc: 'Everyone answers at the same time — fastest correct answer wins the most points!', disney: '🦁', disneyName: 'Simba', color: '#e21b3c' },
  { value: 'fastest-molecule', label: 'Speed Round', icon: '⚡', competitive: true, desc: 'Super fast! Bonus points for whoever answers first. Great for quick chemistry facts.', disney: '🐇', disneyName: 'Judy Hopps', color: '#1368ce' },
  { value: 'periodic-challenge', label: 'Element Challenge', icon: '🔬', competitive: true, desc: 'Race the clock on periodic table questions — elements, compounds & more!', disney: '🧪', disneyName: 'Hiro Hamada', color: '#d89e00' },
  { value: 'reaction-race', label: 'Reaction Race', icon: '🏃', competitive: true, desc: 'Short timer per question keeps the energy HIGH. Perfect for reaction equations.', disney: '⚡', disneyName: 'Lightning McQueen', color: '#26890c' },
  { value: 'energy-points', label: 'Streak Bonus', icon: '💎', competitive: true, desc: 'Earn HUGE bonuses for answer streaks. Risk-reward scoring — can you keep your streak?', disney: '✨', disneyName: 'Tinker Bell', color: '#9c27b0' },
  { value: 'match-terms', label: 'Match the Terms', icon: '🔗', competitive: false, desc: 'Match chemistry terms to their definitions at your own pace. Great for vocabulary!', disney: '🐟', disneyName: 'Dory', color: '#1368ce' },
  { value: 'word-search', label: 'Word Search', icon: '🔍', competitive: false, desc: 'Find hidden chemistry words in a grid. Fun and relaxing review activity.', disney: '🦉', disneyName: 'Archimedes', color: '#26890c' },
  { value: 'drag-drop', label: 'Drag & Drop', icon: '🧩', competitive: false, desc: 'Drag labels into the right categories. Perfect for classification tasks.', disney: '🍄', disneyName: 'Pascal', color: '#d89e00' },
  { value: 'true-false', label: 'True or False', icon: '✅', competitive: false, desc: 'Simple true/false statements. Great for checking understanding after a lesson.', disney: '🐧', disneyName: 'Skipper', color: '#e21b3c' },
  { value: 'flashcards', label: 'Flashcards', icon: '🃏', competitive: false, desc: 'Self-paced flip-card study. Students review at their own speed before a test.', disney: '📚', disneyName: 'Belle', color: '#9c27b0' },
];

function emptyQuestion(): Question {
  return {
    id: crypto.randomUUID(),
    text: '',
    choices: ['', '', '', ''],
    correctIndex: 0,
    explanation: '',
  };
}

export default function CreateGamePage({ folderId, editGameId, onBack, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [gameType, setGameType] = useState<GameType>('quiz-battle');
  const [templateId, setTemplateId] = useState('periodic-table');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editGameId) {
      const game = getGameById(editGameId);
      if (game) {
        setTitle(game.title);
        setLessonName(game.lessonName);
        setGameType(game.gameType);
        setTemplateId(game.templateId || 'periodic-table');
        setQuestions(game.questions);
      }
    }
  }, [editGameId]);

  const selectedType = GAME_TYPES.find(t => t.value === gameType)!;

  const changeGameType = (val: GameType) => {
    setGameType(val);
    if (val === 'true-false') {
      setQuestions(prev => prev.map(q => ({
        ...q,
        choices: ['True', 'False', '', ''],
        correctIndex: q.correctIndex > 1 ? 0 : q.correctIndex,
      })));
    }
  };;

  const updateQuestion = (idx: number, field: keyof Question, value: string | number | string[]) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateChoice = (qIdx: number, cIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx
      ? { ...q, choices: q.choices.map((c, j) => j === cIdx ? value : c) }
      : q
    ));
  };

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const newQ = [...questions];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newQ.length) return;
    [newQ[idx], newQ[swapIdx]] = [newQ[swapIdx], newQ[idx]];
    setQuestions(newQ);
  };

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Game title is required');
    if (!lessonName.trim()) errs.push('Lesson name is required');
    const isTF = gameType === 'true-false';
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs.push(`Question ${i + 1}: text is required`);
      const choicesToCheck = isTF ? q.choices.slice(0, 2) : q.choices;
      choicesToCheck.forEach((c, j) => {
        if (!c.trim()) errs.push(`Question ${i + 1}: Choice ${j + 1} is required`);
      });
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setSaving(true);
    const game: Game = {
      id: editGameId || crypto.randomUUID(),
      title: title.trim(),
      folderId,
      lessonName: lessonName.trim(),
      gameType,
      questions,
      isCompetitive: selectedType.competitive,
      templateId,
      createdAt: editGameId ? (getGameById(editGameId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
    saveGame(game);
    setTimeout(() => { setSaving(false); onSaved(); }, 600);
  };

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #f093fb, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          {editGameId ? '✏️ Edit Game' : '✨ Create New Game'}
        </h1>
      </div>

      {errors.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ color: '#fca5a5', fontWeight: 600, marginBottom: 8 }}>Please fix:</p>
          {errors.map((e, i) => <p key={i} style={{ color: '#fca5a5', fontSize: 13, margin: '2px 0' }}>• {e}</p>)}
        </div>
      )}

      {/* Basic Info */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Game Info</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 8 }}>Game Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry Quiz"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, display: 'block', marginBottom: 8 }}>Lesson Name *</label>
            <input
              value={lessonName}
              onChange={e => setLessonName(e.target.value)}
              placeholder="e.g. Introduction to Alkanes"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Game Type */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🎮 Pick a Game Type</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>Each game has a Disney friend to guide your students!</p>

        {/* Selected type big banner */}
        {(() => {
          const sel = GAME_TYPES.find(t => t.value === gameType)!;
          return (
            <div style={{ background: `${sel.color}22`, border: `2px solid ${sel.color}`, borderRadius: 18, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ fontSize: 56, lineHeight: 1, flexShrink: 0 }}>{sel.disney}</div>
              <div>
                <div style={{ color: sel.color, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{sel.competitive ? '⚔️ LIVE MULTIPLAYER' : '📚 SOLO PRACTICE'}</div>
                <div style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>{sel.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4 }}>{sel.desc}</div>
                <div style={{ color: sel.color, fontSize: 12, marginTop: 6, fontWeight: 600 }}>✨ Hosted by {sel.disneyName}</div>
              </div>
            </div>
          );
        })()}

        {/* Live competitive */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: '#e21b3c', color: 'white', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>⚔️ LIVE</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Teacher hosts — all students compete together on the big screen</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {GAME_TYPES.filter(t => t.competitive).map(t => {
              const isSelected = gameType === t.value;
              return (
                <button key={t.value} onClick={() => changeGameType(t.value)} style={{
                  background: isSelected ? `${t.color}30` : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isSelected ? t.color : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 16, padding: '16px 12px', color: 'white',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}>
                  <div style={{ fontSize: 34 }}>{t.disney}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? 'white' : 'rgba(255,255,255,0.85)' }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: isSelected ? t.color : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{t.disneyName}</div>
                  {isSelected && <div style={{ width: 24, height: 3, background: t.color, borderRadius: 100 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solo practice */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: '#1368ce', color: 'white', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>📚 SOLO</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Students practice on their own device at their own pace</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {GAME_TYPES.filter(t => !t.competitive).map(t => {
              const isSelected = gameType === t.value;
              return (
                <button key={t.value} onClick={() => changeGameType(t.value)} style={{
                  background: isSelected ? `${t.color}30` : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isSelected ? t.color : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 16, padding: '16px 12px', color: 'white',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}>
                  <div style={{ fontSize: 34 }}>{t.disney}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? 'white' : 'rgba(255,255,255,0.85)' }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: isSelected ? t.color : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{t.disneyName}</div>
                  {isSelected && <div style={{ width: 24, height: 3, background: t.color, borderRadius: 100 }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Template Picker */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🎨 Game Theme</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
          Choose a visual template that matches your chemistry topic
        </p>
        <TemplatePicker selected={templateId} onChange={setTemplateId} />
      </div>

      {/* Questions */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>❓ Questions ({questions.length})</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>Add MCQ questions with 4 choices</p>
          </div>
          <button
            onClick={addQuestion}
            style={{
              background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white',
              border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >+ Add Question</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {questions.map((q, qi) => (
            <div key={q.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: '#c084fc', fontWeight: 700, fontSize: 15 }}>Q{qi + 1}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} style={smallBtnStyle}>↑</button>
                  <button onClick={() => moveQuestion(qi, 1)} disabled={qi === questions.length - 1} style={smallBtnStyle}>↓</button>
                  <button onClick={() => removeQuestion(qi)} disabled={questions.length === 1} style={{ ...smallBtnStyle, color: '#fca5a5' }}>✕</button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Question Text *</label>
                <textarea
                  value={q.text}
                  onChange={e => updateQuestion(qi, 'text', e.target.value)}
                  placeholder="Enter your question here..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 90, fontSize: 16, lineHeight: 1.5 }}
                />
              </div>

              {/* Per-question timer */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>⏱️ Question Timer</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[null, 5, 10, 15, 20, 30, 45, 60].map(sec => (
                    <button
                      key={sec ?? 'default'}
                      onClick={() => updateQuestion(qi, 'timeSeconds', sec as number)}
                      style={{
                        background: (q.timeSeconds ?? null) === sec ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${(q.timeSeconds ?? null) === sec ? '#c084fc' : 'rgba(255,255,255,0.12)'}`,
                        color: (q.timeSeconds ?? null) === sec ? '#c084fc' : 'rgba(255,255,255,0.6)',
                        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      }}
                    >
                      {sec === null ? 'Default' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  {gameType === 'true-false' ? '✅ Correct Answer — click to mark True or False' : 'Answer Choices * — click the circle to mark the correct answer'}
                </label>
                {gameType === 'true-false' ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['True', 'False'].map((label, ci) => {
                      const isCorrect = q.correctIndex === ci;
                      const col = ci === 0 ? '#22c55e' : '#ef4444';
                      const icon = ci === 0 ? '✅' : '❌';
                      return (
                        <button key={ci} onClick={() => updateQuestion(qi, 'correctIndex', ci)}
                          style={{ flex: 1, background: isCorrect ? `${col}25` : 'rgba(255,255,255,0.06)', border: `2px solid ${isCorrect ? col : 'rgba(255,255,255,0.15)'}`, borderRadius: 14, padding: '18px', color: isCorrect ? col : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                          <span style={{ fontSize: 28 }}>{icon}</span> {label}
                          {isCorrect && <span style={{ fontSize: 20 }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {q.choices.map((choice, ci) => {
                      const choiceColors = ['#e74c3c', '#2980e4', '#f1c40f', '#27ae60'];
                      const isCorrect = q.correctIndex === ci;
                      return (
                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => updateQuestion(qi, 'correctIndex', ci)}
                            style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: isCorrect ? choiceColors[ci] : 'rgba(255,255,255,0.08)', border: isCorrect ? 'none' : `2px solid ${choiceColors[ci]}60`, cursor: 'pointer', color: 'white', fontSize: 15, fontFamily: 'inherit', fontWeight: 800 }}>
                            {isCorrect ? '✓' : String.fromCharCode(65 + ci)}
                          </button>
                          <input value={choice} onChange={e => updateChoice(qi, ci, e.target.value)}
                            placeholder={`Choice ${String.fromCharCode(65 + ci)} — enter answer here`}
                            style={{ ...inputStyle, flex: 1, margin: 0, fontSize: 15, borderColor: isCorrect ? `${choiceColors[ci]}60` : 'rgba(255,255,255,0.15)', background: isCorrect ? `${choiceColors[ci]}12` : 'rgba(255,255,255,0.07)', padding: '13px 14px' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>💡 Explanation (shown after answer — optional)</label>
                <input
                  value={q.explanation || ''}
                  onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  style={{ ...inputStyle, fontSize: 14 }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addQuestion}
          style={{
            width: '100%', marginTop: 16,
            background: 'rgba(192,132,252,0.1)', border: '2px dashed rgba(192,132,252,0.4)',
            color: '#c084fc', borderRadius: 12, padding: 14, fontSize: 15,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          + Add Another Question
        </button>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.08)', color: 'white',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
          padding: '14px 28px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? 'rgba(192,132,252,0.5)' : 'linear-gradient(135deg, #c084fc, #a78bfa)',
            color: 'white', border: 'none', borderRadius: 12, padding: '14px 36px',
            fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
            fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(192,132,252,0.4)',
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Game'}
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.55)',
  fontSize: 12,
  display: 'block',
  marginBottom: 6,
  fontWeight: 500,
};

const smallBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.7)',
  borderRadius: 6,
  width: 28, height: 28,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 14,
};
