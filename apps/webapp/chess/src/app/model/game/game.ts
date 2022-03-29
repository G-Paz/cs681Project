import { GameRow } from "./state/game-row";

export class Game {
  constructor(public _id: number, public state: Array<GameRow>) {}
}
