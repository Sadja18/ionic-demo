import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Geolocation, Position } from '@capacitor/geolocation';
import { User } from '../models/user.model';
import { ToastController } from '@ionic/angular';
import { GeoCoordinateLocation } from '../models/geo-coordinate-location.model';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

import * as Leaflet from 'leaflet';
import { ProfileProcessorService } from '../services/profile-processor.service';

@Component({
  selector: 'app-profile-input',
  templateUrl: './profile-input.page.html',
  styleUrls: ['./profile-input.page.scss'],
  standalone: false,

})
export class ProfileInputPage implements OnInit {

  currentImage: string | undefined = '';
  currentImagePreview: string | undefined = '';

  presetCoordinates: boolean = true;
  draggableMarkerEnable: boolean = true;

  selectedGender: string = ''; // Holds the currently selected value

  genderOptions: { label: string; value: string }[] = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Others' },
  ];

  // selectedHighestEducation: string = '10th';

  educationQualificationOptions: { label: string; value: string }[] = [
    { label: '10th', value: '10th' },
    { label: '12th', value: '12th' },
    { label: 'Graduate', value: 'Graduate' },
    { label: 'Post Graduate', value: 'Post Graduate' },
    { label: 'Ph.D.', value: 'Ph.D.' },
    { label: 'Others', value: 'Others' },
  ];

  mapWidth: string = '0px';
  mapHeight: string = '0px';

  selectedViewMode: string = 'satellite';  // Default to satellite view
  viewModeOptions: { label: string; value: string }[] = [
    { label: 'Street View', value: 'street' },
    { label: 'Satellite View', value: 'satellite' },
  ];

  satelliteViewEnable: boolean = true;  // Default to Satellite view

  private minimumAgeRequirement: number = 2;

  user: User;

  errorText: Record<string, string> = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    gender: '',
    highestEducation: '',
    address: '',
    dateOfBirth: '',
    location: '',
    profilePicLocation: ''
  };

  enableValidationText: boolean = true;

  preload: boolean = false;
  dragRadius: number = 40; // radius of drag region in meters
  debounceDuration: number = 300;

  private map: Leaflet.Map | undefined;
  private marker: Leaflet.Marker | undefined;
  // private initialLatLng: Leaflet.LatLngExpression = [51.505, -0.09]; // Default coordinates
  private circle: Leaflet.Circle | undefined;

  developerMode: boolean = false;

  // Handling the input change
  onFirstNameValueChange(value: string): void {
    // // console.log('Textbox value changed:', value);
    if (!this.profileProcessorService.validateFirstName(value)) {
      if (typeof value === 'string') {
        if (value.trim() !== '') {
          if (/^[A-Za-z.]+$/.test(value)) {
            if (value.length > 1) {
              this.profileProcessorService.updateUserField('firstName', '');

              this.errorText['firstName'] = 'First Name should be not more than 30 characters';
            } else {
              this.profileProcessorService.updateUserField('firstName', '');

              this.errorText['firstName'] = 'First Name should be more than 1 character';
            }
          } else {
            this.profileProcessorService.updateUserField('firstName', '');

            this.errorText['firstName'] = 'First Name can only contain letters and full stop (.)';
          }
        } else {
          this.profileProcessorService.updateUserField('firstName', '');

          this.errorText['firstName'] = 'First Name cannot be empty string';
        }
      } else {
        this.profileProcessorService.updateUserField('firstName', '');

        this.errorText['firstName'] = 'First Name needs to be text';
      }
    } else {
      this.profileProcessorService.updateUserField('firstName', value);
      this.errorText['firstName'] = '';
    }
    this.user = this.profileProcessorService.getUser();
  }

  // Handling the input change
  onLastNameValueChange(value: string): void {
    // // console.log('Last Name changed:', value);

    if (value || (typeof value === 'string' && value.trim() !== "")) {
      if (this.profileProcessorService.validateLastName(value)) {
        this.profileProcessorService.updateUserField('lastName', value);
        this.errorText['lastName'] = '';
      } else {
        if (/^[A-Za-z.]+$/.test(value)) {
          if (value.length > 1) {
            this.profileProcessorService.updateUserField('lastName', '');

            this.errorText['lastName'] = 'Last Name should be not more than 30 characters';
          } else {
            this.profileProcessorService.updateUserField('lastName', '');

            this.errorText['lastName'] = 'Last Name should be more than 1 character';
          }
        } else {
          this.profileProcessorService.updateUserField('lastName', '');

          this.errorText['lastName'] = 'Last Name can only contain letters and full stop (.)';
        }
      }
    } else {
      this.profileProcessorService.updateUserField('lastName', '');
      this.errorText['lastName'] = '';
    }
    this.user = this.profileProcessorService.getUser();

  }

  onMobileNumberChange(value: string): void {
    // // console.log('Mobile Number changed: ', value);
    if (
      this.profileProcessorService.validateNonEmpty(value)
      && this.profileProcessorService.validateMobileNumber(value)
    ) {
      this.profileProcessorService.updateUserField('mobileNumber', value);
      this.errorText['mobileNumber'] = '';
    } else {
      if (typeof value === 'string' && value.trim() !== '') {
        if (value.length === 10) {
          this.errorText['mobileNumber'] = 'Mobile Number should only contain number';
          this.profileProcessorService.updateUserField('mobileNumber', '');
        } else {
          this.errorText['mobileNumber'] = 'Mobile Number should be 10 characters long';
          this.profileProcessorService.updateUserField('mobileNumber', '');
        }
      } else {
        this.errorText['mobileNumber'] = 'Mobile Number is invalid';
        this.profileProcessorService.updateUserField('mobileNumber', '');
      }
    }
    this.user = this.profileProcessorService.getUser();

  }

  onDateOfBirthChange(event: CustomEvent): void {
    // // console.log('Dob Changed: ', event.detail?.value);
    // // console.log(typeof event.detail?.value)

    const value = event.detail?.value;
    if (
      this.profileProcessorService.validateNonEmpty(value)
      && this.profileProcessorService.validateDob(value)
      && this.profileProcessorService.validateAge(value, this.minimumAgeRequirement)
    ) {
      // const dateOfBirth = value.split("T")[0];
      this.profileProcessorService.updateUserField('dateOfBirth', value);
      this.errorText['dateOfBirth'] = '';
    } else {
      if (this.profileProcessorService.validateDob(value)) {
        this.profileProcessorService.updateUserField('dateOfBirth', '');
        this.errorText['dateOfBirth'] = `Applicant must be ${this.minimumAgeRequirement} years old.`;
      } else {
        this.profileProcessorService.updateUserField('dateOfBirth', '');
        this.errorText['dateOfBirth'] = 'Invalid Date of Birth';
      }
    }
    this.user = this.profileProcessorService.getUser();

  }

  onAddressChange(value: string): void {
    // // console.log('Address Changed: ', value);

    if (this.profileProcessorService.validateAddress(value)) {
      this.profileProcessorService.updateUserField('address', value);
      this.errorText['address'] = '';
      return;
    }

    if (!value) {
      this.errorText['address'] = 'Address is invalid';
      this.profileProcessorService.updateUserField('address', '');
      return;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      this.errorText['address'] = 'Address is invalid';
    } else if (!/^[A-Za-z0-9.,/-]+$/.test(trimmedValue)) {
      this.errorText['address'] = 'Only (,) (.) (/) (-), letters, and numbers are allowed';
    } else if (trimmedValue.length <= 6) {
      this.errorText['address'] = 'Address cannot be less than 6 characters.';
    } else if (trimmedValue.length >= 251) {
      this.errorText['address'] = 'Address cannot be more than 250 characters.';
    }
    this.profileProcessorService.updateUserField('address', '');
    this.user = this.profileProcessorService.getUser();

  }

  onGenderChange(value: string): void {
    // // console.log('Gender Changed ', value);
    // this.selectedGender = value;

    if (this.profileProcessorService.validateGender(value)) {
      this.errorText['gender'] = '';
      this.profileProcessorService.updateUserField('gender', value);
    } else {
      this.errorText['gender'] = 'Invalid gender';
      this.profileProcessorService.updateUserField('gender', '');
    }
    this.user = this.profileProcessorService.getUser();

  }

  onHighestEducationChange(value: string): void {
    // // console.log('Highest Qualification Changed: ', value);
    if (this.profileProcessorService.validateHighestEducation(value)) {
      this.errorText['highestEducation'] = '';
      this.profileProcessorService.updateUserField('highestEducation', value);
    } else {
      this.errorText['highestEducation'] = 'Invalid highestEducation';
      this.profileProcessorService.updateUserField('highestEducation', '');
    }
    this.user = this.profileProcessorService.getUser();

  }

  onCoordinateUpdate(coords: GeoCoordinateLocation) {
    this.profileProcessorService.updateUserField('location', coords);
    this.user = this.profileProcessorService.getUser(this.developerMode);
  }

  async handleImagePicked($event: string) {
    //  this.currentImage =
    // console.log('Image picked ', $event);
    this.currentImage = $event;

    await this.readCurrentImageAndPreview();
  }

  async readCurrentImageAndPreview() {
    try {
      if (this.currentImage) {
        const filePath = `${this.currentImage}`;

        const statResult = await Filesystem.stat({
          path: filePath,
          directory: Directory.Data,
        });

        // console.log('stat result ', statResult);

        if (
          statResult &&
          typeof statResult == 'object' &&
          statResult.hasOwnProperty('uri')
        ) {
          const readFileResult = await Filesystem.getUri({
            path: filePath,
            directory: Directory.Data,
          });

          // // console.log('File read result:', readFileResult);

          // Convert the file URI to a format compatible with the WebView
          this.currentImagePreview = Capacitor.convertFileSrc(
            readFileResult.uri
          );

          this.profileProcessorService.updateUserField('profilePicLocation', this.currentImage);
          this.errorText['profilePicLocation'] = '';
        }
      } else {
        // console.log(' no valid image found ', this.currentImage);
        this.profileProcessorService.updateUserField('profilePicLocation', '');
        this.errorText['profilePicLocation'] = 'Invalid profile pic'
      }
    } catch (error) {
      console.error('Image not ready for preview');
      console.error(error);
      this.profileProcessorService.updateUserField('profilePicLocation', '');
      this.errorText['profilePicLocation'] = 'Invalid profile pic'
    }
    this.user = this.profileProcessorService.getUser();

  }

  private async initMap() {
    if (!this.user?.location) {
      console.error('User location is undefined');
      return;
    }
    var userLat = this.user.location.lat;
    var userLong = this.user.location.long;

    if (!this.preload) {
      const position: Position = await Geolocation.getCurrentPosition();

      userLat = position.coords.latitude;
      userLong = position.coords.longitude;

      this.onCoordinateUpdate({ lat: userLat, long: userLong });
      // // console.log('current location ', userLat, userLong, this.user.location);

    }
    // console.log(userLat, userLong);

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
        draggable: true,
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
      .bindPopup(`Latitude: ${userLat.toFixed(7)}<br>Longitude: ${userLong.toFixed(7)}`)
      .openPopup(); // Add the popup with lat, long to 5 decimals

    this.circle = Leaflet.circle([userLat, userLong], {
      radius: this.dragRadius,
      color: 'blue',
      fillColor: '#9abaf1',
      fillOpacity: 0.3,
    }).addTo(this.map);

    this.attachMarkerDragHandler();
  }

  private attachMarkerDragHandler() {
    if (!this.marker) return;

    let updateTimeout: any;

    this.marker.on('dragend', () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        const position = this.marker?.getLatLng();
        if (position && this.isWithinRadius(position.lat, position.lng)) {
          this.marker
            ?.bindPopup(
              `Latitude: ${position.lat.toFixed(7)}<br>Longitude: ${position.lng.toFixed(7)}`
            )
            .openPopup();
          // console.log('updating location ')
          this.onCoordinateUpdate({ lat: position.lat, long: position.lng });
        } else {
          // Reset marker to the center if dragged out of radius
          const center = this.circle?.getLatLng();
          if (center) this.marker?.setLatLng(center);
        }
      }, this.debounceDuration);
    });
  }

  private isWithinRadius(lat: number, lng: number): boolean {
    const center = this.circle?.getLatLng();
    if (!center) return false;

    const distance = this.map
      ? this.map.distance(center, Leaflet.latLng(lat, lng))
      : Infinity;

    return distance <= this.dragRadius;
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

  onResetClick() {
    this.profileProcessorService.resetUser();
    this.currentImage = ''
    this.currentImagePreview = ''
    this.errorText = {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      gender: '',
      highestEducation: '',
      address: '',
      dateOfBirth: '',
      location: '',
      profilePicLocation: ''
    };
    this.enableValidationText = false;
  }

  async onSubmitClick() {

    this.enableValidationText = true;

    this.user = this.profileProcessorService.getUser();

    if (!this.errorText['firstName'] && !this.profileProcessorService.validateFirstName(this.user.firstName)) {
      // console.error('First name is required.');
      this.errorText['firstName'] = 'First name is required.'
    }
    if (!this.errorText['lastName'] && !this.profileProcessorService.validateLastName(this.user.lastName)) {
      // console.error('Last name is .');
      this.errorText['lastName'] = 'Last name is invalid.'
    }
    if (!this.errorText['gender'] && !this.profileProcessorService.validateGender(this.user.gender)) {
      // console.error('Last name is .');
      this.errorText['gender'] = 'Gender is required.'
    }
    if (!this.errorText['gender'] && !this.profileProcessorService.validateGender(this.user.gender)) {
      // console.error('Last name is .');
      this.errorText['gender'] = 'Gender is required.'
    }
    if (!this.errorText['highestEducation'] && !this.profileProcessorService.validateHighestEducation(this.user.highestEducation)) {
      // console.error('Last name is .');
      this.errorText['highestEducation'] = 'highestEducation is required.'
    }
    if (!this.errorText['mobileNumber'] && !this.profileProcessorService.validateMobileNumber(this.user.mobileNumber)) {
      // console.error('Invalid mobile number:', this.user.mobileNumber);
      this.errorText['mobileNumber'] = 'Mobile Number is required.'
    }
    if (!this.errorText['dateOfBirth'] && !this.profileProcessorService.validateDob(this.user.dateOfBirth)) {
      // console.error('Invalid date of birth:', this.user.dateOfBirth);
      this.errorText['dateOfBirth'] = 'Date of Birth is required.'
    }
    if (!this.errorText['address'] && !this.profileProcessorService.validateAddress(this.user.address)) {
      // console.error('Address is required.');
      this.errorText['address'] = 'Address is required.'
    }
    if (!this.errorText['location'] && !this.profileProcessorService.isValidLocation(this.user.location)) {
      // console.error('Invalid location:', this.user.location);
      this.errorText['location'] = 'Location is required.'
    }
    if (!this.user.profilePicLocation || !this.profileProcessorService.validateNonEmpty(this.user.profilePicLocation)) {
      this.errorText['profilePicLocation'] = 'Please select/capture a profile pic';
    }

    const mobileUniqueness = await this.databaseService.getUserFromMobile(this.user.mobileNumber);

    if (mobileUniqueness != null) {
      this.errorText['mobileNumber'] = "This mobile number is already associated with another user";
      this.enableValidationText = true;
    }

    if (Object.values(this.errorText).some(value => typeof value === 'string' && value.trim() !== '')) {
      this.showToast('Form contains errors.\nPlease fix before submitting them.', 'error');
      // console.log(this.errorText)
    } else {
      // console.info(this.user);
      this.profileProcessorService.setUser(this.user);
      // console.log(this.profileProcessorService.getUser())
      // console.info('data valid to send to preview screen');
      this.enableValidationText = false;
      this.showToast('Proceeding to save form.', 'success');
      this.router.navigate(['/profile-input-preview']);
    }

    // // console.log

  }

  displayErrorTextLine(fieldName: string) {
    if (fieldName in this.errorText) {
      if (this.enableValidationText) {
        if (this.profileProcessorService.validateNonEmpty(this.errorText[fieldName])) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  constructor(
    private profileProcessorService: ProfileProcessorService,
    private toastController: ToastController,
    private router: Router,
    private databaseService: DatabaseService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.preload = navigation.extras.state['preload'] || false;
    }
    if (this.preload) {
      // console.info("preload is enabled from preview page ");

      this.user = this.profileProcessorService.getUser(this.developerMode);
      // console.log(this.user);
    } else {
      this.profileProcessorService.resetUser();

      this.user = this.profileProcessorService.getUser(this.developerMode);
    }
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.initMap();
  }

}
