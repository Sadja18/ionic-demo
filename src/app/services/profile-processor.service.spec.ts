import { TestBed } from '@angular/core/testing';

import { ProfileProcessorService } from './profile-processor.service';

describe('ProfileProcessorService', () => {
  let service: ProfileProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
