'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Player } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Search,
  Star,
  TrendingUp,
  Users,
  Dumbbell,
  Target,
  Trophy,
  ArrowUp,
  Clock,
  Sparkles,
  Building,
  BookOpen,
} from 'lucide-react';

export function AcademyView() {
  const {
    youthAcademy,
    budget,
    scoutYouth,
    promoteYouth,
    upgradeAcademy,
    startTraining,
  } = useGameStore();

  const [selectedYouth, setSelectedYouth] = useState<Player | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);

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

  const handlePromote = () => {
    if (selectedYouth) {
      promoteYouth(selectedYouth.id);
      setSelectedYouth(null);
      setShowPromoteDialog(false);
    }
  };

  const upgradeCost = 5;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Youth Academy
          </h1>
          <p className="text-muted-foreground mt-1">
            Develop future stars and strengthen your squad
          </p>
        </div>
        <Button onClick={scoutYouth}>
          <Search className="w-5 h-5 mr-2" />
          Scout New Talent
        </Button>
      </div>

      {/* Academy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Youth Players</p>
                <p className="text-2xl font-bold text-foreground">
                  {youthAcademy.youthPlayers.length}
                </p>
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
                <p className="text-sm text-muted-foreground">Training Sessions</p>
                <p className="text-2xl font-bold text-foreground">
                  {youthAcademy.trainingSessions.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/20">
                <Dumbbell className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Potential</p>
                <p className="text-2xl font-bold text-primary">
                  {youthAcademy.youthPlayers.length
                    ? Math.round(
                        youthAcademy.youthPlayers.reduce((a, p) => a + p.potential, 0) /
                          youthAcademy.youthPlayers.length
                      )
                    : 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold text-foreground">{budget.toFixed(1)} Cr</p>
              </div>
              <div className="p-3 rounded-lg bg-chart-4/20">
                <Star className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="youth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="youth">Youth Players</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
        </TabsList>

        {/* Youth Players */}
        <TabsContent value="youth" className="space-y-4">
          {youthAcademy.youthPlayers.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Youth Players</h3>
                <p className="text-muted-foreground mb-4">
                  Scout for new talent to add players to your academy
                </p>
                <Button onClick={scoutYouth}>
                  <Search className="w-5 h-5 mr-2" />
                  Scout Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youthAcademy.youthPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedYouth(player)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground">{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn('text-xs', getRoleColor(player.role))}>
                            {player.role.replace('-', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{player.age} yrs</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-primary">{player.potential}</span>
                        <span className="text-[10px] text-muted-foreground">POT</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="text-sm font-bold text-foreground">{player.batting}</p>
                        <p className="text-[10px] text-muted-foreground">BAT</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="text-sm font-bold text-foreground">{player.bowling}</p>
                        <p className="text-[10px] text-muted-foreground">BOWL</p>
                      </div>
                      <div className="text-center p-2 bg-secondary/50 rounded">
                        <p className="text-sm font-bold text-foreground">{player.fielding}</p>
                        <p className="text-[10px] text-muted-foreground">FIELD</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span>High Potential</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedYouth(player);
                        setShowPromoteDialog(true);
                      }}>
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Promote
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Training */}
        <TabsContent value="training" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Active Training Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {youthAcademy.trainingSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  No active training sessions. Select a player to start training.
                </p>
              ) : (
                <div className="space-y-3">
                  {youthAcademy.trainingSessions.map((session) => {
                    const player = youthAcademy.youthPlayers.find((p) => p.id === session.playerId);
                    if (!player) return null;

                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            session.type === 'batting' && 'bg-chart-1/20',
                            session.type === 'bowling' && 'bg-chart-3/20',
                            session.type === 'fielding' && 'bg-chart-2/20',
                            session.type === 'fitness' && 'bg-chart-4/20'
                          )}>
                            {session.type === 'batting' && <Target className="w-5 h-5 text-chart-1" />}
                            {session.type === 'bowling' && <Trophy className="w-5 h-5 text-chart-3" />}
                            {session.type === 'fielding' && <Star className="w-5 h-5 text-chart-2" />}
                            {session.type === 'fitness' && <Dumbbell className="w-5 h-5 text-chart-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{player.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {session.type} training
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">
                              +{session.skillImprovement} skill
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {session.daysRemaining} days left
                            </div>
                          </div>
                          <div className="w-20">
                            <Progress
                              value={((7 - session.daysRemaining) / 7) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Training Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Training sessions last 7 days and improve specific skills.</p>
                <p>Players in training are still available for matches.</p>
                <p>Higher coaching level = better skill improvements.</p>
                <p>Fitness training also reduces fatigue.</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Coaching Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Coaching Level</p>
                    <p className="text-sm text-muted-foreground">
                      +{youthAcademy.coachingLevel} bonus to training
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < youthAcademy.coachingLevel ? 'text-accent fill-accent' : 'text-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Facilities */}
        <TabsContent value="facilities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scouting */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Scouting Network</h3>
                    <p className="text-sm text-muted-foreground">Level {youthAcademy.scoutingLevel}/5</p>
                  </div>
                </div>
                <Progress value={(youthAcademy.scoutingLevel / 5) * 100} className="h-2 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Find {youthAcademy.scoutingLevel + 1} players per scout
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={youthAcademy.scoutingLevel >= 5 || budget < upgradeCost}
                  onClick={() => upgradeAcademy('scouting')}
                >
                  Upgrade ({upgradeCost} Cr)
                </Button>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-accent/20">
                    <Building className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Training Facilities</h3>
                    <p className="text-sm text-muted-foreground">Level {youthAcademy.facilitiesLevel}/5</p>
                  </div>
                </div>
                <Progress value={(youthAcademy.facilitiesLevel / 5) * 100} className="h-2 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Better facilities = faster development
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={youthAcademy.facilitiesLevel >= 5 || budget < upgradeCost}
                  onClick={() => upgradeAcademy('facilities')}
                >
                  Upgrade ({upgradeCost} Cr)
                </Button>
              </CardContent>
            </Card>

            {/* Coaching */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-chart-2/20">
                    <BookOpen className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Coaching Staff</h3>
                    <p className="text-sm text-muted-foreground">Level {youthAcademy.coachingLevel}/5</p>
                  </div>
                </div>
                <Progress value={(youthAcademy.coachingLevel / 5) * 100} className="h-2 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  +{youthAcademy.coachingLevel} skill per training
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={youthAcademy.coachingLevel >= 5 || budget < upgradeCost}
                  onClick={() => upgradeAcademy('coaching')}
                >
                  Upgrade ({upgradeCost} Cr)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Youth Player Detail Dialog */}
      {selectedYouth && !showPromoteDialog && (
        <Dialog open={true} onOpenChange={() => setSelectedYouth(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{selectedYouth.name}</DialogTitle>
              <DialogDescription>
                {selectedYouth.age} years old | {selectedYouth.role.replace('-', ' ')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xl font-bold text-foreground">{selectedYouth.batting}</p>
                  <p className="text-xs text-muted-foreground">Batting</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xl font-bold text-foreground">{selectedYouth.bowling}</p>
                  <p className="text-xs text-muted-foreground">Bowling</p>
                </div>
                <div className="text-center p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xl font-bold text-foreground">{selectedYouth.fielding}</p>
                  <p className="text-xs text-muted-foreground">Fielding</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-xl font-bold text-primary">{selectedYouth.potential}</p>
                  <p className="text-xs text-muted-foreground">Potential</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Start Training</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      startTraining(selectedYouth.id, 'batting');
                      setSelectedYouth(null);
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Batting
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      startTraining(selectedYouth.id, 'bowling');
                      setSelectedYouth(null);
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Bowling
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      startTraining(selectedYouth.id, 'fielding');
                      setSelectedYouth(null);
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Fielding
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      startTraining(selectedYouth.id, 'fitness');
                      setSelectedYouth(null);
                    }}
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Fitness
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedYouth(null)}>
                Close
              </Button>
              <Button onClick={() => setShowPromoteDialog(true)}>
                <ArrowUp className="w-4 h-4 mr-2" />
                Promote to First Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Promote Dialog */}
      {showPromoteDialog && selectedYouth && (
        <Dialog open={true} onOpenChange={() => setShowPromoteDialog(false)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Promote {selectedYouth.name}?</DialogTitle>
              <DialogDescription>
                This will add the player to your first team squad with a 3-year contract.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Potential: <span className="text-primary font-bold">{selectedYouth.potential}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Starting Salary: <span className="text-foreground font-bold">0.5 Cr/year</span>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePromote}>
                Confirm Promotion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
