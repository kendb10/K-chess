export const GAME_RESULTS = ["WIN", "LOSS", "DRAW"] as const;
export type GameResult = (typeof GAME_RESULTS)[number];

export const PLAYER_COLORS = ["WHITE", "BLACK"] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export function isGameResult(value: string): value is GameResult {
  return (GAME_RESULTS as readonly string[]).includes(value);
}

export function isPlayerColor(value: string): value is PlayerColor {
  return (PLAYER_COLORS as readonly string[]).includes(value);
}
