export class GameHistory {
  constructor(
    public userId: number,
    public username: string,
    public fromRowId: string,
    public fromColumnId: string,
    public toRowId: string,
    public toColumnId: string
  ) {}
}
