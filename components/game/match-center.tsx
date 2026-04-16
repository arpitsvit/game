'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Play,
  FastForward,
  SkipForward,
  Trophy,
  Users,
  Target,
  Activity,
  Zap,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export function MatchCenter() {
  const {
    currentMatch,
    currentTournament,
    teams,
    players,
    userTeamId,
    simulateMatch,
    playNextMatch,
    processDay,
  } = useGameStore();

  const [isSimulating, setIsSimulating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const match = currentMatch;
  const team1 = match ? teams.find((t) => t.id === match.team1Id) : null;
  const team2 = match ? teams.find((t) => t.id === match.team2Id) : null;
  
  const isUserMatch = match && (match.team1Id === userTeamId || match.team2Id === userTeamId);
  const userTeam = isUserMatch ? teams.find((t) => t.id === userTeamId) : null;
  const opponent = isUserMatch
    ? teams.find((t) => t.id === (match?.team1Id === userTeamId ? match?.team2Id : match?.team1Id))
    : null;

  const team1Players = players.filter((p) => p.teamId === match?.team1Id && !p.injured);
  const team2Players = players.filter((p) => p.teamId === match?.team2Id && !p.injured);

  const getTeamStrength = (teamPlayers: typeof players) => {
    if (teamPlayers.length === 0) return 0;
    return Math.round(
      teamPlayers.reduce((acc, p) => {
        const formBonus = p.form / 10;
        const fatiguePenalty = p.fatigue / 50;
        return acc + (p.batting + p.bowling + p.fielding) / 3 + formBonus - fatiguePenalty;
      }, 0) / teamPlayers.length
    );
  };

  const handleSimulate = () => {
    if (!match) return;
    setIsSimulating(true);
    
    // Simulate with delay for dramatic effect
    setTimeout(() => {
      simulateMatch(match.id);
      setIsSimulating(false);
      setShowResult(true);
    }, 2000);
  };

  const handleNextMatch = () => {
    playNextMatch();
    processDay();
    setShowResult(false);
  };

  if (!currentTournament) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Active Tournament</h2>
            <p className="text-muted-foreground mb-6">
              Start a tournament to play matches
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Tournament Complete!</h2>
            <p className="text-muted-foreground">
              The tournament has ended. Check the standings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Match Center</h1>
          <p className="text-muted-foreground mt-1">
            Match {currentTournament.currentMatchIndex + 1} of {currentTournament.matches.length}
          </p>
        </div>
        <Badge
          variant={match.status === 'completed' ? 'default' : 'secondary'}
          className="text-sm px-4 py-1"
        >
          {match.status === 'completed' ? 'Completed' : match.status === 'live' ? 'Live' : 'Upcoming'}
        </Badge>
      </div>

      {/* Match Card */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-secondary via-secondary/80 to-secondary p-6">
          <div className="text-center mb-2">
            <span className="text-sm text-muted-foreground">{match.venue}</span>
          </div>
          
          <div className="flex items-center justify-between">
            {/* Team 1 */}
            <div className={cn(
              'text-center flex-1 p-4 rounded-lg transition-colors',
              match.status === 'completed' && match.winnerId === team1?.id && 'bg-primary/10'
            )}>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: team1?.primaryColor + '30', color: team1?.primaryColor }}
              >
                {team1?.shortName.charAt(0)}
              </div>
              <h3 className="font-bold text-lg text-foreground">{team1?.shortName}</h3>
              <p className="text-sm text-muted-foreground">{team1?.name}</p>
              {match.status === 'completed' && match.innings[0] && (
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">
                    {match.innings[0].battingTeamId === team1?.id ? match.innings[0].runs : match.innings[1]?.runs || 0}
                    <span className="text-sm text-muted-foreground">
                      /{match.innings[0].battingTeamId === team1?.id ? match.innings[0].wickets : match.innings[1]?.wickets || 0}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({match.innings[0].battingTeamId === team1?.id ? match.innings[0].overs : match.innings[1]?.overs || 0} ov)
                  </p>
                </div>
              )}
              {match.status === 'completed' && match.winnerId === team1?.id && (
                <Badge className="mt-2 bg-primary text-primary-foreground">Winner</Badge>
              )}
            </div>

            {/* VS */}
            <div className="px-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">VS</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">{match.overs} Overs</p>
            </div>

            {/* Team 2 */}
            <div className={cn(
              'text-center flex-1 p-4 rounded-lg transition-colors',
              match.status === 'completed' && match.winnerId === team2?.id && 'bg-primary/10'
            )}>
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: team2?.primaryColor + '30', color: team2?.primaryColor }}
              >
                {team2?.shortName.charAt(0)}
              </div>
              <h3 className="font-bold text-lg text-foreground">{team2?.shortName}</h3>
              <p className="text-sm text-muted-foreground">{team2?.name}</p>
              {match.status === 'completed' && match.innings[1] && (
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">
                    {match.innings[1].battingTeamId === team2?.id ? match.innings[1].runs : match.innings[0].runs}
                    <span className="text-sm text-muted-foreground">
                      /{match.innings[1].battingTeamId === team2?.id ? match.innings[1].wickets : match.innings[0].wickets}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({match.innings[1].battingTeamId === team2?.id ? match.innings[1].overs : match.innings[0].overs} ov)
                  </p>
                </div>
              )}
              {match.status === 'completed' && match.winnerId === team2?.id && (
                <Badge className="mt-2 bg-primary text-primary-foreground">Winner</Badge>
              )}
            </div>
          </div>

          {/* Result */}
          {match.status === 'completed' && (
            <div className="text-center mt-6 p-4 bg-background/50 rounded-lg">
              <p className="text-lg font-semibold text-foreground">{match.result}</p>
              {match.tossWinnerId && (
                <p className="text-sm text-muted-foreground mt-1">
                  {teams.find((t) => t.id === match.tossWinnerId)?.shortName} won toss and chose to {match.tossDecision}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <CardContent className="p-4">
          {match.status === 'scheduled' && (
            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="w-full max-w-md"
                onClick={handleSimulate}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Simulating Match...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Simulate Match
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                The match will be simulated based on team strengths, player form, and fatigue
              </p>
            </div>
          )}

          {match.status === 'completed' && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleNextMatch}
            >
              <SkipForward className="w-5 h-5 mr-2" />
              Continue to Next Match
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Team Comparison */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Team Comparison</TabsTrigger>
          <TabsTrigger value="squads">Playing Squads</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team Strengths */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Team Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{team1?.shortName}</span>
                    <span className="text-sm font-bold text-primary">{getTeamStrength(team1Players)}</span>
                  </div>
                  <Progress value={getTeamStrength(team1Players)} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{team2?.shortName}</span>
                    <span className="text-sm font-bold text-primary">{getTeamStrength(team2Players)}</span>
                  </div>
                  <Progress value={getTeamStrength(team2Players)} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Form & Fatigue */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Form & Fatigue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{team1?.shortName} Avg Form</p>
                    <p className={cn(
                      'text-xl font-bold',
                      team1Players.reduce((a, p) => a + p.form, 0) / team1Players.length >= 0 ? 'text-primary' : 'text-destructive'
                    )}>
                      {team1Players.length ? (team1Players.reduce((a, p) => a + p.form, 0) / team1Players.length).toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{team2?.shortName} Avg Form</p>
                    <p className={cn(
                      'text-xl font-bold',
                      team2Players.reduce((a, p) => a + p.form, 0) / team2Players.length >= 0 ? 'text-primary' : 'text-destructive'
                    )}>
                      {team2Players.length ? (team2Players.reduce((a, p) => a + p.form, 0) / team2Players.length).toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{team1?.shortName} Avg Fatigue</p>
                    <p className="text-xl font-bold text-foreground">
                      {team1Players.length ? Math.round(team1Players.reduce((a, p) => a + p.fatigue, 0) / team1Players.length) : 0}%
                    </p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{team2?.shortName} Avg Fatigue</p>
                    <p className="text-xl font-bold text-foreground">
                      {team2Players.length ? Math.round(team2Players.reduce((a, p) => a + p.fatigue, 0) / team2Players.length) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Season Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Season Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{team1?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {team1?.wins}W - {team1?.losses}L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{team1?.points}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{team2?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {team2?.wins}W - {team2?.losses}L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{team2?.points}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="squads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team 1 Squad */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: team1?.primaryColor }} />
                  {team1?.shortName} Squad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {team1Players.slice(0, 11).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        player.form > 0 ? 'border-primary text-primary' : player.form < 0 ? 'border-destructive text-destructive' : ''
                      )}>
                        {player.form > 0 ? '+' : ''}{player.form}
                      </Badge>
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {Math.round((player.batting + player.bowling + player.fielding) / 3)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team 2 Squad */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: team2?.primaryColor }} />
                  {team2?.shortName} Squad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {team2Players.slice(0, 11).map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        player.form > 0 ? 'border-primary text-primary' : player.form < 0 ? 'border-destructive text-destructive' : ''
                      )}>
                        {player.form > 0 ? '+' : ''}{player.form}
                      </Badge>
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {Math.round((player.batting + player.bowling + player.fielding) / 3)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
