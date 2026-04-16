'use client';

import { Player } from '@/lib/game-types';
import { useGameStore } from '@/lib/game-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Zap,
  Heart,
  Calendar,
  Trophy,
  Target,
  Dumbbell,
} from 'lucide-react';

interface PlayerDetailModalProps {
  player: Player;
  onClose: () => void;
}

export function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const { teams, startTraining, userTeamId } = useGameStore();
  const team = teams.find((t) => t.id === player.teamId);
  const isUserTeam = player.teamId === userTeamId;

  const getFormIcon = () => {
    if (player.form > 5) return <TrendingUp className="w-4 h-4" />;
    if (player.form < -5) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getFormColor = () => {
    if (player.form > 5) return 'text-primary';
    if (player.form < -5) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman':
        return 'bg-chart-1/20 text-chart-1';
      case 'bowler':
        return 'bg-chart-3/20 text-chart-3';
      case 'all-rounder':
        return 'bg-chart-2/20 text-chart-2';
      case 'wicket-keeper':
        return 'bg-chart-4/20 text-chart-4';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const overallRating = Math.round(
    (player.batting * (player.role === 'bowler' ? 0.2 : 0.4) +
      player.bowling * (player.role === 'batsman' ? 0.1 : 0.4) +
      player.fielding * 0.2 +
      player.fitness * 0.1 +
      player.experience * 0.1)
  );

  const handleTrain = (type: 'batting' | 'bowling' | 'fielding' | 'fitness') => {
    startTraining(player.id, type);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="sr-only">{player.name}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-secondary to-secondary/50 rounded-lg -mt-2">
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
            <span className="text-3xl font-bold text-primary">{overallRating}</span>
            <span className="text-xs text-muted-foreground">OVR</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn('text-sm', getRoleColor(player.role))}>
                {player.role.replace('-', ' ')}
              </Badge>
              {team && (
                <Badge variant="outline" className="text-sm">
                  {team.name}
                </Badge>
              )}
              {player.injured && (
                <Badge variant="destructive" className="text-sm">
                  Injured ({player.injuryDays} days)
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>{player.age} years old</span>
              <span>{player.battingStyle}</span>
              {player.bowlingStyle !== 'none' && (
                <span>{player.bowlingStyle} bowler</span>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="stats" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            {isUserTeam && <TabsTrigger value="training">Training</TabsTrigger>}
            {!isUserTeam && <TabsTrigger value="career">Career</TabsTrigger>}
          </TabsList>

          <TabsContent value="stats" className="space-y-4 mt-4">
            {/* Career Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{player.stats.matches}</p>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{player.stats.runs}</p>
                  <p className="text-xs text-muted-foreground">Runs</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{player.stats.wickets}</p>
                  <p className="text-xs text-muted-foreground">Wickets</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{player.stats.catches}</p>
                  <p className="text-xs text-muted-foreground">Catches</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Batting
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average</span>
                      <span className="text-foreground font-medium">{player.stats.average.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strike Rate</span>
                      <span className="text-foreground font-medium">{player.stats.strikeRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High Score</span>
                      <span className="text-foreground font-medium">{player.stats.highScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">50s / 100s</span>
                      <span className="text-foreground font-medium">{player.stats.fifties} / {player.stats.centuries}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" /> Bowling
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wickets</span>
                      <span className="text-foreground font-medium">{player.stats.wickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Economy</span>
                      <span className="text-foreground font-medium">{player.stats.economy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Style</span>
                      <span className="text-foreground font-medium capitalize">{player.bowlingStyle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            {/* Skill Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Batting</span>
                  <span className="text-sm text-primary font-bold">{player.batting}</span>
                </div>
                <Progress value={player.batting} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Bowling</span>
                  <span className="text-sm text-primary font-bold">{player.bowling}</span>
                </div>
                <Progress value={player.bowling} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Fielding</span>
                  <span className="text-sm text-primary font-bold">{player.fielding}</span>
                </div>
                <Progress value={player.fielding} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Fitness
                  </span>
                  <span className="text-sm text-primary font-bold">{player.fitness}</span>
                </div>
                <Progress value={player.fitness} className="h-3" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Experience
                  </span>
                  <span className="text-sm text-primary font-bold">{player.experience}</span>
                </div>
                <Progress value={player.experience} className="h-3" />
              </div>
            </div>

            {/* Current State */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent" />
                      <span className="font-medium text-foreground">Form</span>
                    </div>
                    <div className={cn('flex items-center gap-1 font-bold', getFormColor())}>
                      {getFormIcon()}
                      <span>{player.form > 0 ? '+' : ''}{player.form}</span>
                    </div>
                  </div>
                  <Progress
                    value={((player.form + 20) / 40) * 100}
                    className="h-2 mt-3"
                  />
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      <span className="font-medium text-foreground">Fatigue</span>
                    </div>
                    <span className={cn('font-bold', player.fatigue > 60 ? 'text-destructive' : 'text-foreground')}>
                      {player.fatigue}%
                    </span>
                  </div>
                  <Progress
                    value={player.fatigue}
                    className={cn('h-2 mt-3', player.fatigue > 60 && '[&>div]:bg-destructive')}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isUserTeam && (
            <TabsContent value="training" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Send this player for training to improve their skills. Training takes 7 days and the player will be unavailable for matches.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleTrain('batting')}
                  disabled={player.injured}
                >
                  <Target className="w-6 h-6 text-primary" />
                  <span>Batting Camp</span>
                  <span className="text-xs text-muted-foreground">+2-5 Batting</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleTrain('bowling')}
                  disabled={player.injured}
                >
                  <Trophy className="w-6 h-6 text-primary" />
                  <span>Bowling Camp</span>
                  <span className="text-xs text-muted-foreground">+2-5 Bowling</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleTrain('fielding')}
                  disabled={player.injured}
                >
                  <Star className="w-6 h-6 text-primary" />
                  <span>Fielding Drill</span>
                  <span className="text-xs text-muted-foreground">+2-5 Fielding</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => handleTrain('fitness')}
                  disabled={player.injured}
                >
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <span>Fitness Camp</span>
                  <span className="text-xs text-muted-foreground">+Fitness, -Fatigue</span>
                </Button>
              </div>
              {player.injured && (
                <p className="text-sm text-destructive">
                  This player is injured and cannot train.
                </p>
              )}
            </TabsContent>
          )}

          {!isUserTeam && (
            <TabsContent value="career" className="space-y-4 mt-4">
              <Card className="bg-secondary/30 border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="text-foreground font-medium">{player.salary.toFixed(1)} Cr/year</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract</span>
                      <span className="text-foreground font-medium">{player.contractYears} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Potential</span>
                      <span className="text-primary font-medium">{player.potential}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
