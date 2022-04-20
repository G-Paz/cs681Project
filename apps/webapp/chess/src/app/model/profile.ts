export class Profile {
  constructor(
    public userId: number,
    public wins: number,
    public losses: number,
    public username: string,
    public topPlayers: Array<Profile>
  ) {}
}
