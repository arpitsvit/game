'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/game-store';
import { 
  simulateBall, 
  simulateOver, 
  createInnings, 
  getBattingOrder, 
  getBowlingRotation, 
  getNextBowler,
  getMatchResult 
} from '@/lib/match-engine';
import { Player, Innings, BallEvent, Match } from '@/lib/game-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipForward,
  FastForward,
  ArrowLeft,
  Circle,
  Target,
  Zap,
  Users,
  Trophy,
  ChevronRight,
} from 'lucide-react';

type SimulationMode = 'ball' | 'over' | 'innings';
type SimulationState = 'idle' | 'running' | 'paused' | 'innings-break' | 'completed';

interface LiveMatchViewProps {
  onBack: () => void;
}

export function LiveMatchView({ onBack }: LiveMatchViewProps) {
  const { currentMatch, teams, players, currentTournament, finalizeMatch } = useGameStore();
  
  const match = currentMatch;
  const team1 = match ? teams.find(t => t.id === match.team1Id) : null;
  const team2 = match ? teams.find(t => t.id === match.team2Id) : null;
  
  // Simulation state
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('ball');
  const [simulationState, setSimulationState] = useState<SimulationState>('idle');
  const [autoSpeed, setAutoSpeed] = useState(1000); // ms per ball for auto-play
  
  // Match state
  const [tossCompleted, setTossCompleted] = useState(false);
  const [tossWinnerId, setTossWinnerId] = useState<string | null>(null);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | null>(null);
  const [battingFirstId, setBattingFirstId] = useState<string | null>(null);
  
  // Innings state
  const [currentInningsNum, setCurrentInningsNum] = useState(1);
  const [innings1, setInnings1] = useState<Innings | null>(null);
  const [innings2, setInnings2] = useState<Innings | null>(null);
  
  // Ball-by-ball state
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [currentBatsmanIndex, setCurrentBatsmanIndex] = useState(0);
  const [lastBowlerId, setLastBowlerId] = useState<string | null>(null);
  const [ballEvents, setBallEvents] = useState<BallEvent[]>([]);
  
  // Players for current innings
  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [bowlingRotation, setBowlingRotation] = useState<Player[]>([]);
  const [currentBowler, setCurrentBowler] = useState<Player | null>(null);
  
  // Result
  const [matchResult, setMatchResult] = useState<{ winnerId: string; result: string } | null>(null);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const commentaryRef = useRef<HTMLDivElement>(null);
  
  // Get current innings
  const currentInnings = currentInningsNum === 1 ? innings1 : innings2;
  const target = currentInningsNum === 2 && innings1 ? innings1.runs + 1 : undefined;
  
  // Get current batsman
  const currentBatsman = battingOrder[currentBatsmanIndex] || null;
  
  // Initialize teams
  const team1Players = players.filter(p => p.teamId === team1?.id && !p.injured).slice(0, 11);
  const team2Players = players.filter(p => p.teamId === team2?.id && !p.injured).slice(0, 11);
  
  // Start the toss
  const handleToss = () => {
    if (!team1 || !team2) return;
    
    const winner = Math.random() > 0.5 ? team1.id : team2.id;
    const decision: 'bat' | 'bowl' = Math.random() > 0.5 ? 'bat' : 'bowl';
    const battingFirst = decision === 'bat' ? winner : (winner === team1.id ? team2.id : team1.id);
    
    setTossWinnerId(winner);
    setTossDecision(decision);
    setBattingFirstId(battingFirst);
    setTossCompleted(true);
    
    // Setup first innings
    const battingTeamPlayers = battingFirst === team1.id ? team1Players : team2Players;
    const bowlingTeamPlayers = battingFirst === team1.id ? team2Players : team1Players;
    const bowlingTeamId = battingFirst === team1.id ? team2.id : team1.id;
    
    const battingOrderList = getBattingOrder(battingTeamPlayers);
    const bowlingRotationList = getBowlingRotation(bowlingTeamPlayers);
    
    setBattingOrder(battingOrderList);
    setBowlingRotation(bowlingRotationList);
    setCurrentBowler(bowlingRotationList[0]);
    setInnings1(createInnings(battingFirst, bowlingTeamId));
    
    setSimulationState('idle');
  };
  
  // Simulate one ball
  const simulateOneBall = useCallback(() => {
    if (!currentInnings || !currentBatsman || !currentBowler || !team1 || !team2) return;
    if (currentInnings.wickets >= 10 || currentOver >= 20) return;
    if (target && currentInnings.runs >= target) return;
    
    const fieldingTeamPlayers = currentInningsNum === 1 
      ? (battingFirstId === team1.id ? team2Players : team1Players)
      : (battingFirstId === team1.id ? team1Players : team2Players);
    
    const matchSituation = {
      innings: currentInningsNum,
      runs: currentInnings.runs,
      wickets: currentInnings.wickets,
      overs: currentOver + (currentBall / 6),
      target,
    };
    
    const event = simulateBall(
      currentBatsman,
      currentBowler,
      fieldingTeamPlayers,
      currentOver,
      currentBall + 1,
      matchSituation
    );
    
    setBallEvents(prev => [...prev, event]);
    
    // Update innings
    const updatedInnings = { ...currentInnings };
    updatedInnings.runs += event.runs + event.extras;
    updatedInnings.ballEvents = [...updatedInnings.ballEvents, event];
    
    // Handle extras
    let isLegalBall = true;
    if (event.extraType === 'wide') {
      updatedInnings.extras.wides++;
      isLegalBall = false;
    } else if (event.extraType === 'no-ball') {
      updatedInnings.extras.noBalls++;
      isLegalBall = false;
    }
    
    // Update batsman stats
    if (!updatedInnings.batsmanStats[currentBatsman.id]) {
      updatedInnings.batsmanStats[currentBatsman.id] = {
        runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: ''
      };
    }
    
    if (event.extraType !== 'wide') {
      updatedInnings.batsmanStats[currentBatsman.id].balls++;
    }
    updatedInnings.batsmanStats[currentBatsman.id].runs += event.runs;
    if (event.runs === 4) updatedInnings.batsmanStats[currentBatsman.id].fours++;
    if (event.runs === 6) updatedInnings.batsmanStats[currentBatsman.id].sixes++;
    
    // Update bowler stats
    if (!updatedInnings.bowlerStats[currentBowler.id]) {
      updatedInnings.bowlerStats[currentBowler.id] = {
        overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0
      };
    }
    
    if (isLegalBall) {
      updatedInnings.bowlerStats[currentBowler.id].balls++;
    }
    updatedInnings.bowlerStats[currentBowler.id].runs += event.runs + event.extras;
    if (event.extraType === 'wide') updatedInnings.bowlerStats[currentBowler.id].wides++;
    if (event.extraType === 'no-ball') updatedInnings.bowlerStats[currentBowler.id].noBalls++;
    
    // Handle wicket
    let newBatsmanIndex = currentBatsmanIndex;
    if (event.wicket) {
      updatedInnings.wickets++;
      updatedInnings.batsmanStats[currentBatsman.id].isOut = true;
      updatedInnings.batsmanStats[currentBatsman.id].dismissal = event.wicketType || 'out';
      updatedInnings.bowlerStats[currentBowler.id].wickets++;
      newBatsmanIndex++;
      setCurrentBatsmanIndex(newBatsmanIndex);
    }
    
    // Update ball/over counter
    let newBall = currentBall;
    let newOver = currentOver;
    
    if (isLegalBall) {
      newBall++;
      if (newBall >= 6) {
        newBall = 0;
        newOver++;
        updatedInnings.overs = newOver;
        
        // Update bowler overs
        const bowlerBalls = updatedInnings.bowlerStats[currentBowler.id].balls;
        updatedInnings.bowlerStats[currentBowler.id].overs = Math.floor(bowlerBalls / 6);
        updatedInnings.bowlerStats[currentBowler.id].balls = bowlerBalls % 6;
        
        // Get next bowler
        const nextBowler = getNextBowler(bowlingRotation, updatedInnings.bowlerStats, currentBowler.id);
        setLastBowlerId(currentBowler.id);
        setCurrentBowler(nextBowler);
      }
    }
    
    setCurrentBall(newBall);
    setCurrentOver(newOver);
    updatedInnings.balls = newBall;
    
    // Update innings state
    if (currentInningsNum === 1) {
      setInnings1(updatedInnings);
    } else {
      setInnings2(updatedInnings);
    }
    
    // Check for innings end
    const isInningsComplete = updatedInnings.wickets >= 10 || newOver >= 20 || (target && updatedInnings.runs >= target);
    
    if (isInningsComplete) {
      if (currentInningsNum === 1) {
        // Start second innings
        setSimulationState('innings-break');
      } else {
        // Match complete
        const result = getMatchResult(innings1!, updatedInnings, team1, team2, battingFirstId!);
        setMatchResult(result);
        setSimulationState('completed');
        
        // Finalize match and save to store
        if (match) {
          const completedMatch: Match = {
            ...match,
            tossWinnerId: tossWinnerId,
            tossDecision: tossDecision,
            innings: [innings1!, updatedInnings],
            currentInnings: 2,
            status: 'completed',
            winnerId: result.winnerId,
            result: result.result,
          };
          finalizeMatch(match.id, completedMatch);
        }
      }
    }
    
    // Scroll to latest commentary
    setTimeout(() => {
      commentaryRef.current?.scrollTo({ top: commentaryRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, [currentInnings, currentBatsman, currentBowler, team1, team2, currentInningsNum, currentOver, currentBall, currentBatsmanIndex, battingFirstId, team1Players, team2Players, bowlingRotation, target, innings1, match, tossWinnerId, tossDecision, finalizeMatch]);
  
  // Simulate one over
  const simulateOneOver = useCallback(() => {
    for (let i = 0; i < 6; i++) {
      if (currentInnings && (currentInnings.wickets >= 10 || currentOver >= 20)) break;
      if (target && currentInnings && currentInnings.runs >= target) break;
      simulateOneBall();
    }
  }, [simulateOneBall, currentInnings, currentOver, target]);
  
  // Simulate entire innings
  const simulateEntireInnings = useCallback(() => {
    const interval = setInterval(() => {
      if (!currentInnings || currentInnings.wickets >= 10 || currentOver >= 20) {
        clearInterval(interval);
        return;
      }
      if (target && currentInnings.runs >= target) {
        clearInterval(interval);
        return;
      }
      simulateOneBall();
    }, 50);
    
    return () => clearInterval(interval);
  }, [simulateOneBall, currentInnings, currentOver, target]);
  
  // Start second innings
  const startSecondInnings = () => {
    if (!team1 || !team2 || !battingFirstId) return;
    
    const battingTeamId = battingFirstId === team1.id ? team2.id : team1.id;
    const bowlingTeamId = battingFirstId;
    
    const battingTeamPlayers = battingTeamId === team1.id ? team1Players : team2Players;
    const bowlingTeamPlayers = battingTeamId === team1.id ? team2Players : team1Players;
    
    const battingOrderList = getBattingOrder(battingTeamPlayers);
    const bowlingRotationList = getBowlingRotation(bowlingTeamPlayers);
    
    setBattingOrder(battingOrderList);
    setBowlingRotation(bowlingRotationList);
    setCurrentBowler(bowlingRotationList[0]);
    setInnings2(createInnings(battingTeamId, bowlingTeamId));
    
    setCurrentInningsNum(2);
    setCurrentOver(0);
    setCurrentBall(0);
    setCurrentBatsmanIndex(0);
    setLastBowlerId(null);
    setBallEvents([]);
    
    setSimulationState('idle');
  };
  
  // Handle play/pause for auto-play
  const handlePlayPause = () => {
    if (simulationState === 'running') {
      setSimulationState('paused');
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    } else {
      setSimulationState('running');
    }
  };
  
  // Auto-play effect
  useEffect(() => {
    if (simulationState === 'running') {
      autoPlayRef.current = setInterval(() => {
        simulateOneBall();
      }, autoSpeed);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [simulationState, autoSpeed, simulateOneBall]);
  
  // Handle next action based on mode
  const handleNext = () => {
    if (simulationMode === 'ball') {
      simulateOneBall();
    } else if (simulationMode === 'over') {
      // Simulate till end of current over
      const ballsRemaining = 6 - currentBall;
      for (let i = 0; i < ballsRemaining; i++) {
        setTimeout(() => simulateOneBall(), i * 200);
      }
    } else if (simulationMode === 'innings') {
      setSimulationState('running');
      setAutoSpeed(50);
    }
  };
  
  // Format overs
  const formatOvers = (overs: number, balls: number) => {
    return `${overs}.${balls}`;
  };
  
  // Get run rate
  const getRunRate = (runs: number, overs: number, balls: number) => {
    const totalOvers = overs + balls / 6;
    if (totalOvers === 0) return '0.00';
    return (runs / totalOvers).toFixed(2);
  };
  
  // Get required run rate
  const getRequiredRate = () => {
    if (!target || !innings2) return null;
    const remainingRuns = target - innings2.runs;
    const remainingOvers = 20 - currentOver - currentBall / 6;
    if (remainingOvers <= 0) return null;
    return (remainingRuns / remainingOvers).toFixed(2);
  };
  
  if (!match || !team1 || !team2) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No match available</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Match Center
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Pre-toss screen
  if (!tossCompleted) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Match Center
        </Button>
        
        <Card className="bg-card border-border overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 via-secondary to-primary/20 p-8">
            <h1 className="text-3xl font-bold text-center text-foreground mb-8">Match Preview</h1>
            
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div 
                  className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold"
                  style={{ backgroundColor: team1.primaryColor + '30', color: team1.primaryColor }}
                >
                  {team1.shortName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-foreground">{team1.name}</h2>
                <p className="text-sm text-muted-foreground">{team1.homeGround}</p>
              </div>
              
              <div className="text-center px-8">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-muted-foreground">VS</span>
                </div>
                <p className="text-sm text-muted-foreground">{match.venue}</p>
                <p className="text-sm text-muted-foreground">{match.overs} Overs</p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold"
                  style={{ backgroundColor: team2.primaryColor + '30', color: team2.primaryColor }}
                >
                  {team2.shortName.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-foreground">{team2.name}</h2>
                <p className="text-sm text-muted-foreground">{team2.homeGround}</p>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">Choose Simulation Mode</h3>
              
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  variant={simulationMode === 'ball' ? 'default' : 'outline'}
                  onClick={() => setSimulationMode('ball')}
                  className="flex-1 max-w-[150px]"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Ball by Ball
                </Button>
                <Button
                  variant={simulationMode === 'over' ? 'default' : 'outline'}
                  onClick={() => setSimulationMode('over')}
                  className="flex-1 max-w-[150px]"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Over by Over
                </Button>
                <Button
                  variant={simulationMode === 'innings' ? 'default' : 'outline'}
                  onClick={() => setSimulationMode('innings')}
                  className="flex-1 max-w-[150px]"
                >
                  <FastForward className="w-4 h-4 mr-2" />
                  Full Innings
                </Button>
              </div>
              
              <Button size="lg" onClick={handleToss} className="px-12">
                <Zap className="w-5 h-5 mr-2" />
                Start Toss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get current batting and bowling teams
  const currentBattingTeam = currentInningsNum === 1 
    ? (battingFirstId === team1.id ? team1 : team2)
    : (battingFirstId === team1.id ? team2 : team1);
  const currentBowlingTeam = currentInningsNum === 1
    ? (battingFirstId === team1.id ? team2 : team1)
    : (battingFirstId === team1.id ? team1 : team2);
  
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {simulationMode === 'ball' ? 'Ball by Ball' : simulationMode === 'over' ? 'Over by Over' : 'Full Innings'}
          </Badge>
          {simulationState === 'innings-break' && (
            <Badge className="bg-accent text-accent-foreground">Innings Break</Badge>
          )}
          {simulationState === 'completed' && (
            <Badge className="bg-primary text-primary-foreground">Match Complete</Badge>
          )}
        </div>
      </div>
      
      {/* Toss Result */}
      <Card className="bg-secondary/50 border-border">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {tossWinnerId === team1.id ? team1.name : team2.name}
            </span>
            {' '}won the toss and chose to{' '}
            <span className="font-semibold text-foreground">{tossDecision}</span>
          </p>
        </CardContent>
      </Card>
      
      {/* Main Scoreboard */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-gradient-to-r from-secondary via-card to-secondary">
          <div className="p-4">
            {/* Innings Tabs */}
            <Tabs value={`innings-${currentInningsNum}`} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="innings-1" disabled>
                  1st Innings {innings1 && `(${innings1.runs}/${innings1.wickets})`}
                </TabsTrigger>
                <TabsTrigger value="innings-2" disabled>
                  2nd Innings {innings2 && `(${innings2.runs}/${innings2.wickets})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Score Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: currentBattingTeam.primaryColor + '30', color: currentBattingTeam.primaryColor }}
                >
                  {currentBattingTeam.shortName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{currentBattingTeam.shortName}</h2>
                  <p className="text-sm text-muted-foreground">Batting</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">
                  {currentInnings?.runs || 0}
                  <span className="text-2xl text-muted-foreground">/{currentInnings?.wickets || 0}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ({formatOvers(currentOver, currentBall)} ov)
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Run Rate</p>
                <p className="text-xl font-bold text-foreground">
                  {getRunRate(currentInnings?.runs || 0, currentOver, currentBall)}
                </p>
                {target && (
                  <>
                    <p className="text-xs text-muted-foreground mt-1">Required: {getRequiredRate()}</p>
                    <p className="text-xs text-muted-foreground">
                      Need {target - (innings2?.runs || 0)} from {(20 - currentOver) * 6 - currentBall} balls
                    </p>
                  </>
                )}
              </div>
            </div>
            
            {/* This Over */}
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">This Over</p>
              <div className="flex items-center gap-2 flex-wrap">
                {ballEvents.slice(-6).map((event, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                      event.wicket ? 'bg-destructive text-destructive-foreground' :
                      event.runs === 4 ? 'bg-primary text-primary-foreground' :
                      event.runs === 6 ? 'bg-accent text-accent-foreground' :
                      event.extraType ? 'bg-warning text-warning-foreground' :
                      event.runs === 0 ? 'bg-muted text-muted-foreground' :
                      'bg-secondary text-foreground'
                    )}
                  >
                    {event.wicket ? 'W' : 
                     event.extraType === 'wide' ? 'Wd' :
                     event.extraType === 'no-ball' ? 'Nb' :
                     event.runs}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Players */}
        <CardContent className="p-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {/* Batsmen */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" /> At The Crease
              </p>
              {currentBatsman && (
                <div className="p-2 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="font-medium text-foreground text-sm">{currentBatsman.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground text-sm">
                        {currentInnings?.batsmanStats[currentBatsman.id]?.runs || 0}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({currentInnings?.batsmanStats[currentBatsman.id]?.balls || 0})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bowler */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" /> Bowling
              </p>
              {currentBowler && (
                <div className="p-2 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm">{currentBowler.name}</span>
                    <div className="text-right text-sm">
                      <span className="font-bold text-foreground">
                        {currentInnings?.bowlerStats[currentBowler.id]?.wickets || 0}-
                        {currentInnings?.bowlerStats[currentBowler.id]?.runs || 0}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({currentInnings?.bowlerStats[currentBowler.id]?.overs || 0}.
                        {currentInnings?.bowlerStats[currentBowler.id]?.balls || 0})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Commentary */}
      <Card className="bg-card border-border">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Live Commentary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-48" ref={commentaryRef}>
            <div className="p-4 space-y-2">
              {ballEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Commentary will appear here...
                </p>
              ) : (
                [...ballEvents].reverse().map((event, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      'p-2 rounded-lg text-sm',
                      event.wicket ? 'bg-destructive/20 border border-destructive/30' :
                      event.runs >= 4 ? 'bg-primary/10 border border-primary/20' :
                      'bg-secondary/30'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {event.over}.{event.ball}
                      </Badge>
                      <span className={cn(
                        'font-bold text-xs',
                        event.wicket ? 'text-destructive' :
                        event.runs === 6 ? 'text-accent' :
                        event.runs === 4 ? 'text-primary' :
                        'text-foreground'
                      )}>
                        {event.wicket ? 'WICKET!' : 
                         event.runs === 6 ? 'SIX!' :
                         event.runs === 4 ? 'FOUR!' :
                         event.extraType ? event.extraType.toUpperCase() :
                         `${event.runs} run${event.runs !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{event.commentary}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Controls */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          {simulationState === 'innings-break' ? (
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">End of 1st Innings</h3>
              <p className="text-muted-foreground mb-4">
                {currentBattingTeam.name} scored {innings1?.runs}/{innings1?.wickets} in {innings1?.overs} overs
              </p>
              <p className="text-foreground mb-4">
                Target: <span className="font-bold text-primary">{(innings1?.runs || 0) + 1}</span> runs
              </p>
              <Button onClick={startSecondInnings} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Start 2nd Innings
              </Button>
            </div>
          ) : simulationState === 'completed' ? (
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto text-accent mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{matchResult?.result}</h3>
              
              {/* Final Score Summary */}
              <div className="flex justify-center gap-8 mt-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{battingFirstId === team1?.id ? team1?.shortName : team2?.shortName}</p>
                  <p className="text-2xl font-bold text-foreground">{innings1?.runs}/{innings1?.wickets}</p>
                  <p className="text-xs text-muted-foreground">({innings1?.overs} ov)</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{battingFirstId === team1?.id ? team2?.shortName : team1?.shortName}</p>
                  <p className="text-2xl font-bold text-foreground">{innings2?.runs}/{innings2?.wickets}</p>
                  <p className="text-xs text-muted-foreground">({innings2?.overs}.{innings2?.balls || 0} ov)</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={onBack}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              {simulationMode === 'ball' && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePlayPause}
                    disabled={currentInnings?.wickets === 10 || currentOver >= 20}
                  >
                    {simulationState === 'running' ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Auto Play
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={simulationState === 'running' || currentInnings?.wickets === 10 || currentOver >= 20}
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Next Ball
                  </Button>
                </>
              )}
              {simulationMode === 'over' && (
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={currentInnings?.wickets === 10 || currentOver >= 20}
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Simulate Over
                </Button>
              )}
              {simulationMode === 'innings' && simulationState !== 'running' && (
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={currentInnings?.wickets === 10 || currentOver >= 20}
                >
                  <FastForward className="w-5 h-5 mr-2" />
                  Simulate Innings
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
