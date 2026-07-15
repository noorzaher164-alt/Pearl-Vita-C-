import { useState, useEffect } from 'react';
import type { Game, GameType, Question } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { getGameById, saveGame } from '../storage';
import TemplatePicker from '../components/TemplatePicker';

interface Props {
  folderId: string;
  editGameId: string | null;
  onBack: () => void;
  onSaved: () => void;
  theme?: Theme;
}

const GAME_TYPES: { value: GameType; label: string; icon: string; competitive: boolean; desc: string; color: string }[] = [
  { value: 'quiz', label: 'Quiz', icon: '❓', competitive: true, desc: 'A series of multiple choice questions. Tap the correct answer to proceed.', color: '#e21b3c' },
  { value: 'gameshow-quiz', label: 'Gameshow Quiz', icon: '🎬', competitive: true, desc: 'A multiple choice quiz with time pressure, lifelines and a bonus round.', color: '#1368ce' },
  { value: 'matching-pairs', label: 'Matching Pairs', icon: '🃏', competitive: true, desc: 'Tap a pair of tiles at a time to reveal if they are a match.', color: '#9c27b0' },
  { value: 'spin-the-wheel', label: 'Spin the Wheel', icon: '🎡', competitive: true, desc: 'Spin the wheel to see which item comes up next.', color: '#d89e00' },
  { value: 'open-the-box', label: 'Open the Box', icon: '📦', competitive: true, desc: 'Tap each box in turn to open them up and reveal the item inside.', color: '#e21b3c' },
  { value: 'find-the-match', label: 'Find the Match', icon: '🎯', competitive: true, desc: 'Tap the matching answer to eliminate it. Repeat until all answers are gone.', color: '#26890c' },
  { value: 'anagram', label: 'Anagram', icon: '🔤', competitive: false, desc: 'Drag the letters into their correct positions to unscramble the word or phrase.', color: '#1368ce' },
  { value: 'unjumble', label: 'Unjumble', icon: '🔀', competitive: false, desc: 'Drag and drop words to rearrange each sentence into its correct order.', color: '#9c27b0' },
  { value: 'match-up', label: 'Match Up', icon: '🔗', competitive: false, desc: 'Drag and drop each keyword next to its definition.', color: '#d89e00' },
  { value: 'group-sort', label: 'Group Sort', icon: '🗂️', competitive: false, desc: 'Drag and drop each item into its correct group.', color: '#26890c' },
  { value: 'flash-cards', label: 'Flash Cards', icon: '📋', competitive: false, desc: 'Test yourself using cards with prompts on the front and answers on the back.', color: '#e21b3c' },
  { value: 'wordsearch', label: 'Wordsearch', icon: '🔍', competitive: false, desc: 'Words are hidden in a letter grid. Find them as fast as you can.', color: '#1368ce' },
  { value: 'crossword', label: 'Crossword', icon: '✏️', competitive: false, desc: 'Use the clues to solve the crossword. Tap on a word and type in the answer.', color: '#9c27b0' },
  { value: 'complete-the-sentence', label: 'Complete the Sentence', icon: '📝', competitive: false, desc: 'A cloze activity where you drag and drop words into blank spaces within a text.', color: '#d89e00' },
  { value: 'spell-the-word', label: 'Spell the Word', icon: '🔡', competitive: false, desc: 'Drag or type the letters to their correct positions to spell the answer.', color: '#26890c' },
  { value: 'speaking-cards', label: 'Speaking Cards', icon: '🗣️', competitive: false, desc: 'Deal out cards at random from a shuffled deck.', color: '#e21b3c' },
  { value: 'flip-tiles', label: 'Flip Tiles', icon: '🔄', competitive: false, desc: 'Explore a series of two sided tiles by tapping to zoom and swiping to flip.', color: '#1368ce' },
  { value: 'labelled-diagram', label: 'Labelled Diagram', icon: '🗺️', competitive: false, desc: 'Drag and drop the pins to their place on the image.', color: '#9c27b0' },
];

