import { Player, Match, Innings, BallEvent, Team } from './game-types';

// Match Engine Configuration
const CONFIG = {
  // Base probabilities (will be modified by player stats)
  DOT_BALL_BASE: 0.35,
  SINGLE_BASE: 0.28,
  TWO_BASE: 0.08,
  THREE_BASE: 0.02,
  FOUR_BASE: 0.12,
  SIX_BASE: 0.06,
  WICKET_BASE: 0.05,
  WIDE_BASE: 0.03,
  NO_BALL_BASE: 0.01,
  
  // Wicket type probabilities
  BOWLED_PROB: 0.25,
  CAUGHT_PROB: 0.45,
  LBW_PROB: 0.15,
  RUN_OUT_PROB: 0.08,
  STUMPED_PROB: 0.05,
  HIT_WICKET_PROB: 0.02,
};

// Commentary templates
const COMMENTARY = {
  dot: [
    '{batsman} defends solidly',
    'Good length delivery, {batsman} blocks it',
    '{bowler} beats the edge!',
    'Tight line from {bowler}, no run',
    '{batsman} leaves it alone outside off',
    'Driven but straight to the fielder',
  ],
  single: [
    '{batsman} works it to {position} for a single',
    'Quick single taken by {batsman}',
    'Pushed to {position}, easy single',
    '{batsman} taps it and takes a quick run',
    'Smart cricket from {batsman}, rotates strike',
  ],
  two: [
    '{batsman} drives through {position} for two',
    'Good running between wickets, two runs',
    'Placed into the gap, comfortable two',
    '{batsman} finds the gap and comes back for the second',
  ],
  three: [
    'Excellent placement by {batsman}, three runs',
    'Misfield allows three runs',
    'Deep into the outfield, they run three',
  ],
  four: [
    'FOUR! {batsman} times it beautifully through {position}',
    'FOUR! Smashed through the covers',
    'BOUNDARY! {batsman} punches it to the fence',
    'FOUR! That raced away to the boundary',
    'Perfectly timed by {batsman}, four runs',
    'FOUR! Cut shot finds the gap',
  ],
  six: [
    'SIX! {batsman} launches it into the stands!',
    'MASSIVE SIX! That went miles',
    'SIX! {batsman} clears the boundary with ease',
    'That is HUGE! Maximum by {batsman}',
    'SIX! What a shot! The crowd goes wild',
  ],
  wicket: {
    bowled: [
      'BOWLED! The stumps are shattered!',
      'BOWLED HIM! {bowler} gets the breakthrough',
      'Clean bowled! {batsman} misses completely',
    ],
    caught: [
      'CAUGHT! {fielder} takes a good catch',
      'OUT! Caught at {position}',
      'GONE! Edged and caught behind',
      'TAKEN! What a catch by {fielder}!',
    ],
    lbw: [
      'LBW! That looked plumb!',
      'OUT! Trapped in front by {bowler}',
      'LBW! Dead in front of the stumps',
    ],
    'run-out': [
      'RUN OUT! Direct hit from {fielder}!',
      'OUT! Brilliant fielding, run out',
      'SHORT OF THE CREASE! Run out',
    ],
    stumped: [
      'STUMPED! Quick work by the keeper',
      'OUT! {batsman} down the track and stumped',
    ],
    'hit-wicket': [
      'HIT WICKET! Oh no, {batsman} knocks over the stumps',
    ],
  },
  wide: [
    'Wide ball, one extra run',
    'Too wide outside off, signalled wide',
    'Down the leg side, wide called',
  ],
  noBall: [
    'NO BALL! Overstepped the mark',
    'Free hit coming up, no ball',
  ],
};

const FIELD_POSITIONS = [
  'cover', 'point', 'mid-wicket', 'long-on', 'long-off', 
  'third man', 'fine leg', 'square leg', 'deep mid-wicket',
  'deep cover', 'slip', 'gully', 'short leg', 'silly point'
];

