import { TestBed } from '@angular/core/testing';

import { ExitProfileGuard } from './exit-profile.guard';

describe('ExitProfileGuard', () => {
  let guard: ExitProfileGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ExitProfileGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
