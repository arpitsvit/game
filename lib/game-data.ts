import { Player, Team, PlayerRole, BowlingStyle } from './game-types';

// Helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substring(2, 11);

// Team colors matching IPL teams
export const IPL_TEAMS: Omit<Team, 'playerIds'>[] = [
  { id: 'mi', name: 'Mumbai Indians', shortName: 'MI', primaryColor: '#004BA0', secondaryColor: '#D1AB3E', budget: 90, reputation: 95, homeGround: 'Wankhede Stadium', coach: 'Mark Boucher', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'csk', name: 'Chennai Super Kings', shortName: 'CSK', primaryColor: '#FFFF00', secondaryColor: '#0081E9', budget: 85, reputation: 94, homeGround: 'MA Chidambaram Stadium', coach: 'Stephen Fleming', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'rcb', name: 'Royal Challengers Bangalore', shortName: 'RCB', primaryColor: '#EC1C24', secondaryColor: '#2B2A29', budget: 88, reputation: 90, homeGround: 'M. Chinnaswamy Stadium', coach: 'Andy Flower', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'kkr', name: 'Kolkata Knight Riders', shortName: 'KKR', primaryColor: '#3A225D', secondaryColor: '#B3A123', budget: 82, reputation: 88, homeGround: 'Eden Gardens', coach: 'Chandrakant Pandit', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'dc', name: 'Delhi Capitals', shortName: 'DC', primaryColor: '#0078BC', secondaryColor: '#EF1B23', budget: 80, reputation: 85, homeGround: 'Arun Jaitley Stadium', coach: 'Ricky Ponting', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'pbks', name: 'Punjab Kings', shortName: 'PBKS', primaryColor: '#ED1B24', secondaryColor: '#A7A9AC', budget: 78, reputation: 82, homeGround: 'PCA Stadium', coach: 'Trevor Bayliss', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'rr', name: 'Rajasthan Royals', shortName: 'RR', primaryColor: '#EA1A85', secondaryColor: '#254AA5', budget: 79, reputation: 84, homeGround: 'Sawai Mansingh Stadium', coach: 'Kumar Sangakkara', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'srh', name: 'Sunrisers Hyderabad', shortName: 'SRH', primaryColor: '#FF822A', secondaryColor: '#000000', budget: 77, reputation: 83, homeGround: 'Rajiv Gandhi Stadium', coach: 'Brian Lara', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'gt', name: 'Gujarat Titans', shortName: 'GT', primaryColor: '#1C1C1C', secondaryColor: '#FFD700', budget: 85, reputation: 86, homeGround: 'Narendra Modi Stadium', coach: 'Ashish Nehra', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
  { id: 'lsg', name: 'Lucknow Super Giants', shortName: 'LSG', primaryColor: '#A72056', secondaryColor: '#FFCC00', budget: 83, reputation: 84, homeGround: 'BRSABV Stadium', coach: 'Justin Langer', wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
];

// First names and last names for player generation
const FIRST_NAMES = ['Virat', 'Rohit', 'Shubman', 'Hardik', 'Ravindra', 'Rishabh', 'KL', 'Shreyas', 'Suryakumar', 'Sanju', 'Ishan', 'Prithvi', 'Devdutt', 'Ruturaj', 'Yashasvi', 'Abhishek', 'Tilak', 'Rinku', 'Nitish', 'Dhruv', 'Rajat', 'Ayush', 'Sarfaraz', 'Shahrukh', 'Arshdeep', 'Mohammed', 'Jasprit', 'Bhuvneshwar', 'Umran', 'Avesh', 'Prasidh', 'Mukesh', 'Akash', 'Tushar', 'Mohsin', 'Ravi', 'Axar', 'Yuzvendra', 'Kuldeep', 'Rahul', 'Washington', 'Krunal', 'Deepak', 'Shardul', 'Harshal', 'Umesh', 'Navdeep', 'Yash', 'Karn', 'Maheesh'];
const LAST_NAMES = ['Sharma', 'Kohli', 'Gill', 'Pandya', 'Jadeja', 'Pant', 'Rahul', 'Iyer', 'Yadav', 'Samson', 'Kishan', 'Shaw', 'Padikkal', 'Gaikwad', 'Jaiswal', 'Badoni', 'Varma', 'Singh', 'Rana', 'Jurel', 'Patidar', 'Badoni', 'Khan', 'Thakur', 'Bumrah', 'Kumar', 'Malik', 'Krishna', 'Choudhary', 'Deep', 'Deshpande', 'Sai', 'Bishnoi', 'Chahal', 'Sen', 'Sundar', 'Ashwin', 'Chahar', 'Patel', 'Shami', 'Saini', 'Dayal', 'Mishra', 'Theekshana'];

// Generate a random player
export function generatePlayer(teamId: string | null, isYouth: boolean = false): Player {
  const role: PlayerRole = ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'][Math.floor(Math.random() * 4)] as PlayerRole;
  const bowlingStyle: BowlingStyle = role === 'batsman' ? 'none' : (['fast', 'medium', 'spin'] as BowlingStyle[])[Math.floor(Math.random() * 3)];
  
  const baseAge = isYouth ? 16 + Math.floor(Math.random() * 4) : 22 + Math.floor(Math.random() * 14);
  const experienceBase = isYouth ? 10 + Math.random() * 20 : 40 + Math.random() * 50;
  
  const skillBase = isYouth ? 30 + Math.random() * 30 : 50 + Math.random() * 40;
  
  return {
    id: generateId(),
    name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
    age: baseAge,
    role,
    battingStyle: Math.random() > 0.3 ? 'right-hand' : 'left-hand',
    bowlingStyle,
    nationality: 'India',
    teamId,
    stats: {
      matches: isYouth ? 0 : Math.floor(Math.random() * 100),
      runs: isYouth ? 0 : Math.floor(Math.random() * 3000),
      wickets: isYouth ? 0 : Math.floor(Math.random() * 100),
      average: isYouth ? 0 : 20 + Math.random() * 35,
      strikeRate: isYouth ? 0 : 100 + Math.random() * 80,
      economy: isYouth ? 0 : 6 + Math.random() * 4,
      highScore: isYouth ? 0 : Math.floor(Math.random() * 120),
      centuries: isYouth ? 0 : Math.floor(Math.random() * 5),
      fifties: isYouth ? 0 : Math.floor(Math.random() * 15),
      catches: isYouth ? 0 : Math.floor(Math.random() * 50),
    },
    batting: Math.floor(role === 'batsman' || role === 'all-rounder' || role === 'wicket-keeper' ? skillBase + 10 : skillBase - 10),
    bowling: Math.floor(role === 'bowler' || role === 'all-rounder' ? skillBase + 10 : skillBase - 20),
    fielding: Math.floor(skillBase),
    fitness: Math.floor(60 + Math.random() * 35),
    experience: Math.floor(experienceBase),
    form: Math.floor(-10 + Math.random() * 20),
    fatigue: Math.floor(Math.random() * 30),
    injured: false,
    injuryDays: 0,
    potential: isYouth ? Math.floor(60 + Math.random() * 35) : Math.floor(skillBase),
    salary: isYouth ? 0.1 : Math.floor(1 + Math.random() * 15),
    contractYears: isYouth ? 3 : 1 + Math.floor(Math.random() * 3),
    isYouth,
  };
}

// Generate a full squad for a team
export function generateSquad(teamId: string): Player[] {
  const players: Player[] = [];
  
  // 4 Batsmen
  for (let i = 0; i < 4; i++) {
    const p = generatePlayer(teamId);
    p.role = 'batsman';
    p.bowlingStyle = 'none';
    p.batting = Math.floor(65 + Math.random() * 30);
    players.push(p);
  }
  
  // 1 Wicket-keeper
  const wk = generatePlayer(teamId);
  wk.role = 'wicket-keeper';
  wk.batting = Math.floor(55 + Math.random() * 35);
  players.push(wk);
  
  // 3 All-rounders
  for (let i = 0; i < 3; i++) {
    const p = generatePlayer(teamId);
    p.role = 'all-rounder';
    p.batting = Math.floor(50 + Math.random() * 35);
    p.bowling = Math.floor(50 + Math.random() * 35);
    players.push(p);
  }
  
  // 4 Bowlers
  for (let i = 0; i < 4; i++) {
    const p = generatePlayer(teamId);
    p.role = 'bowler';
    p.bowling = Math.floor(65 + Math.random() * 30);
    p.batting = Math.floor(20 + Math.random() * 30);
    players.push(p);
  }
  
  // 3 Reserve players
  for (let i = 0; i < 3; i++) {
    players.push(generatePlayer(teamId));
  }
  
  return players;
}

// Initialize teams with players
export function initializeTeamsWithPlayers(): { teams: Team[], players: Player[] } {
  const players: Player[] = [];
  const teams: Team[] = [];
  
  for (const teamData of IPL_TEAMS) {
    const squad = generateSquad(teamData.id);
    players.push(...squad);
    
    teams.push({
      ...teamData,
      playerIds: squad.map(p => p.id),
    });
  }
  
  return { teams, players };
}

// Generate youth academy players
export function generateYouthPlayers(count: number): Player[] {
  return Array.from({ length: count }, () => generatePlayer(null, true));
}

// Venues for matches
export const VENUES = [
  'Wankhede Stadium, Mumbai',
  'MA Chidambaram Stadium, Chennai',
  'M. Chinnaswamy Stadium, Bangalore',
  'Eden Gardens, Kolkata',
  'Arun Jaitley Stadium, Delhi',
  'PCA Stadium, Mohali',
  'Sawai Mansingh Stadium, Jaipur',
  'Rajiv Gandhi Stadium, Hyderabad',
  'Narendra Modi Stadium, Ahmedabad',
  'BRSABV Stadium, Lucknow',
];
