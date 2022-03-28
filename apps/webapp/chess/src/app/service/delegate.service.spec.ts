import { TestBed } from '@angular/core/testing';

import { DelegateService } from './delegate.service';

describe('DelegateService', () => {
  let service: DelegateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DelegateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
