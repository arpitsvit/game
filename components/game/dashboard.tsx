'use client';

import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  ChevronRight,
  Star,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { userTeamId, teams, players, currentTournament, youthAcademy } = useGameStore();

  const userTeam = teams.find((t) => t.id === userTeamId);
  const squadPlayers = players.filter((p) => p.teamId === userTeamId);
  
  const averageForm = squadPlayers.length
    ? squadPlayers.reduce((acc, p) => acc + p.form, 0) / squadPlayers.length
    : 0;
  
  const averageFatigue = squadPlayers.length
    ? squadPlayers.reduce((acc, p) => acc + p.fatigue, 0) / squadPlayers.length
    : 0;

  const injuredCount = squadPlayers.filter((p) => p.injured).length;
  
  const topPerformers = [...squadPlayers]
    .sort((a, b) => b.form - a.form)
    .slice(0, 3);

  const lowFormPlayers = [...squadPlayers]
    .filter((p) => p.form < 0)
    .sort((a, b) => a.form - b.form)
    .slice(0, 3);

  const nextMatch = currentTournament?.matches.find((m) => m.status === 'scheduled');
  const opponent = nextMatch
    ? teams.find((t) => t.id === (nextMatch.team1Id === userTeamId ? nextMatch.team2Id : nextMatch.team1Id))
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{userTeam?.name}</h1>
          <p className="text-muted-foreground mt-1">Season Overview</p>
        </div>
        {currentTournament && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {currentTournament.stage === 'completed' ? 'Season Completed' : `Match ${currentTournament.currentMatchIndex + 1} of ${currentTournament.matches.length}`}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Squad Size</p>
                <p className="text-2xl font-bold text-foreground">{squadPlayers.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {userTeam && userTeam.wins + userTeam.losses > 0
                    ? `${Math.round((userTeam.wins / (userTeam.wins + userTeam.losses)) * 100)}%`
                    : '0%'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {userTeam?.wins}W - {userTeam?.losses}L
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Form</p>
                <p className={`text-2xl font-bold ${averageForm >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {averageForm >= 0 ? '+' : ''}{averageForm.toFixed(1)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${averageForm >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                {averageForm >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-primary" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Fatigue</p>
                <p className="text-2xl font-bold text-foreground">{averageFatigue.toFixed(0)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/20">
                <Activity className="w-6 h-6 text-accent" />
              </div>
            </div>
            <Progress value={averageFatigue} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Match */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Next Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMatch && opponent ? (
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-foreground">{userTeam?.shortName}</p>
                  <p className="text-sm text-muted-foreground">Your Team</p>
                </div>
                <div className="text-center px-6">
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  <p className="text-xs text-muted-foreground mt-1">{nextMatch.venue}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="font-bold text-lg text-foreground">{opponent.shortName}</p>
                  <p className="text-sm text-muted-foreground">{opponent.wins}W - {opponent.losses}L</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming matches</p>
                {!currentTournament && (
                  <Button className="mt-4" onClick={() => onNavigate('tournament')}>
                    Start Tournament
                  </Button>
                )}
              </div>
            )}
            {nextMatch && (
              <Button className="w-full mt-4" onClick={() => onNavigate('match')}>
                Go to Match Center
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Injuries */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-destructive" />
              Injury Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {injuredCount > 0 ? (
              <div className="space-y-3">
                {squadPlayers
                  .filter((p) => p.injured)
                  .map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.role}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {player.injuryDays} days
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-primary font-medium">All players fit!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Player Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Top Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0">
                    +{player.form}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Form */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowFormPlayers.length > 0 ? (
              <div className="space-y-3">
                {lowFormPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-xs text-muted-foreground">Fatigue: {player.fatigue}%</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0">
                      {player.form}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-primary font-medium">All players in good form!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate('squad')}
        >
          <Users className="w-5 h-5" />
          <span>Manage Squad</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate('tournament')}
        >
          <Trophy className="w-5 h-5" />
          <span>Tournament</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate('academy')}
        >
          <Star className="w-5 h-5" />
          <span>Youth Academy</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => onNavigate('players')}
        >
          <Users className="w-5 h-5" />
          <span>All Players</span>
        </Button>
      </div>
    </div>
  );
}
