'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Player } from '@/lib/game-types';
import { PlayerCard } from './player-card';
import { PlayerDetailModal } from './player-detail-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Filter, SortAsc } from 'lucide-react';

export function SquadView() {
  const { userTeamId, teams, players } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const userTeam = teams.find((t) => t.id === userTeamId);
  const squadPlayers = players.filter((p) => p.teamId === userTeamId);

  const filteredPlayers = squadPlayers
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          const ratingA = (a.batting + a.bowling + a.fielding) / 3;
          const ratingB = (b.batting + b.bowling + b.fielding) / 3;
          return ratingB - ratingA;
        case 'form':
          return b.form - a.form;
        case 'fatigue':
          return a.fatigue - b.fatigue;
        default:
          return 0;
      }
    });

  const roleGroups = {
    batsman: squadPlayers.filter((p) => p.role === 'batsman'),
    bowler: squadPlayers.filter((p) => p.role === 'bowler'),
    'all-rounder': squadPlayers.filter((p) => p.role === 'all-rounder'),
    'wicket-keeper': squadPlayers.filter((p) => p.role === 'wicket-keeper'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            {userTeam?.name} Squad
          </h1>
          <p className="text-muted-foreground mt-1">
            {squadPlayers.length} players | {squadPlayers.filter((p) => p.injured).length} injured
          </p>
        </div>

        {/* Squad Composition */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {roleGroups.batsman.length} BAT
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {roleGroups.bowler.length} BOWL
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {roleGroups['all-rounder'].length} AR
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {roleGroups['wicket-keeper'].length} WK
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="batsman">Batsmen</SelectItem>
                  <SelectItem value="bowler">Bowlers</SelectItem>
                  <SelectItem value="all-rounder">All-rounders</SelectItem>
                  <SelectItem value="wicket-keeper">Wicket-keepers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="fatigue">Fatigue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => setSelectedPlayer(player)}
          />
        ))}
      </div>

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
