import { useState, useEffect } from 'react';
import type { AppState, Page, LeaderboardEntry } from './types';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import FolderPage from './pages/FolderPage';
import CreateGamePage from './pages/CreateGamePage';
import PlayGamePage from './pages/PlayGamePage';
import ResultsPage from './pages/ResultsPage';
import StudentPage from './pages/StudentPage';
import HostGamePage from './pages/HostGamePage';
import StudentGamePage from './pages/StudentGamePage';
import BubbleBackground from './components/BubbleBackground';
import AdminPage from './pages/AdminPage';
import TestBankPage from './pages/TestBankPage';

function App() {
  // Pre-fill PIN if URL has ?join=XXXXXX
  const urlParams = new URLSearchParams(window.location.search);
  const urlPin = urlParams.get('join')?.toUpperCase() || null;
  // Admin is accessed via the dashboard, not via URL param (removed ?admin=true for security)

  const [state, setState] = useState<AppState>({
    page: urlPin ? 'student' : 'home',
    selectedFolderId: null,
    selectedGameId: null,
    editGameId: null,
    studentPin: urlPin,
    studentNickname: null,
  });
  const [lastResult, setLastResult] = useState<{ entries: LeaderboardEntry[]; gameId: string } | null>(null);
  const [fromStudent, setFromStudent] = useState(!!urlPin);

  const navigate = (page: Page, extra?: Partial<AppState>) => {
    setState(prev => ({ ...prev, page, ...extra }));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.page !== 'home') {
        if (state.page === 'play-game') navigate(fromStudent ? 'student' : 'folder', { selectedFolderId: state.selectedFolderId });
        else if (state.page === 'results') navigate(fromStudent ? 'student' : 'folder', { selectedFolderId: state.selectedFolderId });
        else if (state.page === 'folder') navigate('dashboard');
        else if (state.page === 'create-game') navigate('folder', { selectedFolderId: state.selectedFolderId });
        else navigate('home');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, fromStudent]);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0933 50%, #0d1f3c 100%)' }}>
      <BubbleBackground />
      <div className="relative z-10">
        <>
        {state.page === 'admin' && (
          <AdminPage onBack={() => navigate('home')} />
        )}
        {state.page === 'test-bank' && (
          <TestBankPage onBack={() => navigate('dashboard')} semester={state.testBankSemester || 's1'} />
        )}
        {state.page === 'home' && (
          <HomePage
            onNavigate={navigate}
            onStudentJoin={() => navigate('student')}
          />
        )}
        {state.page === 'student' && (
          <StudentPage
            initialPin={state.studentPin || undefined}
            onPlayGame={(gameId) => {
              setFromStudent(true);
              navigate('play-game', { selectedGameId: gameId });
            }}
            onJoinLive={(pin, nickname) => {
              navigate('student-game', { studentPin: pin, studentNickname: nickname });
            }}
            onBack={() => navigate('home')}
          />
        )}
        {state.page === 'student-game' && state.studentPin && state.studentNickname && (
          <StudentGamePage
            pin={state.studentPin}
            nickname={state.studentNickname}
            onFinish={() => navigate('home')}
            onBack={() => navigate('student')}
          />
        )}
        {state.page === 'dashboard' && (
          <DashboardPage
            onNavigate={navigate}
            onSelectFolder={(id) => navigate('folder', { selectedFolderId: id })}
          />
        )}
        {state.page === 'folder' && state.selectedFolderId && (
          <FolderPage
            folderId={state.selectedFolderId}
            onNavigate={navigate}
            onPlayGame={(gameId) => { setFromStudent(false); navigate('play-game', { selectedGameId: gameId }); }}
            onHostGame={(gameId) => navigate('host-game', { selectedGameId: gameId })}
            onCreateGame={() => navigate('create-game', { editGameId: null })}
            onEditGame={(gameId) => navigate('create-game', { editGameId: gameId })}
          />
        )}
        {state.page === 'host-game' && state.selectedGameId && (
          <HostGamePage
            gameId={state.selectedGameId}
            onBack={() => navigate('folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
        {state.page === 'create-game' && state.selectedFolderId && (
          <CreateGamePage
            folderId={state.selectedFolderId}
            editGameId={state.editGameId}
            onBack={() => navigate('folder', { selectedFolderId: state.selectedFolderId })}
            onSaved={() => navigate('folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
        {state.page === 'play-game' && state.selectedGameId && (
          <PlayGamePage
            gameId={state.selectedGameId}
            onFinish={(entries) => {
              setLastResult({ entries, gameId: state.selectedGameId! });
              navigate('results', { selectedGameId: state.selectedGameId });
            }}
            onBack={() => navigate(fromStudent ? 'student' : 'folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
        {state.page === 'results' && lastResult && (
          <ResultsPage
            gameId={lastResult.gameId}
            entries={lastResult.entries}
            onPlayAgain={() => navigate('play-game', { selectedGameId: lastResult.gameId })}
            onBack={() => navigate(fromStudent ? 'student' : 'folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
        </>
      </div>
    </div>
  );
}

export default App;
