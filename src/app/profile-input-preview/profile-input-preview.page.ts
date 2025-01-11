import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { GeoCoordinateLocation } from '../models/geo-coordinate-location.model';
import { Router } from '@angular/router';
import * as Leaflet from 'leaflet';
import { AlertController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { ProfileProcessorService } from '../services/profile-processor.service';

@Component({
  selector: 'app-profile-input-preview',
  templateUrl: './profile-input-preview.page.html',
  styleUrls: ['./profile-input-preview.page.scss'],
  standalone: false,
})
export class ProfileInputPreviewPage implements OnInit {
  user: User

  currentImagePreview: string = ''

  map: Leaflet.Map | undefined;

  private satelliteViewEnable = true;

  private marker: Leaflet.Marker | undefined;

  private developerMode: boolean = false;

  private async initMap() {
    if (!this.user?.location) {
      console.error('User location is undefined');
      return;
    }
    const userLat = this.user.location.lat;
    const userLong = this.user.location.long;

    console.log('init map ', userLat, userLong)

    if (!userLat || !userLong) {
      return;
    }

    const streetLayer = Leaflet.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18
      }
    );

    this.map = Leaflet.map(
      'locationMap',
      {
        scrollWheelZoom: false,
        center: [
          userLat,
          userLong
        ],
        layers: [streetLayer]
        // renderer: Leaflet.canvas(),
      }
    ).setView(new Leaflet.LatLng(
      userLat,
      userLong,
    ),
      13
    );


    const satelliteLayer = Leaflet.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Source: ESRI ',
        maxZoom: 18,
      },
    );
    
    satelliteLayer.addTo(this.map);

    if (this.satelliteViewEnable) {
      this.map.addLayer(satelliteLayer);
    }

    const baseMaps = {
      "Streets": streetLayer,
      "Satellite": satelliteLayer
    };

    Leaflet.control.layers(baseMaps).addTo(this.map);

    this.marker = Leaflet.marker(
      [
        userLat,
        userLong
      ],
      {
        icon: Leaflet.icon({
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
          iconSize: [25, 41], // Width, Height
          iconAnchor: [12, 41], // Point of the icon that corresponds to the marker's location
          popupAnchor: [1, -34], // Point from which the popup opens relative to the iconAnchor
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        })
      }
    )
      .addTo(this.map)
      .bindPopup(`Latitude: ${userLat.toFixed(5)}<br>Longitude: ${userLong.toFixed(5)}`)
      .openPopup(); // Add the popup with lat, long to 5 decimals
  }

  async convertImageToPreviewableLink(path: string) {
    try {

      const statResult = await Filesystem.stat({
        path: path,
        directory: Directory.Data
      })
      if (
        statResult &&
        typeof statResult == 'object' &&
        statResult.hasOwnProperty('uri')
      ) {
        const readFileResult = await Filesystem.getUri({
          path: path,
          directory: Directory.Data,
        });

        // console.log('File read result:', readFileResult);

        // Convert the file URI to a format compatible with the WebView
        this.currentImagePreview = Capacitor.convertFileSrc(
          readFileResult.uri
        );
      }
    } catch (error) {
      this.currentImagePreview = ''
      console.error("cannot preview image with value ", path);
      console.error(error);
    }
  }

  async showToast(message: string, type: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass: `custom-toast-${type}`,
    });
    toast.present();
  }

  async onSaveClick() {
    const alert = await this.alertController.create({
      header: 'Confirm Save',
      message: 'Are you sure you want to save the entered information?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Save operation canceled');
          },
        },
        {
          text: 'Proceed',
          handler: async () => {
            this.showToast("Initiating saving of entered info", "info");
            try {
              const mobileUniqueness = await this.databaseService.getUserFromMobile(this.user.mobileNumber);

              if (mobileUniqueness != null) {
                this.showToast("Mobile Number already associated with another user", "error");
              } else {
                await this.databaseService.addUser(this.user);
                this.showToast("Data saved successfully.", "successs");
                this.showToast("Taking you to user list page in 2 seconds.", "successs");
                setTimeout(() => {

                }, 2000);
                this.router.navigate(["/profile-list"]);
              }
            } catch (error) {
              this.showToast('Failed to add user. Please try again.', 'error');
            }

          },
        },
      ],
    });
    await alert.present();
  }

  async onEditClick() {
    const alert = await this.alertController.create({
      header: 'Confirm Edit',
      message: 'Are you sure you want to navigate back to the input page?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Edit operation canceled');
          },
        },
        {
          text: 'Proceed',
          handler: () => {
            this.showToast("Taking you back to input page", "info");
            this.router.navigate(['/profile-input'], { state: { preload: true } });
          },
        },
      ],
    });

    await alert.present();
  }

  constructor(
    private profileProcessorService: ProfileProcessorService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private databaseService: DatabaseService,

  ) {
    this.user = this.profileProcessorService.getUser(this.developerMode);

    this.convertImageToPreviewableLink(this.user.profilePicLocation);
  }

  ngOnInit() {
    console.log("the new location is ", this.user.location);
  }

  ionViewDidEnter() {
    this.initMap()
  }

}
