import { useState, useEffect } from 'react';
import type { CustomBankFolder, CustomBankQuestion, QuestionType } from '../types';
import type { Theme } from '../theme';
import { getTheme } from '../theme';
import { getCBFolders, saveCBFolder, deleteCBFolder, getCBQuestions, saveCBQuestion, deleteCBQuestion } from '../storage';

interface Props {
  onBack: () => void;
  theme: Theme;
}

const Q_TYPES: { value: QuestionType; label: string; icon: string; desc: string }[] = [
  { value: 'mcq',          label: 'Multiple Choice', icon: '🔘', desc: '4 answer options, one correct' },
  { value: 'true-false',   label: 'True / False',    icon: '✅', desc: 'Students choose True or False' },
  { value: 'yes-no',       label: 'Yes / No',        icon: '👍', desc: 'Students choose Yes or No' },
  { value: 'short-answer', label: 'Short Answer',    icon: '✏️', desc: 'Students type a short answer' },
];

const FOLDER_COLORS = ['#c084fc','#7dd3fc','#fde68a','#6ee7b7','#fca5a5','#a78bfa','#ff6eb4','#34d399','#fb923c','#60a5fa'];
const FOLDER_ICONS  = ['📝','🧪','⚗️','🔬','🧬','⚖️','🔥','🧫','⚡','🌡️','📖','🧲','🎯','💡','🏗️'];

function emptyQ(folderId: string, qtype: QuestionType): CustomBankQuestion {
  return {
    id: crypto.randomUUID(), folderId, text: '', questionType: qtype,
    choices: qtype === 'true-false' ? ['True', 'False', '', ''] : qtype === 'yes-no' ? ['Yes', 'No', '', ''] : ['', '', '', ''],
    correctIndex: 0, explanation: '', createdAt: new Date().toISOString(),
  };
}

