import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-camera-capture-modal',
  templateUrl: './custom-camera-capture-modal.component.html',
  styleUrls: ['./custom-camera-capture-modal.component.scss'],
  imports:[
    CommonModule,
    IonicModule
  ]
})
export class CustomCameraCaptureModalComponent  implements OnInit {

  @ViewChild('preview', { static: true }) previewElement!: ElementRef;
  
  previewHeight: string = '0';
  previewWidth: string = '100%';
  buttonsHeight: string = '20%';


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {

    this.calculateDimensions();
    this.initializeCameraPreview();
  }

  // Calculate the preview area and button height dynamically
  calculateDimensions() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    this.previewHeight = `${0.8 * screenHeight}px`; // 80% of screen height
    this.previewWidth = `${screenWidth}px`; // Full screen width
    this.buttonsHeight = `${0.2 * screenHeight}px`; // Remaining 20% for buttons
  }

  // Initialize Camera Preview
  initializeCameraPreview() {
    const cameraPreviewOptions: CameraPreviewOptions = {
      parent: 'camera-preview', // Set to the div where camera preview will be shown
      position: 'front', // Use front camera by default
      width: window.innerWidth,
      height: 0.8 * window.innerHeight,
      storeToFile: true,
      enableZoom: true,
    };
    CameraPreview.start(cameraPreviewOptions);
  }

  // Flip the camera between front and rear
  flipCamera() {
    CameraPreview.flip();
  }

  // Capture the image and get the file path
  async captureImage() {
    const captureOptions: CameraPreviewPictureOptions = {
      quality: 85,
    };
    const result = await CameraPreview.capture(captureOptions);

    // console.log("captured image ", result);

    CameraPreview.stop();
    this.modalController.dismiss({ capturedImage: result.value });
  }

  // Close the camera preview
  closeCamera() {
    CameraPreview.stop();
    this.modalController.dismiss({ capturedImage: '' });
  }

  // Listens to screen resizing events to adjust the dimensions dynamically
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.calculateDimensions();
    this.restartCameraPreview();
  }

  // Restart the camera preview with updated dimensions
  restartCameraPreview() {
    CameraPreview.stop(); // Stop the existing preview
    this.initializeCameraPreview(); // Restart the preview with updated dimensions
  }

}