function emptyQuestion(): Question {
  return { id: crypto.randomUUID(), text: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' };
}

export default function CreateGamePage({ folderId, editGameId, onBack, onSaved, theme = 'dark' }: Props) {
  const C = getTheme(theme);
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [gameType, setGameType] = useState<GameType>('quiz');
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

  const changeGameType = (val: GameType) => {
    setGameType(val);
  };

  const updateQuestion = (idx: number, field: keyof Question, value: string | number | string[]) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };
  const updateChoice = (qIdx: number, cIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, choices: q.choices.map((c, j) => j === cIdx ? value : c) } : q));
  };
  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (idx: number) => { if (questions.length > 1) setQuestions(prev => prev.filter((_, i) => i !== idx)); };
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
    const isTF = false;
    questions.forEach((q, i) => {
      if (!q.text.trim()) errs.push(`Question ${i + 1}: text is required`);
      (isTF ? q.choices.slice(0, 2) : q.choices).forEach((c, j) => {
        if (!c.trim()) errs.push(`Question ${i + 1}: Choice ${j + 1} is required`);
      });
    });
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setSaving(true);
    const sel = GAME_TYPES.find(t => t.value === gameType)!;
    const game: Game = {
      id: editGameId || crypto.randomUUID(),
      title: title.trim(),
      folderId,
      lessonName: lessonName.trim(),
      gameType,
      questions,
      isCompetitive: sel.competitive,
      templateId,
      createdAt: editGameId ? (getGameById(editGameId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
    saveGame(game);
    setTimeout(() => { setSaving(false); onSaved(); }, 600);
  };

  // Theme-derived styles
  const cardStyle: React.CSSProperties = {
    background: C.cardBg,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 10,
    padding: '11px 14px',
    color: C.text,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    color: C.textMuted,
    fontSize: 12,
    display: 'block',
    marginBottom: 6,
    fontWeight: 600,
  };

  const smallBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.08)' : '#e9e4f0',
    border: `1px solid ${C.cardBorder}`,
    color: C.textMuted,
    borderRadius: 6,
    width: 28, height: 28,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
  };

  const sel = GAME_TYPES.find(t => t.value === gameType)!;

  return (
    <div style={{ minHeight: '100vh', padding: 24, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={onBack} style={{
          background: isDark ? 'rgba(255,255,255,0.1)' : '#ede9fe',
          border: `1px solid ${C.cardBorder}`,
          color: C.text,
          borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
        }}>← Back</button>
        <h1 style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg, #f093fb, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          {editGameId ? '✏️ Edit Game' : '✨ Create New Game'}
        </h1>
      </div>

      {errors.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ color: '#dc2626', fontWeight: 700, marginBottom: 8 }}>Please fix:</p>
          {errors.map((e, i) => <p key={i} style={{ color: '#dc2626', fontSize: 13, margin: '2px 0' }}>• {e}</p>)}
        </div>
      )}

      {/* Basic Info */}
      <div style={cardStyle}>
        <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Game Info</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Game Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Organic Chemistry Quiz" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Lesson Name *</label>
            <input value={lessonName} onChange={e => setLessonName(e.target.value)} placeholder="e.g. Introduction to Alkanes" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Game Type */}
      <div style={cardStyle}>
        <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🎮 Pick a Game Type</h2>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 24 }}>Choose the type of activity you want to create.</p>

        {/* Selected type big banner */}
        <div style={{ background: `${sel.color}18`, border: `2px solid ${sel.color}`, borderRadius: 18, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 90, height: 90, borderRadius: 24,
            background: `linear-gradient(135deg, ${sel.color}35, ${sel.color}15)`,
            border: `3px solid ${sel.color}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52, flexShrink: 0,
            boxShadow: `0 8px 24px ${sel.color}40`,
          }}>
            {sel.icon}
          </div>
          <div>
            <div style={{ color: sel.color, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{sel.competitive ? '⚔️ LIVE MULTIPLAYER' : '📚 SOLO PRACTICE'}</div>
            <div style={{ color: C.text, fontSize: 20, fontWeight: 800 }}>{sel.label}</div>
            <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>{sel.desc}</div>
          </div>
        </div>

        {/* Live competitive */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ background: '#e21b3c', color: 'white', borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>⚔️ LIVE</span>
            <span style={{ color: C.textMuted, fontSize: 12 }}>Teacher hosts — all students compete together on the big screen</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {GAME_TYPES.filter(t => t.competitive).map(t => {
              const isSelected = gameType === t.value;
              return (
                <button key={t.value} onClick={() => changeGameType(t.value)} style={{
                  background: isSelected ? `${t.color}22` : C.cardBg,
                  border: `2px solid ${isSelected ? t.color : C.cardBorder}`,
                  borderRadius: 16, padding: '16px 12px', color: C.text,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: 20,
                    background: `linear-gradient(135deg, ${t.color}30, ${t.color}15)`,
                    border: `2px solid ${t.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38,
                    boxShadow: isSelected ? `0 4px 16px ${t.color}50` : 'none',
                    transition: 'all 0.2s',
                  }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{t.label}</div>
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
            <span style={{ color: C.textMuted, fontSize: 12 }}>Students practice on their own device at their own pace</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {GAME_TYPES.filter(t => !t.competitive).map(t => {
              const isSelected = gameType === t.value;
              return (
                <button key={t.value} onClick={() => changeGameType(t.value)} style={{
                  background: isSelected ? `${t.color}22` : C.cardBg,
                  border: `2px solid ${isSelected ? t.color : C.cardBorder}`,
                  borderRadius: 16, padding: '16px 12px', color: C.text,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: 20,
                    background: `linear-gradient(135deg, ${t.color}30, ${t.color}15)`,
                    border: `2px solid ${t.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38,
                    boxShadow: isSelected ? `0 4px 16px ${t.color}50` : 'none',
                    transition: 'all 0.2s',
                  }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{t.label}</div>
                  {isSelected && <div style={{ width: 24, height: 3, background: t.color, borderRadius: 100 }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Template Picker */}
      <div style={cardStyle}>
        <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🎨 Game Theme</h2>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>Choose a visual template that matches your chemistry topic</p>
        <TemplatePicker selected={templateId} onChange={setTemplateId} />
      </div>

      {/* Questions */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>❓ Questions ({questions.length})</h2>
            <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Add questions with 4 choices</p>
          </div>
          <button onClick={addQuestion} style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Question</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {questions.map((q, qi) => (
            <div key={q.id} style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f3ff', border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: '#9333ea', fontWeight: 700, fontSize: 15 }}>Q{qi + 1}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => moveQuestion(qi, -1)} disabled={qi === 0} style={smallBtnStyle}>↑</button>
                  <button onClick={() => moveQuestion(qi, 1)} disabled={qi === questions.length - 1} style={smallBtnStyle}>↓</button>
                  <button onClick={() => removeQuestion(qi)} disabled={questions.length === 1} style={{ ...smallBtnStyle, color: '#dc2626' }}>✕</button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Question Text *</label>
                <textarea value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} placeholder="Enter your question here..." rows={3} dir="auto"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 90, fontSize: 16, lineHeight: 1.5 }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>⏱️ Question Timer</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[null, 5, 10, 15, 20, 30, 45, 60].map(sec => {
                    const isActive = (q.timeSeconds ?? null) === sec;
                    return (
                      <button key={sec ?? 'default'} onClick={() => updateQuestion(qi, 'timeSeconds', sec as number)} style={{
                        background: isActive ? 'rgba(147,51,234,0.15)' : C.cardBg,
                        border: `1px solid ${isActive ? '#9333ea' : C.inputBorder}`,
                        color: isActive ? '#9333ea' : C.textMuted,
                        borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      }}>{sec === null ? 'Default' : `${sec}s`}</button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>
                  {'Answer Choices * — click the circle to mark the correct answer'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {q.choices.map((choice, ci) => {
                      const choiceColors = ['#e74c3c', '#2980e4', '#f1c40f', '#27ae60'];
                      const isCorrect = q.correctIndex === ci;
                      return (
                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => updateQuestion(qi, 'correctIndex', ci)}
                            style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: isCorrect ? choiceColors[ci] : C.cardBg, border: isCorrect ? 'none' : `2px solid ${choiceColors[ci]}`, cursor: 'pointer', color: isCorrect ? 'white' : choiceColors[ci], fontSize: 15, fontFamily: 'inherit', fontWeight: 800 }}>
                            {isCorrect ? '✓' : String.fromCharCode(65 + ci)}
                          </button>
                          <input value={choice} onChange={e => updateChoice(qi, ci, e.target.value)}
                            placeholder={`Choice ${String.fromCharCode(65 + ci)}`} dir="auto"
                            style={{ ...inputStyle, flex: 1, margin: 0, fontSize: 15, borderColor: isCorrect ? choiceColors[ci] : C.inputBorder, background: isCorrect ? `${choiceColors[ci]}12` : C.inputBg, padding: '13px 14px' }} />
                        </div>
                      );
                    })}
                  </div>
              </div>

              <div>
                <label style={labelStyle}>💡 Explanation (shown after answer — optional)</label>
                <input value={q.explanation || ''} onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  style={{ ...inputStyle, fontSize: 14 }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={addQuestion} style={{
          width: '100%', marginTop: 16,
          background: isDark ? 'rgba(192,132,252,0.08)' : '#ede9fe',
          border: `2px dashed ${isDark ? 'rgba(192,132,252,0.4)' : '#c084fc'}`,
          color: '#9333ea', borderRadius: 12, padding: 14, fontSize: 15,
          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>+ Add Another Question</button>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#ede9fe', color: C.text, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '14px 28px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ background: saving ? 'rgba(192,132,252,0.5)' : 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(192,132,252,0.4)' }}>
          {saving ? '⏳ Saving...' : '💾 Save Game'}
        </button>
      </div>
    </div>
  );
}
