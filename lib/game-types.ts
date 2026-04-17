// Player Types
export type PlayerRole = 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
export type BowlingStyle = 'fast' | 'medium' | 'spin' | 'none';
export type BattingStyle = 'right-hand' | 'left-hand';

export interface PlayerStats {
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy: number;
  highScore: number;
  centuries: number;
  fifties: number;
  catches: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  nationality: string;
  teamId: string | null;
  stats: PlayerStats;
  // Dynamic attributes (0-100)
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  experience: number;
  // Current state
  form: number; // -20 to +20
  fatigue: number; // 0-100 (0 = fresh, 100 = exhausted)
  injured: boolean;
  injuryDays: number;
  potential: number; // For youth players
  salary: number; // In lakhs per year
  contractYears: number;
  isYouth: boolean;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  budget: number; // In crores
  reputation: number;
  homeGround: string;
  coach: string;
  playerIds: string[];
  wins: number;
  losses: number;
  draws: number;
  points: number;
  nrr: number; // Net Run Rate
}

// Match Types
export interface BallEvent {
  over: number;
  ball: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extras: number;
  extraType: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | null;
  wicket: boolean;
  wicketType: 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | null;
  fielderId: string | null;
  commentary: string;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: { wides: number; noBalls: number; byes: number; legByes: number };
  ballEvents: BallEvent[];
  batsmanStats: Record<string, { runs: number; balls: number; fours: number; sixes: number; isOut: boolean; dismissal: string }>;
  bowlerStats: Record<string, { overs: number; balls: number; runs: number; wickets: number; maidens: number; wides: number; noBalls: number }>;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  venue: string;
  date: string;
  overs: number;
  tossWinnerId: string | null;
  tossDecision: 'bat' | 'bowl' | null;
  innings: Innings[];
  currentInnings: number;
  status: 'scheduled' | 'live' | 'completed';
  winnerId: string | null;
  result: string;
  isPlayoff: boolean;
  matchNumber: number;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  season: number;
  teamIds: string[];
  matches: Match[];
  currentMatchIndex: number;
  stage: 'group' | 'playoffs' | 'final' | 'completed';
  pointsTable: Record<string, { played: number; won: number; lost: number; nrr: number; points: number }>;
}

// Youth Academy Types
export interface TrainingSession {
  id: string;
  type: 'batting' | 'bowling' | 'fielding' | 'fitness';
  playerId: string;
  daysRemaining: number;
  skillImprovement: number;
}

export interface YouthAcademy {
  youthPlayers: Player[];
  trainingSessions: TrainingSession[];
  scoutingLevel: number;
  facilitiesLevel: number;
  coachingLevel: number;
}

// Game State
export interface GameState {
  userTeamId: string;
  teams: Team[];
  players: Player[];
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  currentMatch: Match | null;
  youthAcademy: YouthAcademy;
  gameDate: string;
  season: number;
  budget: number;
}
