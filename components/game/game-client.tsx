'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { TeamSelection } from './team-selection';
import { Navigation } from './navigation';
import { Dashboard } from './dashboard';
import { SquadView } from './squad-view';
import { AllPlayersView } from './all-players-view';
import { TournamentView } from './tournament-view';
import { MatchCenter } from './match-center';
import { AcademyView } from './academy-view';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'dashboard' | 'squad' | 'tournament' | 'match' | 'academy' | 'players';

export function GameClient() {
  const { userTeamId, teams, budget, gameDate, initializeGame, resetGame } = useGameStore();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSelectTeam = (teamId: string) => {
    initializeGame(teamId);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    setSidebarOpen(false);
  };

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Cricket Manager...</p>
        </div>
      </div>
    );
  }

  // Show team selection if no team selected
  if (!userTeamId) {
    return <TeamSelection onSelectTeam={handleSelectTeam} />;
  }

  const userTeam = teams.find((t) => t.id === userTeamId);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Navigation
          currentView={currentView}
          onViewChange={handleNavigate}
          teamName={userTeam?.name || ''}
          budget={budget}
          gameDate={gameDate}
        />
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {currentView === 'squad' && <SquadView />}
        {currentView === 'players' && <AllPlayersView />}
        {currentView === 'tournament' && <TournamentView onNavigate={handleNavigate} />}
        {currentView === 'match' && <MatchCenter />}
        {currentView === 'academy' && <AcademyView />}
      </main>
    </div>
  );
}
