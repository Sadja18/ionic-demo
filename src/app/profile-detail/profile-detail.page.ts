import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import * as Leaflet from 'leaflet';
import { User } from '../models/user.model';
import { ProfileProcessorService } from '../services/profile-processor.service';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.page.html',
  styleUrls: ['./profile-detail.page.scss'],
  standalone: false
})
export class ProfileDetailPage implements OnInit {

  user: User | undefined;
  map: Leaflet.Map | undefined;
  satelliteViewEnable: boolean = false;
  marker: Leaflet.Marker | undefined;

  developerMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private profileProcessorService: ProfileProcessorService,
    private router: Router
  ) { }

  ngOnInit() {

    // Retrieve the mobile number from route state using ActivatedRoute's snapshot
    const mobileNumber = this.route.snapshot?.paramMap?.get('number');

    // If no mobile number is found in route, navigate back to list page

    console.log("the mobile number which we got is ", mobileNumber);
    console.log(this.route.snapshot?.paramMap?.get('number'));
    if (!mobileNumber) {
      this.router.navigate(['/profile-list']);
      // console.log('checking ');
    } else {
      // Fetch the user details using the mobile number
      this.getUserDetails(mobileNumber);
    }
  }

  async getUserDetails(mobileNumber: string) {
    try {
      if (this.developerMode) {
        const user = this.profileProcessorService.getUser(this.developerMode);

        if (user) {
          this.user = user; // Populate the user details

          if (this.user.profilePicLocation) {
            const previewableImage = await this.convertImageToPreviewableLink(this.user.profilePicLocation);

            if (previewableImage) {
              this.user.profilePicLocation = previewableImage;
            } else {
              this.user.profilePicLocation = '';
            }
          } else {
            this.user.profilePicLocation = '';
          }
        } else {
          console.error('User not found');
          this.router.navigate(['/list']); // Navigate to list if user is not found
        }
      } else {
        const user = await this.databaseService.getUserFromMobile(mobileNumber);
        if (user) {
          this.user = user; // Populate the user details

          if (this.user.profilePicLocation) {
            const previewableImage = await this.convertImageToPreviewableLink(this.user.profilePicLocation);

            if (previewableImage) {
              this.user.profilePicLocation = previewableImage;
            } else {
              this.user.profilePicLocation = '';
            }
          } else {
            this.user.profilePicLocation = '';
          }
        } else {
          console.error('User not found');
          this.router.navigate(['/list']); // Navigate to list if user is not found
        }
      }
    } catch (error) {
      console.error('Error fetching user details', error);
      this.router.navigate(['/list']); // Navigate to list in case of an error
    }
  }

  async convertImageToPreviewableLink(path: string) {
    try {
      console.log('path to image ', path)
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

        // Convert the file URI to a format compatible with the WebView
        const currentImagePreview = Capacitor.convertFileSrc(
          readFileResult.uri
        );
        return currentImagePreview;
      } else {
        return null;
      }
    } catch (error) {
      console.error("cannot preview image with value ", path);
      console.error(error);
      return null;
    }
  }

  backToListScreen() {
    console.log('back to list screen');
    this.router.navigate(['/profile-list']);
  }

  private async initMap() {
    if (!this.user?.location) {
      console.error('User location is undefined');
      return;
    }
    const userLat = this.user.location.lat;
    const userLong = this.user.location.long;

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
          popupAnchor: [1, -40], // Point from which the popup opens relative to the iconAnchor
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        })
      }
    )
      .addTo(this.map)
      .bindPopup(`Latitude: ${userLat.toFixed(5)}<br>Longitude: ${userLong.toFixed(5)}`); // Add the popup with lat, long to 5 decimals
  }

  ionViewDidEnter() {
    this.initMap();
  }

}
