import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { User } from '../models/user.model';
import { GeoCoordinateLocation } from '../models/geo-coordinate-location.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileProcessorService {
  user: User = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: `${new Date().toISOString()}`,
    highestEducation: '10th',  // Default value
    gender: 'Male',
    address: '',
    profilePicLocation: '',
    location: { lat: undefined, long: undefined },  // Default coordinates
  };

  // Getter method to retrieve the user data
  getUser(developerMode: boolean = false): User {

    if (developerMode) {
      this.setUser({
        firstName: 'Naman',
        lastName: 'Mishra',
        mobileNumber: '9988776655',
        dateOfBirth: `${new Date("1999-04-02T00:00:00.000Z").toISOString()}`,
        highestEducation: '10th',  // Default value
        gender: 'Male',
        address: 'CDAC, Pune Maharastra',
        profilePicLocation: 'Pictures/IMGb.png',
        location: { lat: 18.535265017926786, long: 73.81119289603281 },  // Default coordinates
      });

    }
    return this.user;

  }

  // Setter method to update user data
  setUser(updatedUser: User): void {
    this.user = { ...updatedUser };  // Spread operator ensures a fresh object
  }

  // Method to update a specific user field
  updateUserField(key: keyof User, value: any): void {
    this.user[key] = value;
  }

  // Resetter method to reset user data to default values
  resetUser(): void {
    this.user = {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      dateOfBirth: `${new Date().toISOString()}`,
      highestEducation: '10th',  // Default value
      gender: '',
      address: '',
      profilePicLocation: '',
      location: { lat: 0, long: 0 },  // Default coordinates
    };
  }

  // Validation methods

  // Validates if the input field is non-empty
  validateNonEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim() !== '';
  }

  // Validates if the input field is required (non-empty)
  validateFirstName(value: string): boolean {
    return typeof value === 'string' && value.trim() !== '' && /^[A-Za-z.]+$/.test(value) && value.length > 1 && value.length < 31;
  }

  // Validates if the input field is not empty (only checks if provided value is not just spaces if given)
  validateLastName(value: string): boolean {
    if (value) {
      return typeof value === 'string' && value.trim() !== '' && /^[A-Za-z.]+$/.test(value) && value.length > 1 && value.length < 31;
      // validation for non empty last name
    } else {
      return true; // No validation needed for empty last name; it is optional.
    }
  }

  // Validates if the education level is selected
  validateHighestEducation(value: string): boolean {
    return typeof value === 'string' && value.trim() !== '' && this.getEducationOptions().some(option => option.value === value);
  }

  // Validates if gender is selected
  validateGender(value: string): boolean {
    return typeof value === 'string' && value.trim() !== '' && this.getGenderOptions().some(option => option.value === value);
  }

  validateAddress(value: string): boolean {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return false;
    }

    const trimmedValue = value.trim();
    const isValidCharacters = /^[A-Za-z0-9.,/\-\s]+$/.test(trimmedValue);
    const isValidLength = trimmedValue.length > 6 && trimmedValue.length < 251;

    return isValidCharacters && isValidLength;
  }

  // Validates mobile number (simple check for digits and length)
  validateMobileNumber(value: string): boolean {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(value);
  }

  // Validates if location coordinates are provided
  validateLocation(location: GeoCoordinateLocation): boolean {
    return location.lat !== 0 && location.long !== 0;
  }

  // Validates if the provided string is a valid Date of Birth
  validateDob(dob: string): boolean {
    const date = new Date(dob);
    const isValidDate = !isNaN(date.getTime());  // Ensure it's a valid date
    const isNotFuture = date <= new Date();  // Ensure the date is not in the future

    return isValidDate && isNotFuture;
  }

  // Validates if the user is at least a certain age (e.g., 18 years old)
  validateAge(dob: string, minimumAge: number = 18): boolean {
    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate age based on the difference between today and the birth date
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    // Adjust age if the birthday hasn't occurred yet this year
    const isBeforeBirthdayThisYear = monthDifference < 0 || (monthDifference === 0 && dayDifference < 0);
    const finalAge = isBeforeBirthdayThisYear ? age - 1 : age;

    // Check if the final age meets the minimum age requirement
    return finalAge >= minimumAge;
  }


  isValidLocation(location: GeoCoordinateLocation): boolean {
    return location &&
      location != null &&
      (
        typeof location.lat === 'number' &&
        typeof location.long === 'number' &&
        location.lat >= -90 &&
        location.lat <= 90 &&
        location.long >= -180 &&
        location.long <= 180
      );
  }

  async isValidFilePath(path: string): Promise<boolean> {

    try {
      const result = await Filesystem.stat({ path: path, })

      if (result && result.type === 'file' && result.uri) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("cannot find the required file ", error)
      return false;
    }
  }

  // Helper methods to get predefined options
  getEducationOptions() {
    return [
      { label: '10th', value: '10th' },
      { label: '12th', value: '12th' },
      { label: 'Graduate', value: 'Graduate' },
      { label: 'Post Graduate', value: 'Post Graduate' },
      { label: 'Ph.D.', value: 'Ph.D.' },
      { label: 'Others', value: 'Others' }
    ];
  }

  getGenderOptions() {
    return [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
      { label: 'Others', value: 'Others' }
    ];
  }

  constructor() { }
}
