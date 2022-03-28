import { GameRow } from "./state/game-row";

export class Game {
  constructor(public id: number, public state: Array<GameRow>) {}
}
