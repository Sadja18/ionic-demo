import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportProfilePage } from './export-profile.page';

describe('ExportProfilePage', () => {
  let component: ExportProfilePage;
  let fixture: ComponentFixture<ExportProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
