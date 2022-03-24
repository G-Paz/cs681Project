import { TestBed } from '@angular/core/testing';

import { LinkGuard } from './link.guard';

describe('LinkGuard', () => {
  let guard: LinkGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LinkGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
