import { useState, useEffect } from 'react';
import type { AppState, Page, LeaderboardEntry } from './types';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import FolderPage from './pages/FolderPage';
import CreateGamePage from './pages/CreateGamePage';
import PlayGamePage from './pages/PlayGamePage';
import ResultsPage from './pages/ResultsPage';
import BubbleBackground from './components/BubbleBackground';

function App() {
  const [state, setState] = useState<AppState>({
    page: 'home',
    selectedFolderId: null,
    selectedGameId: null,
    editGameId: null,
  });
  const [lastResult, setLastResult] = useState<{ entries: LeaderboardEntry[]; gameId: string } | null>(null);

  const navigate = (page: Page, extra?: Partial<AppState>) => {
    setState(prev => ({ ...prev, page, ...extra }));
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.page !== 'home') {
        if (state.page === 'play-game') navigate('folder', { selectedFolderId: state.selectedFolderId });
        else if (state.page === 'results') navigate('folder', { selectedFolderId: state.selectedFolderId });
        else if (state.page === 'folder') navigate('dashboard');
        else if (state.page === 'create-game') navigate('folder', { selectedFolderId: state.selectedFolderId });
        else navigate('dashboard');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state]);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0933 50%, #0d1f3c 100%)' }}>
      <BubbleBackground />
      <div className="relative z-10">
        {state.page === 'home' && (
          <HomePage onNavigate={navigate} />
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
            onPlayGame={(gameId) => navigate('play-game', { selectedGameId: gameId })}
            onCreateGame={() => navigate('create-game', { editGameId: null })}
            onEditGame={(gameId) => navigate('create-game', { editGameId: gameId })}
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
            onBack={() => navigate('folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
        {state.page === 'results' && lastResult && (
          <ResultsPage
            gameId={lastResult.gameId}
            entries={lastResult.entries}
            onPlayAgain={() => navigate('play-game', { selectedGameId: lastResult.gameId })}
            onBack={() => navigate('folder', { selectedFolderId: state.selectedFolderId })}
          />
        )}
      </div>
    </div>
  );
}

export default App;
