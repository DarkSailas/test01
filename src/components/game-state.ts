export type GameState = 'DAY_I' | 'DAY_II' | 'DAY_III' | 'DEFEAT' | 'NIGHT_LORD_DEFEATED' | 'WAITING' | 'UNKNOWN';

export const TIMERS_CYCLE = [268, 179, 209]; // in seconds for DAY I, II, III

export type TimeMark = {
  day: string;
  time: string;
};
