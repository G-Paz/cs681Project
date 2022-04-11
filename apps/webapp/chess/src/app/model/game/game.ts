import { GameRow } from "./state/game-row";

export class Game {
  constructor(
    public _id: number,
    public br_player: number,
    public w_player: number,
    public current_player: 1,
    public fenState: string,
    public winner_player: number,
    public winner_by: string,
    public creationDate: Date,
    public state: Array<GameRow>
  ) {}
}
