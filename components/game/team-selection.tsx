'use client';

import { IPL_TEAMS } from '@/lib/game-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Star, MapPin } from 'lucide-react';

interface TeamSelectionProps {
  onSelectTeam: (teamId: string) => void;
}

export function TeamSelection({ onSelectTeam }: TeamSelectionProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Cricket Manager
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your team and lead them to glory in the Cricket Premier League
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-card border border-border rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <h2 className="font-semibold text-foreground mb-2">How to Play</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Select a team to manage for the season</li>
            <li>2. Compete in IPL-style tournament against 9 other teams</li>
            <li>3. Manage player fatigue, form, and training</li>
            <li>4. Develop youth players in your academy</li>
            <li>5. Win matches and lead your team to the championship!</li>
          </ul>
        </div>

        {/* Team Grid */}
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Select Your Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {IPL_TEAMS.map((team) => (
            <Card
              key={team.id}
              className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSelectTeam(team.id)}
            >
              <CardContent className="p-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: team.primaryColor + '30',
                    color: team.primaryColor,
                  }}
                >
                  {team.shortName.substring(0, 2)}
                </div>
                <h3 className="font-bold text-foreground text-center mb-1">
                  {team.shortName}
                </h3>
                <p className="text-xs text-muted-foreground text-center mb-3">
                  {team.name}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3" /> Reputation
                    </span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {team.reputation}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Budget
                    </span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {team.budget} Cr
                    </Badge>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Select Team
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>All teams and player data are fictional and for entertainment purposes only.</p>
        </div>
      </div>
    </div>
  );
}
