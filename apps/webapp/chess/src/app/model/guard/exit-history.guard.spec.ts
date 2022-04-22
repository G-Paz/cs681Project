import { TestBed } from '@angular/core/testing';

import { ExitHistoryGuard } from './exit-history.guard';

describe('ExitHistoryGuard', () => {
  let guard: ExitHistoryGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ExitHistoryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
