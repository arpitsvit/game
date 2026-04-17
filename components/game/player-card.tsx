'use client';

import { Player } from '@/lib/game-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  teamName?: string;
  onClick?: () => void;
  compact?: boolean;
}

export function PlayerCard({ player, teamName, onClick, compact = false }: PlayerCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman':
        return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'bowler':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'all-rounder':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'wicket-keeper':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getFormIcon = () => {
    if (player.form > 5) return <TrendingUp className="w-3 h-3" />;
    if (player.form < -5) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getFormColor = () => {
    if (player.form > 5) return 'text-primary';
    if (player.form < -5) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const overallRating = Math.round(
    (player.batting * (player.role === 'bowler' ? 0.2 : 0.4) +
      player.bowling * (player.role === 'batsman' ? 0.1 : 0.4) +
      player.fielding * 0.2 +
      player.fitness * 0.1 +
      player.experience * 0.1)
  );

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors',
          onClick && 'cursor-pointer'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground">
            {player.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{player.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className={cn('text-xs px-1.5 py-0', getRoleColor(player.role))}>
                {player.role.replace('-', ' ')}
              </Badge>
              {player.injured && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                  Injured
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={cn('flex items-center gap-1 text-xs', getFormColor())}>
              {getFormIcon()}
              <span>{player.form > 0 ? '+' : ''}{player.form}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>{player.fatigue}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{overallRating}</span>
          </div>
          {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
    );
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'bg-card border-border hover:border-primary/50 transition-all overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-lg'
      )}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-secondary to-secondary/50 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">{player.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-xs', getRoleColor(player.role))}>
                  {player.role.replace('-', ' ')}
                </Badge>
                {teamName && (
                  <span className="text-xs text-muted-foreground">{teamName}</span>
                )}
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
              <span className="text-xl font-bold text-primary">{overallRating}</span>
              <span className="text-[10px] text-muted-foreground">OVR</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 space-y-3">
          {/* Main Skills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{player.batting}</p>
              <p className="text-xs text-muted-foreground">BAT</p>
            </div>
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{player.bowling}</p>
              <p className="text-xs text-muted-foreground">BOWL</p>
            </div>
            <div className="text-center p-2 bg-secondary/50 rounded-lg">
              <p className="text-lg font-bold text-foreground">{player.fielding}</p>
              <p className="text-xs text-muted-foreground">FIELD</p>
            </div>
          </div>

          {/* Form & Fatigue */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" /> Form
                </span>
                <span className={getFormColor()}>
                  {player.form > 0 ? '+' : ''}{player.form}
                </span>
              </div>
              <Progress
                value={((player.form + 20) / 40) * 100}
                className="h-1.5"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Fatigue
                </span>
                <span className={player.fatigue > 60 ? 'text-destructive' : 'text-foreground'}>
                  {player.fatigue}%
                </span>
              </div>
              <Progress
                value={player.fatigue}
                className={cn('h-1.5', player.fatigue > 60 && '[&>div]:bg-destructive')}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{player.fitness} Fitness</span>
            </div>
            <span>{player.age} years</span>
            <span>{player.experience} XP</span>
          </div>

          {/* Injury Status */}
          {player.injured && (
            <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-xs text-destructive font-medium">
                Injured - {player.injuryDays} days remaining
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
