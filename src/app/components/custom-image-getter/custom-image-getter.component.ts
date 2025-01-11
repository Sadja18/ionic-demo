import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import {Camera, Photo, CameraResultType, CameraDirection, CameraSource,} from '@capacitor/camera';
import { CustomCameraCaptureModalComponent } from '../custom-camera-capture-modal/custom-camera-capture-modal.component';



@Component({
  selector: 'app-custom-image-getter',
  templateUrl: './custom-image-getter.component.html',
  styleUrls: ['./custom-image-getter.component.scss'],
  imports: [
    CommonModule,
    IonicModule,
  ]
})
export class CustomImageGetterComponent  implements OnInit {

  @Input() openFrontCameraByDefault: boolean = true;
  @Input() imageSelected: string = '';

  @Output() imagePicked = new EventEmitter<string>(); // Output for emitting the image path

  private getFileName(): string {
    return `IMG_${new Date().toISOString().replace(/[-:.TZ]/g, '')}.jpg`;;
  }

  // Deletes the previously selected image if it exists
  private async deletePreviousImage() {
    if (this.imageSelected) {
      try {
        // console.log('Deleting previous image:', this.imageSelected);

        // Extract directory and file path
        const pathParts = this.imageSelected.split('/');
        const fileName = pathParts.pop();

        // Delete the file
        await Filesystem.deleteFile({
          directory: Directory.Data,
          path: `${"Pictures"}/${fileName}`,
        });

        // console.log('Previous image deleted successfully.');
      } catch (error) {
        console.error('Error deleting previous image:', error);
      }
    }
  }

  // Ensures that the Pictures subdirectory exists
  private async ensureDirectoryExists() {
    try {
      // Check if the Pictures directory exists
      await Filesystem.stat({
        directory: Directory.Data,
        path: 'Pictures',
      });

      // console.log('Pictures directory exists.');
    } catch (error: any) {
      // console.log('stat error message ', error.message);
      if (error.message === 'File does not exist') {
        // If it doesn't exist, create the Pictures directory
        // console.log('Pictures directory does not exist. Creating it...');
        await Filesystem.mkdir({
          directory: Directory.Data,
          path: 'Pictures',
          recursive: true, // Ensures parent directories are created if necessary
        });
        // console.log('Pictures directory created successfully.');
      } else {
        console.error('Error checking/creating Pictures directory:', error);
        throw error;
      }
    }
  }

  private async handleStandardPhoto(photo: Photo) {
    try {
      await this.ensureDirectoryExists();

      const fileName = this.getFileName();
      const targetPath = `Pictures/${fileName}`;

      await this.deletePreviousImage();

      // console.log('from path ', photo.path)

      await Filesystem.copy({
        from: photo.path || '',
        to: targetPath,
        toDirectory: Directory.Data,
      });

      const statResult = await Filesystem.stat({
        path: `Pictures/${fileName}`,
        directory: Directory.Data,
      });

      // console.log('stat result ', statResult);

      this.imageSelected = `${targetPath}`;
      this.imagePicked.emit(this.imageSelected);

      // console.log('New image saved and emitted:', this.imageSelected);
    } catch (error) {
      console.error('Error handling standard photo:', error);
    }
  }

  private async handleCustomPhoto(photoPath: string) {
    try {
      await this.ensureDirectoryExists();

      const fileName = this.getFileName();
      const targetPath = `Pictures/${fileName}`;

      await this.deletePreviousImage();

      const result = await Filesystem.stat({
        path: photoPath
      })

      // console.log('custom path stat result ', result);

      await Filesystem.copy({
        from: photoPath,
        to: targetPath,
        toDirectory: Directory.Data,

      });

      this.imageSelected = `${targetPath}`;
      this.imagePicked.emit(this.imageSelected);

      // console.log('New image saved and emitted:', this.imageSelected);
    } catch (error) {
      console.error('Error handling custom photo:', error);
    }
  }

  async pickImageFromGallery() {
    try {
      const pickedPhoto: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // Use DataUrl for immediate display
        source: CameraSource.Photos, // Opens the gallery
      });

      try {
        if (pickedPhoto && pickedPhoto.hasOwnProperty('path') && pickedPhoto.path) {
          this.handleStandardPhoto(pickedPhoto);
        } else {
          throw new Error("Picked photo has no path");
        }
      } catch (error) {
        console.error("Error while saving the picked image to dir");
        console.error(error);
      }
    } catch (error) {
      console.error('Error Picking Image.')
      console.error(error);
    }
  }

  // Method to open the camera modal
  async openCameraModal() {
    const modal = await this.modalController.create({
      component: CustomCameraCaptureModalComponent,
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    if (data && data.data && data.data.capturedImage) {
      // Use the captured image path here
      // console.log('Captured Image Path:', data.data.capturedImage);

      if (data.data.capturedImage) {
        this.handleCustomPhoto(data.data.capturedImage);
      } else {
        throw new Error("captured image has no path");
      }
    }
  }

  async captureImage() {
    try {
      // console.log(
      //   "Android ",
      //   this.platform.is('android'),
      //   "\n",
      //   'Front Camera Open ',
      //   this.openFrontCameraByDefault, "\n"
      // );

      if (!this.openFrontCameraByDefault) {
        // console.log('open front camera default is disabled');
        // Use standard camera without specific direction
        const photo: Photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });

        if (photo && photo.hasOwnProperty('path') && photo.path) {
          this.handleStandardPhoto(photo);
        } else {
          throw new Error("Picked photo has no path");
        }
      } else {

        // Handle platform-specific logic
        if (!this.platform.is('android')) {
          // console.log('open front camera default is enabled');

          // Use front camera for non-Android platforms
          const photo: Photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            direction: CameraDirection.Front,
          });
          if (photo && photo.hasOwnProperty('path') && photo.path) {
            this.handleStandardPhoto(photo);
          } else {
            throw new Error("Picked photo has no path");
          }
        } else {
          // console.log('open front camera default is enabled android');

          // Android-specific handling with a separate plugin
          // // console.log('Custom plugin handling required for Android.');
          await this.openCameraModal();
          // const customPhotoPath = '/path/to/custom/photo.jpg'; // Replace with actual logic
          // await this.handleCustomPhoto(customPhotoPath);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  constructor(
    private platform: Platform,
    private modalController: ModalController
  ) { }

  ngOnInit() { }

}
