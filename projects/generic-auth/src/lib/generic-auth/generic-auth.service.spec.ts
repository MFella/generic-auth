import { TestBed } from '@angular/core/testing';

import { GenericAuthService } from './generic-auth.service';

describe('GenericAuthService', () => {
  let service: GenericAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
