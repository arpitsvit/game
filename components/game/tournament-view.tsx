'use client';

import { useGameStore } from '@/lib/game-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Calendar,
  Play,
  CheckCircle,
  Circle,
  Medal,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface TournamentViewProps {
  onNavigate: (view: string) => void;
}

export function TournamentView({ onNavigate }: TournamentViewProps) {
  const {
    currentTournament,
    teams,
    userTeamId,
    startTournament,
    season,
  } = useGameStore();

  const sortedTeams = currentTournament
    ? [...teams].sort((a, b) => {
        const aPoints = currentTournament.pointsTable[a.id]?.points || 0;
        const bPoints = currentTournament.pointsTable[b.id]?.points || 0;
        if (bPoints !== aPoints) return bPoints - aPoints;
        const aNrr = currentTournament.pointsTable[a.id]?.nrr || 0;
        const bNrr = currentTournament.pointsTable[b.id]?.nrr || 0;
        return bNrr - aNrr;
      })
    : teams;

  const completedMatches = currentTournament?.matches.filter((m) => m.status === 'completed') || [];
  const upcomingMatches = currentTournament?.matches.filter((m) => m.status === 'scheduled') || [];

  const userTeamPosition = sortedTeams.findIndex((t) => t.id === userTeamId) + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            {currentTournament?.name || `Cricket Premier League Season ${season}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentTournament
              ? `${completedMatches.length} of ${currentTournament.matches.length} matches completed`
              : 'Start a new tournament to begin'}
          </p>
        </div>
        {!currentTournament && (
          <Button size="lg" onClick={startTournament}>
            <Play className="w-5 h-5 mr-2" />
            Start Tournament
          </Button>
        )}
        {currentTournament && currentTournament.stage !== 'completed' && (
          <Button onClick={() => onNavigate('match')}>
            <Calendar className="w-5 h-5 mr-2" />
            Go to Match Center
          </Button>
        )}
      </div>

      {currentTournament && (
        <>
          {/* Your Team Status */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Position</p>
                    <p className="text-3xl font-bold text-foreground">#{userTeamPosition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {currentTournament.pointsTable[userTeamId]?.won || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {currentTournament.pointsTable[userTeamId]?.lost || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {currentTournament.pointsTable[userTeamId]?.points || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      'text-2xl font-bold',
                      (currentTournament.pointsTable[userTeamId]?.nrr || 0) >= 0 ? 'text-primary' : 'text-destructive'
                    )}>
                      {(currentTournament.pointsTable[userTeamId]?.nrr || 0).toFixed(3)}
                    </p>
                    <p className="text-sm text-muted-foreground">NRR</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="standings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="standings">Points Table</TabsTrigger>
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Points Table */}
            <TabsContent value="standings">
              <Card className="bg-card border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-border">
                        <TableHead className="text-muted-foreground w-12">#</TableHead>
                        <TableHead className="text-muted-foreground">Team</TableHead>
                        <TableHead className="text-muted-foreground text-center">P</TableHead>
                        <TableHead className="text-muted-foreground text-center">W</TableHead>
                        <TableHead className="text-muted-foreground text-center">L</TableHead>
                        <TableHead className="text-muted-foreground text-center">NRR</TableHead>
                        <TableHead className="text-muted-foreground text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTeams.map((team, index) => {
                        const stats = currentTournament.pointsTable[team.id];
                        const isUserTeam = team.id === userTeamId;
                        const isQualifyingPosition = index < 4;
                        
                        return (
                          <TableRow
                            key={team.id}
                            className={cn(
                              'border-border',
                              isUserTeam && 'bg-primary/5',
                              isQualifyingPosition && 'border-l-2 border-l-primary'
                            )}
                          >
                            <TableCell className="font-medium">
                              <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                index === 0 && 'bg-accent text-accent-foreground',
                                index === 1 && 'bg-muted text-muted-foreground',
                                index === 2 && 'bg-chart-2/20 text-chart-2',
                                index > 2 && 'bg-secondary text-secondary-foreground'
                              )}>
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                  style={{ backgroundColor: team.primaryColor + '30', color: team.primaryColor }}
                                >
                                  {team.shortName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{team.shortName}</p>
                                  {isUserTeam && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                      Your Team
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-foreground">
                              {stats?.played || 0}
                            </TableCell>
                            <TableCell className="text-center text-primary font-medium">
                              {stats?.won || 0}
                            </TableCell>
                            <TableCell className="text-center text-destructive">
                              {stats?.lost || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                'flex items-center justify-center gap-1',
                                (stats?.nrr || 0) >= 0 ? 'text-primary' : 'text-destructive'
                              )}>
                                {(stats?.nrr || 0) >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {(stats?.nrr || 0).toFixed(3)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-primary/20 text-primary border-0 font-bold">
                                {stats?.points || 0}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground mt-2">
                Top 4 teams qualify for playoffs
              </p>
            </TabsContent>

            {/* Fixtures */}
            <TabsContent value="fixtures">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingMatches.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      All matches completed
                    </p>
                  ) : (
                    upcomingMatches.slice(0, 10).map((match, index) => {
                      const team1 = teams.find((t) => t.id === match.team1Id);
                      const team2 = teams.find((t) => t.id === match.team2Id);
                      const isUserMatch = match.team1Id === userTeamId || match.team2Id === userTeamId;

                      return (
                        <div
                          key={match.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border',
                            isUserMatch ? 'bg-primary/5 border-primary/20' : 'bg-secondary/30 border-border',
                            index === 0 && 'ring-2 ring-primary/30'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {index === 0 ? (
                              <Badge className="bg-primary text-primary-foreground">Next</Badge>
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground">Match {match.matchNumber}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-foreground">{team1?.shortName}</span>
                            <span className="text-muted-foreground">vs</span>
                            <span className="font-medium text-foreground">{team2?.shortName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {match.venue.split(',')[0]}
                          </span>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results */}
            <TabsContent value="results">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completed Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedMatches.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No matches completed yet
                    </p>
                  ) : (
                    [...completedMatches].reverse().slice(0, 15).map((match) => {
                      const team1 = teams.find((t) => t.id === match.team1Id);
                      const team2 = teams.find((t) => t.id === match.team2Id);
                      const winner = teams.find((t) => t.id === match.winnerId);
                      const isUserMatch = match.team1Id === userTeamId || match.team2Id === userTeamId;
                      const userWon = match.winnerId === userTeamId;

                      return (
                        <div
                          key={match.id}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-lg border',
                            isUserMatch
                              ? userWon
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-destructive/5 border-destructive/20'
                              : 'bg-secondary/30 border-border'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Match {match.matchNumber}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              'font-medium',
                              match.winnerId === team1?.id ? 'text-primary' : 'text-foreground'
                            )}>
                              {team1?.shortName}
                            </span>
                            <div className="text-center">
                              <span className="text-muted-foreground">vs</span>
                            </div>
                            <span className={cn(
                              'font-medium',
                              match.winnerId === team2?.id ? 'text-primary' : 'text-foreground'
                            )}>
                              {team2?.shortName}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {winner?.shortName} won
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {match.result.split(' won by ')[1]}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!currentTournament && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Trophy className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Compete?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start a new IPL-style tournament with all 10 teams competing in a round-robin format.
              Top 4 teams will qualify for the playoffs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {teams.slice(0, 10).map((team) => (
                <div
                  key={team.id}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: team.primaryColor + '30', color: team.primaryColor }}
                  title={team.name}
                >
                  {team.shortName.substring(0, 2)}
                </div>
              ))}
            </div>
            <Button size="lg" onClick={startTournament}>
              <Play className="w-5 h-5 mr-2" />
              Start Season {season}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
