import { GameColumn } from "./game-column";

export class GameRow {
  constructor(public rowId: number, public columns: Array<GameColumn>) {}
}