function getRandomCommentary(type: string, params: Record<string, string> = {}): string {
  let templates: string[];
  
  if (type.startsWith('wicket_')) {
    const wicketType = type.replace('wicket_', '') as keyof typeof COMMENTARY.wicket;
    templates = COMMENTARY.wicket[wicketType] || ['OUT!'];
  } else {
    const commentaryMap: Record<string, string[]> = {
      dot: COMMENTARY.dot,
      single: COMMENTARY.single,
      two: COMMENTARY.two,
      three: COMMENTARY.three,
      four: COMMENTARY.four,
      six: COMMENTARY.six,
      wide: COMMENTARY.wide,
      noBall: COMMENTARY.noBall,
    };
    templates = commentaryMap[type] || ['{batsman} plays the shot'];
  }
  
  let commentary = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders
  Object.entries(params).forEach(([key, value]) => {
    commentary = commentary.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  // Add random field position if needed
  commentary = commentary.replace('{position}', FIELD_POSITIONS[Math.floor(Math.random() * FIELD_POSITIONS.length)]);
  
  return commentary;
}

// Calculate batsman effectiveness based on stats, form, and fatigue
function getBatsmanEffectiveness(player: Player): number {
  const baseSkill = player.batting / 100;
  const formBonus = player.form / 100; // -0.2 to +0.2
  const fatiguePenalty = player.fatigue / 200; // 0 to 0.5
  const experienceBonus = (player.experience / 100) * 0.15; // up to 0.15
  
  return Math.max(0.3, Math.min(1.2, baseSkill + formBonus - fatiguePenalty + experienceBonus));
}

// Calculate bowler effectiveness based on stats, form, and fatigue
function getBowlerEffectiveness(player: Player): number {
  const baseSkill = player.bowling / 100;
  const formBonus = player.form / 100;
  const fatiguePenalty = player.fatigue / 150;
  const experienceBonus = (player.experience / 100) * 0.15;
  
  return Math.max(0.3, Math.min(1.2, baseSkill + formBonus - fatiguePenalty + experienceBonus));
}

// Calculate fielding effectiveness
function getFieldingEffectiveness(players: Player[]): number {
  const avgFielding = players.reduce((sum, p) => sum + p.fielding, 0) / players.length;
  const avgFatigue = players.reduce((sum, p) => sum + p.fatigue, 0) / players.length;
  
  return Math.max(0.5, (avgFielding / 100) - (avgFatigue / 300));
}

// Generate probabilities for a single ball
function generateBallProbabilities(
  batsman: Player,
  bowler: Player,
  fieldingTeamPlayers: Player[],
  matchSituation: { innings: number; runs: number; wickets: number; overs: number; target?: number }
): Record<string, number> {
  const batsmanEff = getBatsmanEffectiveness(batsman);
  const bowlerEff = getBowlerEffectiveness(bowler);
  const fieldingEff = getFieldingEffectiveness(fieldingTeamPlayers);
  
  // Base probabilities modified by player effectiveness
  const skillDiff = batsmanEff - bowlerEff;
  
  let dotBall = CONFIG.DOT_BALL_BASE * (1 + bowlerEff * 0.3 - batsmanEff * 0.2);
  let single = CONFIG.SINGLE_BASE * (1 + batsmanEff * 0.2);
  let two = CONFIG.TWO_BASE * (1 + batsmanEff * 0.3 - fieldingEff * 0.2);
  let three = CONFIG.THREE_BASE * (1 + batsmanEff * 0.2 - fieldingEff * 0.3);
  let four = CONFIG.FOUR_BASE * (1 + batsmanEff * 0.4 - bowlerEff * 0.2);
  let six = CONFIG.SIX_BASE * (1 + batsmanEff * 0.5 - bowlerEff * 0.3);
  let wicket = CONFIG.WICKET_BASE * (1 + bowlerEff * 0.5 - batsmanEff * 0.3) * fieldingEff;
  let wide = CONFIG.WIDE_BASE * (1 - bowlerEff * 0.3);
  let noBall = CONFIG.NO_BALL_BASE * (1 - bowlerEff * 0.2);
  
  // Adjust for match situation
  const isChasing = matchSituation.target !== undefined;
  const runRate = matchSituation.overs > 0 ? matchSituation.runs / matchSituation.overs : 0;
  
  if (isChasing) {
    const requiredRate = matchSituation.target 
      ? (matchSituation.target - matchSituation.runs) / (20 - matchSituation.overs) 
      : 0;
    
    if (requiredRate > 12) {
      // High pressure - more boundaries but also more wickets
      six *= 1.5;
      four *= 1.3;
      wicket *= 1.4;
      dotBall *= 0.7;
    } else if (requiredRate < 6) {
      // Easy chase - more conservative
      single *= 1.2;
      two *= 1.2;
      six *= 0.7;
      wicket *= 0.8;
    }
  }
  
  // Adjust for wickets in hand
  if (matchSituation.wickets >= 7) {
    // Tail end batting - more defensive but also more vulnerable
    dotBall *= 1.3;
    wicket *= 1.3;
    four *= 0.7;
    six *= 0.5;
  }
  
  // Death overs (16-20) - more boundaries and wickets
  if (matchSituation.overs >= 15) {
    four *= 1.3;
    six *= 1.4;
    wicket *= 1.2;
    dotBall *= 0.8;
  }
  
  // Powerplay (0-6) - more boundaries
  if (matchSituation.overs < 6) {
    four *= 1.2;
    six *= 1.1;
    single *= 0.9;
  }
  
  // Normalize probabilities
  const total = dotBall + single + two + three + four + six + wicket + wide + noBall;
  
  return {
    dotBall: dotBall / total,
    single: single / total,
    two: two / total,
    three: three / total,
    four: four / total,
    six: six / total,
    wicket: wicket / total,
    wide: wide / total,
    noBall: noBall / total,
  };
}

// Simulate a single ball
export function simulateBall(
  batsman: Player,
  bowler: Player,
  fieldingTeamPlayers: Player[],
  over: number,
  ball: number,
  matchSituation: { innings: number; runs: number; wickets: number; overs: number; target?: number }
): BallEvent {
  const probs = generateBallProbabilities(batsman, bowler, fieldingTeamPlayers, matchSituation);
  
  const rand = Math.random();
  let cumulative = 0;
  let outcome: string = 'dotBall';
  
  for (const [key, value] of Object.entries(probs)) {
    cumulative += value;
    if (rand <= cumulative) {
      outcome = key;
      break;
    }
  }
  
  const event: BallEvent = {
    over,
    ball,
    batsmanId: batsman.id,
    bowlerId: bowler.id,
    runs: 0,
    extras: 0,
    extraType: null,
    wicket: false,
    wicketType: null,
    fielderId: null,
    commentary: '',
  };
  
  const fielder = fieldingTeamPlayers[Math.floor(Math.random() * fieldingTeamPlayers.length)];
  
  switch (outcome) {
    case 'dotBall':
      event.runs = 0;
      event.commentary = getRandomCommentary('dot', { batsman: batsman.name, bowler: bowler.name });
      break;
    case 'single':
      event.runs = 1;
      event.commentary = getRandomCommentary('single', { batsman: batsman.name });
      break;
    case 'two':
      event.runs = 2;
      event.commentary = getRandomCommentary('two', { batsman: batsman.name });
      break;
    case 'three':
      event.runs = 3;
      event.commentary = getRandomCommentary('three', { batsman: batsman.name });
      break;
    case 'four':
      event.runs = 4;
      event.commentary = getRandomCommentary('four', { batsman: batsman.name });
      break;
    case 'six':
      event.runs = 6;
      event.commentary = getRandomCommentary('six', { batsman: batsman.name });
      break;
    case 'wicket':
      event.wicket = true;
      // Determine wicket type
      const wicketRand = Math.random();
      if (wicketRand < CONFIG.BOWLED_PROB) {
        event.wicketType = 'bowled';
        event.commentary = getRandomCommentary('wicket_bowled', { batsman: batsman.name, bowler: bowler.name });
      } else if (wicketRand < CONFIG.BOWLED_PROB + CONFIG.CAUGHT_PROB) {
        event.wicketType = 'caught';
        event.fielderId = fielder.id;
        event.commentary = getRandomCommentary('wicket_caught', { 
          batsman: batsman.name, 
          bowler: bowler.name, 
          fielder: fielder.name 
        });
      } else if (wicketRand < CONFIG.BOWLED_PROB + CONFIG.CAUGHT_PROB + CONFIG.LBW_PROB) {
        event.wicketType = 'lbw';
        event.commentary = getRandomCommentary('wicket_lbw', { batsman: batsman.name, bowler: bowler.name });
      } else if (wicketRand < CONFIG.BOWLED_PROB + CONFIG.CAUGHT_PROB + CONFIG.LBW_PROB + CONFIG.RUN_OUT_PROB) {
        event.wicketType = 'run-out';
        event.fielderId = fielder.id;
        event.runs = Math.random() > 0.7 ? 1 : 0; // Sometimes runs before run-out
        event.commentary = getRandomCommentary('wicket_run-out', { 
          batsman: batsman.name, 
          fielder: fielder.name 
        });
      } else if (wicketRand < CONFIG.BOWLED_PROB + CONFIG.CAUGHT_PROB + CONFIG.LBW_PROB + CONFIG.RUN_OUT_PROB + CONFIG.STUMPED_PROB) {
        event.wicketType = 'stumped';
        event.commentary = getRandomCommentary('wicket_stumped', { batsman: batsman.name, bowler: bowler.name });
      } else {
        event.wicketType = 'hit-wicket';
        event.commentary = getRandomCommentary('wicket_hit-wicket', { batsman: batsman.name });
      }
      break;
    case 'wide':
      event.extras = 1;
      event.extraType = 'wide';
      event.commentary = getRandomCommentary('wide', { bowler: bowler.name });
      break;
    case 'noBall':
      event.extras = 1;
      event.extraType = 'no-ball';
      // Can also score runs off no-ball
      const noBallRuns = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      event.runs = noBallRuns;
      event.commentary = getRandomCommentary('noBall', { bowler: bowler.name });
      if (noBallRuns > 0) {
        event.commentary += ` Plus ${noBallRuns} run${noBallRuns > 1 ? 's' : ''} off the bat.`;
      }
      break;
  }
  
  return event;
}

// Simulate an entire over
export function simulateOver(
  battingOrder: Player[],
  bowler: Player,
  fieldingTeamPlayers: Player[],
  overNumber: number,
  currentBatsmanIndex: number,
  innings: Innings,
  target?: number
): { events: BallEvent[]; newBatsmanIndex: number; updatedInnings: Innings } {
  const events: BallEvent[] = [];
  let ballCount = 0;
  let legalBalls = 0;
  let newBatsmanIndex = currentBatsmanIndex;
  const updatedInnings = { ...innings };
  
  while (legalBalls < 6 && updatedInnings.wickets < 10) {
    const batsman = battingOrder[newBatsmanIndex];
    if (!batsman) break;
    
    const matchSituation = {
      innings: innings.battingTeamId === innings.battingTeamId ? 1 : 2,
      runs: updatedInnings.runs,
      wickets: updatedInnings.wickets,
      overs: overNumber + (legalBalls / 6),
      target,
    };
    
    const event = simulateBall(batsman, bowler, fieldingTeamPlayers, overNumber, legalBalls + 1, matchSituation);
    events.push(event);
    ballCount++;
    
    // Update innings stats
    updatedInnings.runs += event.runs + event.extras;
    
    if (event.extraType === 'wide' || event.extraType === 'no-ball') {
      if (event.extraType === 'wide') updatedInnings.extras.wides++;
      if (event.extraType === 'no-ball') updatedInnings.extras.noBalls++;
      // Don't count as legal ball
    } else {
      legalBalls++;
    }
    
    // Update batsman stats
    if (!updatedInnings.batsmanStats[batsman.id]) {
      updatedInnings.batsmanStats[batsman.id] = {
        runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: ''
      };
    }
    
    if (event.extraType !== 'wide') {
      updatedInnings.batsmanStats[batsman.id].balls++;
    }
    updatedInnings.batsmanStats[batsman.id].runs += event.runs;
    if (event.runs === 4) updatedInnings.batsmanStats[batsman.id].fours++;
    if (event.runs === 6) updatedInnings.batsmanStats[batsman.id].sixes++;
    
    // Update bowler stats
    if (!updatedInnings.bowlerStats[bowler.id]) {
      updatedInnings.bowlerStats[bowler.id] = {
        overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0
      };
    }
    
    if (event.extraType !== 'wide' && event.extraType !== 'no-ball') {
      updatedInnings.bowlerStats[bowler.id].balls++;
    }
    updatedInnings.bowlerStats[bowler.id].runs += event.runs + event.extras;
    if (event.extraType === 'wide') updatedInnings.bowlerStats[bowler.id].wides++;
    if (event.extraType === 'no-ball') updatedInnings.bowlerStats[bowler.id].noBalls++;
    
    // Handle wicket
    if (event.wicket) {
      updatedInnings.wickets++;
      updatedInnings.batsmanStats[batsman.id].isOut = true;
      updatedInnings.batsmanStats[batsman.id].dismissal = event.wicketType || 'out';
      updatedInnings.bowlerStats[bowler.id].wickets++;
      
      // Next batsman
      newBatsmanIndex++;
      if (updatedInnings.wickets >= 10) break;
    }
    
    // Rotate strike on odd runs
    if ((event.runs % 2 === 1) && !event.wicket) {
      // Strike rotation logic would go here for two batsmen
      // For simplicity, we keep the same batsman unless out
    }
    
    // Check if target reached in second innings
    if (target && updatedInnings.runs >= target) {
      break;
    }
  }
  
  // Update overs count
  updatedInnings.overs = overNumber + 1;
  updatedInnings.balls = legalBalls;
  
  // Check for maiden
  const overRuns = events.reduce((sum, e) => sum + e.runs + e.extras, 0);
  if (overRuns === 0 && legalBalls === 6) {
    updatedInnings.bowlerStats[bowler.id].maidens++;
  }
  
  // Calculate completed overs for bowler
  if (updatedInnings.bowlerStats[bowler.id].balls >= 6) {
    const completedOvers = Math.floor(updatedInnings.bowlerStats[bowler.id].balls / 6);
    updatedInnings.bowlerStats[bowler.id].overs = completedOvers;
    updatedInnings.bowlerStats[bowler.id].balls = updatedInnings.bowlerStats[bowler.id].balls % 6;
  }
  
  return { events, newBatsmanIndex, updatedInnings };
}

// Create an initial innings object
export function createInnings(battingTeamId: string, bowlingTeamId: string): Innings {
  return {
    battingTeamId,
    bowlingTeamId,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    ballEvents: [],
    batsmanStats: {},
    bowlerStats: {},
  };
}

// Get batting order sorted by batting skill
export function getBattingOrder(players: Player[]): Player[] {
  const batsmen = players.filter(p => p.role === 'batsman' || p.role === 'wicket-keeper');
  const allRounders = players.filter(p => p.role === 'all-rounder');
  const bowlers = players.filter(p => p.role === 'bowler');
  
  // Sort each group by batting skill
  batsmen.sort((a, b) => b.batting - a.batting);
  allRounders.sort((a, b) => b.batting - a.batting);
  bowlers.sort((a, b) => b.batting - a.batting);
  
  return [...batsmen, ...allRounders, ...bowlers].slice(0, 11);
}

// Get bowling rotation
export function getBowlingRotation(players: Player[]): Player[] {
  const bowlers = players.filter(p => p.role === 'bowler');
  const allRounders = players.filter(p => p.role === 'all-rounder' && p.bowling >= 50);
  
  // Sort by bowling skill
  bowlers.sort((a, b) => b.bowling - a.bowling);
  allRounders.sort((a, b) => b.bowling - a.bowling);
  
  // Interleave for variety
  const rotation: Player[] = [];
  const combined = [...bowlers, ...allRounders];
  
  // Main bowlers bowl 4 overs max each
  for (let i = 0; i < 5 && i < combined.length; i++) {
    rotation.push(combined[i]);
  }
  
  return rotation;
}

// Get the next bowler in rotation
export function getNextBowler(
  rotation: Player[],
  bowlerStats: Record<string, { overs: number; balls: number }>,
  lastBowlerId: string | null
): Player {
  // Find a bowler who hasn't bowled 4 overs yet and isn't the last bowler
  for (const bowler of rotation) {
    const stats = bowlerStats[bowler.id];
    const oversCompleted = stats ? stats.overs + (stats.balls > 0 ? 1 : 0) : 0;
    
    if (oversCompleted < 4 && bowler.id !== lastBowlerId) {
      return bowler;
    }
  }
  
  // If all have bowled 4 or are the last bowler, pick the one with least overs (not last)
  const available = rotation.filter(b => b.id !== lastBowlerId);
  return available.sort((a, b) => {
    const aOvers = bowlerStats[a.id]?.overs || 0;
    const bOvers = bowlerStats[b.id]?.overs || 0;
    return aOvers - bOvers;
  })[0] || rotation[0];
}

// Calculate result string
export function getMatchResult(
  innings1: Innings,
  innings2: Innings,
  team1: Team,
  team2: Team,
  battingFirstTeamId: string
): { winnerId: string; result: string } {
  const team1BattedFirst = battingFirstTeamId === team1.id;
  const firstInningsTeam = team1BattedFirst ? team1 : team2;
  const secondInningsTeam = team1BattedFirst ? team2 : team1;
  
  if (innings2.runs > innings1.runs) {
    // Chasing team won
    const wicketsRemaining = 10 - innings2.wickets;
    return {
      winnerId: secondInningsTeam.id,
      result: `${secondInningsTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
    };
  } else if (innings1.runs > innings2.runs) {
    // Batting first team won
    const runsDiff = innings1.runs - innings2.runs;
    return {
      winnerId: firstInningsTeam.id,
      result: `${firstInningsTeam.name} won by ${runsDiff} run${runsDiff !== 1 ? 's' : ''}`,
    };
  } else {
    // Tie (would need super over in real cricket, but for now declare tie)
    return {
      winnerId: firstInningsTeam.id, // Arbitrary for tie
      result: 'Match Tied',
    };
  }
}
