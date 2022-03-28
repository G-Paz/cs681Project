import { Game } from './game';

describe('Game', () => {
  it('should create an instance', () => {
    expect(new Game(1, [])).toBeTruthy();
  });
});
