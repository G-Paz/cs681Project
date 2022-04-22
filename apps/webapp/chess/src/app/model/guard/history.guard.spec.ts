import { TestBed } from '@angular/core/testing';

import { HistoryGuard } from './history.guard';

describe('HistoryGuard', () => {
  let guard: HistoryGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HistoryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
