'use client';

import { useState, useMemo } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Player } from '@/lib/game-types';
import { PlayerCard } from './player-card';
import { PlayerDetailModal } from './player-detail-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react';

export function AllPlayersView() {
  const { teams, players } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || p.role === roleFilter;
        const matchesTeam = teamFilter === 'all' || p.teamId === teamFilter;
        return matchesSearch && matchesRole && matchesTeam;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            const ratingA = (a.batting + a.bowling + a.fielding) / 3;
            const ratingB = (b.batting + b.bowling + b.fielding) / 3;
            return ratingB - ratingA;
          case 'batting':
            return b.batting - a.batting;
          case 'bowling':
            return b.bowling - a.bowling;
          case 'form':
            return b.form - a.form;
          case 'age':
            return a.age - b.age;
          default:
            return 0;
        }
      });
  }, [players, searchTerm, roleFilter, teamFilter, sortBy]);

  const getOverallRating = (player: Player) => {
    return Math.round(
      (player.batting * (player.role === 'bowler' ? 0.2 : 0.4) +
        player.bowling * (player.role === 'batsman' ? 0.1 : 0.4) +
        player.fielding * 0.2 +
        player.fitness * 0.1 +
        player.experience * 0.1)
    );
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Player Database
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredPlayers.length} of {players.length} players
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36 bg-secondary border-border">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="batsman">Batsmen</SelectItem>
                  <SelectItem value="bowler">Bowlers</SelectItem>
                  <SelectItem value="all-rounder">All-rounders</SelectItem>
                  <SelectItem value="wicket-keeper">Wicket-keepers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-44 bg-secondary border-border">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SortAsc className="w-4 h-4 text-muted-foreground ml-2" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 bg-secondary border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="batting">Batting</SelectItem>
                  <SelectItem value="bowling">Bowling</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-muted-foreground">Player</TableHead>
                  <TableHead className="text-muted-foreground">Team</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground text-center">BAT</TableHead>
                  <TableHead className="text-muted-foreground text-center">BOWL</TableHead>
                  <TableHead className="text-muted-foreground text-center">FIELD</TableHead>
                  <TableHead className="text-muted-foreground text-center">Form</TableHead>
                  <TableHead className="text-muted-foreground text-center">OVR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.slice(0, 50).map((player) => {
                  const team = teams.find((t) => t.id === player.teamId);
                  return (
                    <TableRow
                      key={player.id}
                      className="cursor-pointer hover:bg-secondary/50 border-border"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                            {player.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{player.name}</p>
                            <p className="text-xs text-muted-foreground">{player.age} yrs</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-foreground">{team?.shortName || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', getRoleColor(player.role))}>
                          {player.role.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {player.batting}
                      </TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {player.bowling}
                      </TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {player.fielding}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          'flex items-center justify-center gap-1 text-sm font-medium',
                          player.form > 5 ? 'text-primary' : player.form < -5 ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {player.form > 0 ? <TrendingUp className="w-3 h-3" /> : player.form < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                          {player.form > 0 ? '+' : ''}{player.form}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-primary/20 text-primary border-0 font-bold">
                          {getOverallRating(player)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.slice(0, 30).map((player) => {
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <PlayerCard
                key={player.id}
                player={player}
                teamName={team?.shortName}
                onClick={() => setSelectedPlayer(player)}
              />
            );
          })}
        </div>
      )}

      {filteredPlayers.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No players found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
