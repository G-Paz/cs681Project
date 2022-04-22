import { Game } from "./game/game";

export class Profile {
  constructor(
    public wins: number,
    public losses: number,
    public username: string,
    public games: Array<Game>
  ) {}
}
