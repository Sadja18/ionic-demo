import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileInputPreviewPage } from './profile-input-preview.page';

describe('ProfileInputPreviewPage', () => {
  let component: ProfileInputPreviewPage;
  let fixture: ComponentFixture<ProfileInputPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileInputPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
