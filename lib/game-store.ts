'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Player, Team, Tournament, Match, YouthAcademy, TrainingSession } from './game-types';
import { initializeTeamsWithPlayers, generateYouthPlayers, generateId, VENUES, IPL_TEAMS } from './game-data';

interface GameStore extends GameState {
  // Actions
  initializeGame: (userTeamId: string) => void;
  resetGame: () => void;
  
  // Player actions
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  transferPlayer: (playerId: string, toTeamId: string) => void;
  releasePlayer: (playerId: string) => void;
  
  // Match actions
  startTournament: () => void;
  simulateMatch: (matchId: string) => Match;
  playNextMatch: () => void;
  
  // Training actions
  startTraining: (playerId: string, type: TrainingSession['type']) => void;
  processDay: () => void;
  
  // Youth academy
  scoutYouth: () => void;
  promoteYouth: (playerId: string) => void;
  upgradeAcademy: (type: 'scouting' | 'facilities' | 'coaching') => void;
}

const initialYouthAcademy: YouthAcademy = {
  youthPlayers: [],
  trainingSessions: [],
  scoutingLevel: 1,
  facilitiesLevel: 1,
  coachingLevel: 1,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      userTeamId: '',
      teams: [],
      players: [],
      tournaments: [],
      currentTournament: null,
      currentMatch: null,
      youthAcademy: initialYouthAcademy,
      gameDate: new Date().toISOString().split('T')[0],
      season: 1,
      budget: 50,

      initializeGame: (userTeamId: string) => {
        const { teams, players } = initializeTeamsWithPlayers();
        const youthPlayers = generateYouthPlayers(5);
        
        set({
          userTeamId,
          teams,
          players,
          youthAcademy: {
            ...initialYouthAcademy,
            youthPlayers,
          },
          gameDate: '2026-03-22',
          season: 1,
          budget: 50,
          currentTournament: null,
          currentMatch: null,
        });
      },

      resetGame: () => {
        set({
          userTeamId: '',
          teams: [],
          players: [],
          tournaments: [],
          currentTournament: null,
          currentMatch: null,
          youthAcademy: initialYouthAcademy,
          gameDate: new Date().toISOString().split('T')[0],
          season: 1,
          budget: 50,
        });
      },

      updatePlayer: (playerId: string, updates: Partial<Player>) => {
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, ...updates } : p
          ),
          youthAcademy: {
            ...state.youthAcademy,
            youthPlayers: state.youthAcademy.youthPlayers.map((p) =>
              p.id === playerId ? { ...p, ...updates } : p
            ),
          },
        }));
      },

      transferPlayer: (playerId: string, toTeamId: string) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);
        if (!player) return;

        const oldTeamId = player.teamId;

        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, teamId: toTeamId } : p
          ),
          teams: state.teams.map((t) => {
            if (t.id === oldTeamId) {
              return { ...t, playerIds: t.playerIds.filter((id) => id !== playerId) };
            }
            if (t.id === toTeamId) {
              return { ...t, playerIds: [...t.playerIds, playerId] };
            }
            return t;
          }),
        }));
      },

      releasePlayer: (playerId: string) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);
        if (!player || !player.teamId) return;

        const teamId = player.teamId;

        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, teamId: null } : p
          ),
          teams: state.teams.map((t) =>
            t.id === teamId
              ? { ...t, playerIds: t.playerIds.filter((id) => id !== playerId) }
              : t
          ),
        }));
      },

      startTournament: () => {
        const state = get();
        const teamIds = state.teams.map((t) => t.id);
        
        // Generate round-robin matches
        const matches: Match[] = [];
        let matchNumber = 1;
        
        for (let i = 0; i < teamIds.length; i++) {
          for (let j = i + 1; j < teamIds.length; j++) {
            const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
            matches.push({
              id: generateId(),
              team1Id: teamIds[i],
              team2Id: teamIds[j],
              venue,
              date: state.gameDate,
              overs: 20,
              tossWinnerId: null,
              tossDecision: null,
              innings: [],
              currentInnings: 0,
              status: 'scheduled',
              winnerId: null,
              result: '',
              isPlayoff: false,
              matchNumber: matchNumber++,
            });
          }
        }
        
        // Shuffle matches for variety
        for (let i = matches.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [matches[i], matches[j]] = [matches[j], matches[i]];
          matches[i].matchNumber = i + 1;
          matches[j].matchNumber = matches.length - i;
        }

        const pointsTable: Tournament['pointsTable'] = {};
        teamIds.forEach((id) => {
          pointsTable[id] = { played: 0, won: 0, lost: 0, nrr: 0, points: 0 };
        });

        const tournament: Tournament = {
          id: generateId(),
          name: `Cricket Premier League Season ${state.season}`,
          season: state.season,
          teamIds,
          matches,
          currentMatchIndex: 0,
          stage: 'group',
          pointsTable,
        };

        set({
          currentTournament: tournament,
          currentMatch: matches[0],
          teams: state.teams.map((t) => ({
            ...t,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            nrr: 0,
          })),
        });
      },

      simulateMatch: (matchId: string) => {
        const state = get();
        if (!state.currentTournament) return state.currentMatch!;

        const match = state.currentTournament.matches.find((m) => m.id === matchId);
        if (!match) return state.currentMatch!;

        const team1 = state.teams.find((t) => t.id === match.team1Id)!;
        const team2 = state.teams.find((t) => t.id === match.team2Id)!;
        
        const team1Players = state.players.filter((p) => p.teamId === team1.id && !p.injured);
        const team2Players = state.players.filter((p) => p.teamId === team2.id && !p.injured);

        // Calculate team strengths with form and fatigue
        const getTeamStrength = (players: Player[]) => {
          return players.reduce((acc, p) => {
            const formBonus = p.form / 10;
            const fatiguePenalty = p.fatigue / 50;
            return acc + (p.batting + p.bowling + p.fielding) / 3 + formBonus - fatiguePenalty;
          }, 0) / Math.max(players.length, 1);
        };

        const team1Strength = getTeamStrength(team1Players);
        const team2Strength = getTeamStrength(team2Players);

        // Toss
        const tossWinner = Math.random() > 0.5 ? team1.id : team2.id;
        const tossDecision = Math.random() > 0.5 ? 'bat' : 'bowl';

        const battingFirst = tossDecision === 'bat' ? tossWinner : (tossWinner === team1.id ? team2.id : team1.id);
        const bowlingFirst = battingFirst === team1.id ? team2.id : team1.id;

        // Simulate first innings
        const firstInningsRuns = Math.floor(120 + (battingFirst === team1.id ? team1Strength : team2Strength) * 1.5 + Math.random() * 60);
        const firstInningsWickets = Math.min(10, Math.floor(3 + Math.random() * 7));
        const firstInningsOvers = firstInningsWickets === 10 ? Math.floor(15 + Math.random() * 5) : 20;

        // Simulate second innings (chasing)
        const chaseStrength = bowlingFirst === team1.id ? team1Strength : team2Strength;
        const chaseRuns = Math.floor(100 + chaseStrength * 1.5 + Math.random() * 80);
        const chaseWickets = chaseRuns >= firstInningsRuns ? Math.floor(2 + Math.random() * 5) : 10;
        const chaseOvers = chaseRuns >= firstInningsRuns ? Math.floor(12 + Math.random() * 8) : 20;

        const innings1 = {
          battingTeamId: battingFirst,
          bowlingTeamId: bowlingFirst,
          runs: firstInningsRuns,
          wickets: firstInningsWickets,
          overs: Math.floor(firstInningsOvers),
          balls: 0,
          extras: { wides: Math.floor(Math.random() * 8), noBalls: Math.floor(Math.random() * 3), byes: Math.floor(Math.random() * 4), legByes: Math.floor(Math.random() * 3) },
          ballEvents: [],
          batsmanStats: {},
          bowlerStats: {},
        };

        const innings2 = {
          battingTeamId: bowlingFirst,
          bowlingTeamId: battingFirst,
          runs: Math.min(chaseRuns, firstInningsRuns + 10),
          wickets: chaseWickets,
          overs: Math.floor(chaseOvers),
          balls: 0,
          extras: { wides: Math.floor(Math.random() * 8), noBalls: Math.floor(Math.random() * 3), byes: Math.floor(Math.random() * 4), legByes: Math.floor(Math.random() * 3) },
          ballEvents: [],
          batsmanStats: {},
          bowlerStats: {},
        };

        const winnerId = innings2.runs >= firstInningsRuns ? bowlingFirst : battingFirst;
        const winMargin = innings2.runs >= firstInningsRuns 
          ? `${10 - innings2.wickets} wickets`
          : `${firstInningsRuns - innings2.runs} runs`;

        const completedMatch: Match = {
          ...match,
          tossWinnerId: tossWinner,
          tossDecision,
          innings: [innings1, innings2],
          currentInnings: 2,
          status: 'completed',
          winnerId,
          result: `${state.teams.find((t) => t.id === winnerId)?.name} won by ${winMargin}`,
        };

        // Update player fatigue and form
        const updatePlayersAfterMatch = (players: Player[], isWinner: boolean): Player[] => {
          return players.map((p) => ({
            ...p,
            fatigue: Math.min(100, p.fatigue + 15 + Math.floor(Math.random() * 10)),
            form: Math.max(-20, Math.min(20, p.form + (isWinner ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3) - 2))),
            stats: {
              ...p.stats,
              matches: p.stats.matches + 1,
            },
          }));
        };

        const updatedPlayers = state.players.map((p) => {
          if (p.teamId === winnerId) {
            return updatePlayersAfterMatch([p], true)[0];
          }
          if (p.teamId === team1.id || p.teamId === team2.id) {
            return updatePlayersAfterMatch([p], false)[0];
          }
          return p;
        });

        // Update points table
        const newPointsTable = { ...state.currentTournament.pointsTable };
        const team1Nrr = (innings1.runs / innings1.overs - innings2.runs / innings2.overs);
        const team2Nrr = -team1Nrr;

        if (winnerId === team1.id) {
          newPointsTable[team1.id] = {
            ...newPointsTable[team1.id],
            played: newPointsTable[team1.id].played + 1,
            won: newPointsTable[team1.id].won + 1,
            points: newPointsTable[team1.id].points + 2,
            nrr: (newPointsTable[team1.id].nrr + team1Nrr) / (newPointsTable[team1.id].played + 1),
          };
          newPointsTable[team2.id] = {
            ...newPointsTable[team2.id],
            played: newPointsTable[team2.id].played + 1,
            lost: newPointsTable[team2.id].lost + 1,
            nrr: (newPointsTable[team2.id].nrr + team2Nrr) / (newPointsTable[team2.id].played + 1),
          };
        } else {
          newPointsTable[team2.id] = {
            ...newPointsTable[team2.id],
            played: newPointsTable[team2.id].played + 1,
            won: newPointsTable[team2.id].won + 1,
            points: newPointsTable[team2.id].points + 2,
            nrr: (newPointsTable[team2.id].nrr + team2Nrr) / (newPointsTable[team2.id].played + 1),
          };
          newPointsTable[team1.id] = {
            ...newPointsTable[team1.id],
            played: newPointsTable[team1.id].played + 1,
            lost: newPointsTable[team1.id].lost + 1,
            nrr: (newPointsTable[team1.id].nrr + team1Nrr) / (newPointsTable[team1.id].played + 1),
          };
        }

        const updatedTournament = {
          ...state.currentTournament,
          matches: state.currentTournament.matches.map((m) =>
            m.id === matchId ? completedMatch : m
          ),
          pointsTable: newPointsTable,
        };

        set({
          currentTournament: updatedTournament,
          currentMatch: completedMatch,
          players: updatedPlayers,
          teams: state.teams.map((t) => {
            if (t.id === winnerId) {
              return { ...t, wins: t.wins + 1, points: t.points + 2 };
            }
            if (t.id === team1.id || t.id === team2.id) {
              return { ...t, losses: t.losses + 1 };
            }
            return t;
          }),
        });

        return completedMatch;
      },

      playNextMatch: () => {
        const state = get();
        if (!state.currentTournament) return;

        const nextIndex = state.currentTournament.currentMatchIndex + 1;
        if (nextIndex >= state.currentTournament.matches.length) {
          // Tournament completed
          set({
            currentTournament: {
              ...state.currentTournament,
              stage: 'completed',
            },
          });
          return;
        }

        set({
          currentTournament: {
            ...state.currentTournament,
            currentMatchIndex: nextIndex,
          },
          currentMatch: state.currentTournament.matches[nextIndex],
        });
      },

      startTraining: (playerId: string, type: TrainingSession['type']) => {
        const state = get();
        const session: TrainingSession = {
          id: generateId(),
          type,
          playerId,
          daysRemaining: 7,
          skillImprovement: Math.floor(2 + Math.random() * 3 + state.youthAcademy.coachingLevel),
        };

        set({
          youthAcademy: {
            ...state.youthAcademy,
            trainingSessions: [...state.youthAcademy.trainingSessions, session],
          },
        });
      },

      processDay: () => {
        const state = get();
        
        // Process training sessions
        const completedSessions: string[] = [];
        const updatedSessions = state.youthAcademy.trainingSessions.map((s) => {
          if (s.daysRemaining <= 1) {
            completedSessions.push(s.id);
            // Apply skill improvement
            const player = [...state.players, ...state.youthAcademy.youthPlayers].find((p) => p.id === s.playerId);
            if (player) {
              const updates: Partial<Player> = {};
              if (s.type === 'batting') updates.batting = Math.min(99, player.batting + s.skillImprovement);
              if (s.type === 'bowling') updates.bowling = Math.min(99, player.bowling + s.skillImprovement);
              if (s.type === 'fielding') updates.fielding = Math.min(99, player.fielding + s.skillImprovement);
              if (s.type === 'fitness') {
                updates.fitness = Math.min(99, player.fitness + s.skillImprovement);
                updates.fatigue = Math.max(0, player.fatigue - 20);
              }
              get().updatePlayer(s.playerId, updates);
            }
          }
          return { ...s, daysRemaining: s.daysRemaining - 1 };
        });

        // Update date
        const currentDate = new Date(state.gameDate);
        currentDate.setDate(currentDate.getDate() + 1);

        // Recover fatigue for all players
        const updatedPlayers = state.players.map((p) => ({
          ...p,
          fatigue: Math.max(0, p.fatigue - 5),
          injuryDays: Math.max(0, p.injuryDays - 1),
          injured: p.injuryDays > 1,
        }));

        set({
          gameDate: currentDate.toISOString().split('T')[0],
          players: updatedPlayers,
          youthAcademy: {
            ...state.youthAcademy,
            trainingSessions: updatedSessions.filter((s) => !completedSessions.includes(s.id)),
          },
        });
      },

      scoutYouth: () => {
        const state = get();
        const newYouth = generateYouthPlayers(1 + state.youthAcademy.scoutingLevel);
        
        set({
          youthAcademy: {
            ...state.youthAcademy,
            youthPlayers: [...state.youthAcademy.youthPlayers, ...newYouth],
          },
        });
      },

      promoteYouth: (playerId: string) => {
        const state = get();
        const youth = state.youthAcademy.youthPlayers.find((p) => p.id === playerId);
        if (!youth) return;

        const promotedPlayer: Player = {
          ...youth,
          teamId: state.userTeamId,
          isYouth: false,
          salary: 0.5,
          contractYears: 3,
        };

        set({
          players: [...state.players, promotedPlayer],
          teams: state.teams.map((t) =>
            t.id === state.userTeamId
              ? { ...t, playerIds: [...t.playerIds, promotedPlayer.id] }
              : t
          ),
          youthAcademy: {
            ...state.youthAcademy,
            youthPlayers: state.youthAcademy.youthPlayers.filter((p) => p.id !== playerId),
          },
        });
      },

      upgradeAcademy: (type: 'scouting' | 'facilities' | 'coaching') => {
        const state = get();
        const cost = 5;
        if (state.budget < cost) return;

        set({
          budget: state.budget - cost,
          youthAcademy: {
            ...state.youthAcademy,
            scoutingLevel: type === 'scouting' ? Math.min(5, state.youthAcademy.scoutingLevel + 1) : state.youthAcademy.scoutingLevel,
            facilitiesLevel: type === 'facilities' ? Math.min(5, state.youthAcademy.facilitiesLevel + 1) : state.youthAcademy.facilitiesLevel,
            coachingLevel: type === 'coaching' ? Math.min(5, state.youthAcademy.coachingLevel + 1) : state.youthAcademy.coachingLevel,
          },
        });
      },
    }),
    {
      name: 'cricket-manager-game',
    }
  )
);
