import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CustomCameraCaptureModalComponent } from './custom-camera-capture-modal.component';

describe('CustomCameraCaptureModalComponent', () => {
  let component: CustomCameraCaptureModalComponent;
  let fixture: ComponentFixture<CustomCameraCaptureModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomCameraCaptureModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomCameraCaptureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