export default function CustomBankPage({ onBack, theme }: Props) {
  const th = getTheme(theme);
  const [folders, setFolders] = useState<CustomBankFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<CustomBankFolder | null>(null);
  const [questions, setQuestions] = useState<CustomBankQuestion[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📝');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [editingQ, setEditingQ] = useState<CustomBankQuestion | null>(null);
  const [qtype, setQtype] = useState<QuestionType>('mcq');

  const reload = () => {
    const fs = getCBFolders();
    setFolders(fs);
    if (activeFolder) setQuestions(getCBQuestions(activeFolder.id));
  };
  useEffect(() => { reload(); }, [activeFolder?.id]);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    saveCBFolder({ id: crypto.randomUUID(), name: newFolderName.trim(), icon: newFolderIcon, color: newFolderColor, createdAt: new Date().toISOString() });
    setNewFolderName(''); setShowNewFolder(false); reload();
  };

  const openFolder = (f: CustomBankFolder) => { setActiveFolder(f); setQuestions(getCBQuestions(f.id)); };

  const startNewQ = () => { setEditingQ(emptyQ(activeFolder!.id, qtype)); };

  const saveQ = () => {
    if (!editingQ || !editingQ.text.trim()) return;
    saveCBQuestion(editingQ); setEditingQ(null); reload();
  };

  const card: React.CSSProperties = { background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 20, padding: '20px 22px', boxShadow: th.shadow };
  const inp: React.CSSProperties = { width: '100%', background: th.inputBg, border: `1.5px solid ${th.inputBorder}`, borderRadius: 12, padding: '11px 14px', color: th.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

  // ── Folder list ────────────────────────────────────────────────────────────
  if (!activeFolder) return (
    <div style={{ minHeight: '100vh', padding: '32px 36px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={onBack} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 12, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← Back</button>
        <div>
          <h1 style={{ color: th.text, fontSize: 24, fontWeight: 900, margin: 0 }}>📝 My Question Bank</h1>
          <p style={{ color: th.textMuted, fontSize: 13, margin: '3px 0 0' }}>Create topic folders and build your own question library</p>
        </div>
        <button onClick={() => setShowNewFolder(true)} style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(192,132,252,0.35)', whiteSpace: 'nowrap' }}>
          ➕ New Topic Folder
        </button>
      </div>

      {folders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: th.cardBg, border: `2px dashed ${th.cardBorder}`, borderRadius: 28 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📝</div>
          <div style={{ color: th.text, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>No question folders yet</div>
          <div style={{ color: th.textMuted, fontSize: 15, marginBottom: 24 }}>Create a folder for each topic — e.g. "Atomic Structure", "Organic Chemistry"</div>
          <button onClick={() => setShowNewFolder(true)} style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            ➕ Create First Folder
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18 }}>
          {folders.map(f => {
            const qCount = getCBQuestions(f.id).length;
            return (
              <div key={f.id} style={{ background: th.cardBg, border: `2px solid ${f.color}30`, borderRadius: 22, overflow: 'hidden', transition: 'all 0.25s', boxShadow: th.shadow }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${f.color}25`; e.currentTarget.style.borderColor = `${f.color}60`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = th.shadow; e.currentTarget.style.borderColor = `${f.color}30`; }}>
                <div style={{ height: 5, background: f.color }} />
                <div style={{ padding: '18px 18px 14px', cursor: 'pointer' }} onClick={() => openFolder(f)}>
                  <div style={{ fontSize: 38, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ color: th.text, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{f.name}</div>
                  <div style={{ color: th.textMuted, fontSize: 13 }}>{qCount} question{qCount !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
                  <button onClick={() => openFolder(f)} style={{ flex: 1, background: `${f.color}15`, border: `1px solid ${f.color}40`, color: f.color, borderRadius: 8, padding: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>Open →</button>
                  <button onClick={() => { if (confirm('Delete this folder and all its questions?')) { deleteCBFolder(f.id); reload(); } }}
                    style={{ background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New folder modal */}
      {showNewFolder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24 }}>
          <div style={{ background: th.modalBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: 32, maxWidth: 440, width: '100%', boxShadow: th.shadow }}>
            <h3 style={{ color: th.text, fontWeight: 800, fontSize: 18, marginBottom: 20 }}>📁 New Topic Folder</h3>
            <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Topic name (e.g. Organic Chemistry)" style={{ ...inp, marginBottom: 18 }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_ICONS.map(ic => <button key={ic} onClick={() => setNewFolderIcon(ic)} style={{ width: 40, height: 40, fontSize: 20, background: newFolderIcon === ic ? th.accentLight : th.badge, border: newFolderIcon === ic ? `2px solid ${th.accent}` : `1px solid ${th.cardBorder}`, borderRadius: 10, cursor: 'pointer' }}>{ic}</button>)}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Color</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FOLDER_COLORS.map(c => <button key={c} onClick={() => setNewFolderColor(c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newFolderColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: newFolderColor === c ? `0 0 0 2px ${th.accent}` : 'none' }} />)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNewFolder(false)} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={createFolder} disabled={!newFolderName.trim()} style={{ flex: 2, background: newFolderName.trim() ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : th.badge, color: newFolderName.trim() ? 'white' : th.textFaint, border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: newFolderName.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                ✓ Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Question editor ────────────────────────────────────────────────────────
  const updateQ = (field: keyof CustomBankQuestion, val: unknown) => setEditingQ(prev => prev ? { ...prev, [field]: val } : prev);
  const updateChoice = (ci: number, val: string) => setEditingQ(prev => prev ? { ...prev, choices: prev.choices.map((c, i) => i === ci ? val : c) } : prev);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 36px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveFolder(null)} style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.text, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>← My Bank</button>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${activeFolder.color}20`, border: `2px solid ${activeFolder.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{activeFolder.icon}</div>
        <div>
          <h2 style={{ color: th.text, fontSize: 20, fontWeight: 800, margin: 0 }}>{activeFolder.name}</h2>
          <div style={{ color: th.textMuted, fontSize: 12 }}>{questions.length} questions</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Question type selector */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Q_TYPES.map(t => (
              <button key={t.value} onClick={() => setQtype(t.value)} style={{ background: qtype === t.value ? th.accentLight : th.badge, border: `1px solid ${qtype === t.value ? th.accent + '50' : th.cardBorder}`, borderRadius: 10, padding: '7px 12px', color: qtype === t.value ? th.accent : th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: qtype === t.value ? 700 : 400 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button onClick={startNewQ} style={{ background: 'linear-gradient(135deg, #c084fc, #a78bfa)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(192,132,252,0.35)' }}>
            ➕ Add Question
          </button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: th.cardBg, border: `2px dashed ${th.cardBorder}`, borderRadius: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>❓</div>
          <div style={{ color: th.text, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No questions yet</div>
          <div style={{ color: th.textMuted, fontSize: 14 }}>Pick a question type above and click "Add Question"</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map((q, qi) => {
            const qt = Q_TYPES.find(t => t.value === q.questionType)!;
            return (
              <div key={q.id} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: th.accentLight, border: `1px solid ${th.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: th.accent, flexShrink: 0, marginTop: 2 }}>
                  {qi + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ background: th.badge, borderRadius: 6, padding: '2px 8px', fontSize: 11, color: th.textMuted, fontWeight: 600, flexShrink: 0 }}>{qt.icon} {qt.label}</span>
                  </div>
                  <div style={{ color: th.text, fontWeight: 600, fontSize: 15, direction: 'rtl', unicodeBidi: 'plaintext' }}>{q.text}</div>
                  {q.questionType !== 'short-answer' && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      {q.choices.filter(c => c).map((c, ci) => (
                        <span key={ci} style={{ background: ci === q.correctIndex ? 'rgba(34,197,94,0.15)' : th.badge, border: `1px solid ${ci === q.correctIndex ? 'rgba(34,197,94,0.4)' : th.cardBorder}`, borderRadius: 8, padding: '4px 12px', fontSize: 13, color: ci === q.correctIndex ? '#16a34a' : th.textMuted }}>
                          {ci === q.correctIndex ? '✓ ' : ''}{c}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.questionType === 'short-answer' && q.choices[0] && <div style={{ color: '#16a34a', fontSize: 13, marginTop: 6 }}>✓ Answer: {q.choices[0]}</div>}
                  {q.explanation && <div style={{ color: th.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>💡 {q.explanation}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setEditingQ({ ...q })} style={{ background: th.accentLight, border: `1px solid ${th.accent}40`, color: th.accent, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}>✏️</button>
                  <button onClick={() => { if (confirm('Delete this question?')) { deleteCBQuestion(q.id); reload(); } }}
                    style={{ background: th.danger, border: `1px solid ${th.dangerText}30`, color: th.dangerText, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/New Question modal */}
      {editingQ && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 24, overflowY: 'auto' }}>
          <div style={{ background: th.modalBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: 32, maxWidth: 560, width: '100%', boxShadow: th.shadow, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: th.text, fontWeight: 800, fontSize: 18, margin: 0 }}>
                {Q_TYPES.find(t => t.value === editingQ.questionType)?.icon} {editingQ.id in getCBQuestions().map(q => q.id) ? 'Edit' : 'Add'} Question
              </h3>
              <span style={{ background: th.accentLight, borderRadius: 8, padding: '4px 12px', color: th.accent, fontSize: 12, fontWeight: 700 }}>
                {Q_TYPES.find(t => t.value === editingQ.questionType)?.label}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Question Text *</label>
                <textarea value={editingQ.text} onChange={e => updateQ('text', e.target.value)} rows={3}
                  placeholder="Type your question here..." dir="auto"
                  style={{ ...inp, resize: 'vertical', minHeight: 90 }} />
              </div>

              {editingQ.questionType === 'mcq' && (
                <div>
                  <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Answer Choices — click the circle to mark the correct answer</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {editingQ.choices.map((c, ci) => {
                      const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
                      const isCorrect = editingQ.correctIndex === ci;
                      return (
                        <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => updateQ('correctIndex', ci)} style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isCorrect ? colors[ci] : 'transparent', border: `2px solid ${colors[ci]}`, cursor: 'pointer', color: isCorrect ? 'white' : colors[ci], fontSize: 13, fontFamily: 'inherit', fontWeight: 800 }}>
                            {isCorrect ? '✓' : 'ABCD'[ci]}
                          </button>
                          <input value={c} onChange={e => updateChoice(ci, e.target.value)} placeholder={`Choice ${['A','B','C','D'][ci]}`}
                            style={{ ...inp, flex: 1, borderColor: isCorrect ? `${colors[ci]}60` : th.inputBorder, background: isCorrect ? `${colors[ci]}10` : th.inputBg }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(editingQ.questionType === 'true-false' || editingQ.questionType === 'yes-no') && (
                <div>
                  <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Correct Answer</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {editingQ.choices.slice(0, 2).map((c, ci) => {
                      const isCorrect = editingQ.correctIndex === ci;
                      const col = ci === 0 ? '#26890c' : '#e21b3c';
                      return (
                        <button key={ci} onClick={() => updateQ('correctIndex', ci)} style={{ flex: 1, background: isCorrect ? `${col}20` : th.badge, border: `2px solid ${isCorrect ? col : th.cardBorder}`, borderRadius: 14, padding: '16px', color: isCorrect ? col : th.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, transition: 'all 0.2s' }}>
                          {c} {isCorrect && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {editingQ.questionType === 'short-answer' && (
                <div>
                  <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Expected Answer *</label>
                  <input value={editingQ.choices[0] || ''} onChange={e => { const choices = [...editingQ.choices]; choices[0] = e.target.value; updateQ('choices', choices); }}
                    placeholder="Type the correct answer..." style={inp} />
                </div>
              )}

              <div>
                <label style={{ color: th.textMuted, fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Explanation (optional)</label>
                <input value={editingQ.explanation || ''} onChange={e => updateQ('explanation', e.target.value)}
                  placeholder="Explain why this answer is correct..." style={inp} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setEditingQ(null)} style={{ flex: 1, background: th.badge, border: `1px solid ${th.cardBorder}`, color: th.textMuted, borderRadius: 12, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15 }}>Cancel</button>
              <button onClick={saveQ} disabled={!editingQ.text.trim()} style={{ flex: 2, background: editingQ.text.trim() ? 'linear-gradient(135deg, #c084fc, #a78bfa)' : th.badge, color: editingQ.text.trim() ? 'white' : th.textFaint, border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: editingQ.text.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                ✓ Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
