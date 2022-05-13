import { GameHistory } from "./game-history";
import { GameRow } from "./state/game-row";

export class Game {
  constructor(
    public _id: string,
    public br_player: number,
    public w_player: number,
    public current_player: 1,
    public fenState: string,
    public winner_player: number,
    public winner_player_username: string,
    public winner_by: string,
    public history: Array<GameHistory>,
    public state: Array<GameRow>
  ) {}
}
