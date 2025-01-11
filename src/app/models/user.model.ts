import { GeoCoordinateLocation } from "./geo-coordinate-location.model";

export interface User {
    firstName: string,
    lastName: string,
    mobileNumber: string,
    dateOfBirth:string,
    highestEducation: string,
    gender: string,
    address: string,
    profilePicLocation: string,
    location: GeoCoordinateLocation,
}
