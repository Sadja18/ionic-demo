import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { ProfileProcessorService } from '../services/profile-processor.service';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.page.html',
  styleUrls: ['./profile-list.page.scss'],
  standalone: false
})
export class ProfileListPage implements OnInit {

  private developerMode: boolean = false;
  private users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';


  constructor(
    private databaseService: DatabaseService,
    private profileProcessorService: ProfileProcessorService,
    private router: Router

  ) { }

  ngOnInit() {
    this.initateUsersList();
  }

  async initateUsersList() {
    try {
      const result = await this.databaseService.getAllUsers(this.developerMode);

      if (result && Array.isArray(result) && result.length > 0) {
        // Process each user to get previewable profile pic link
        for (let user of result) {
          user.profilePicLocation = await this.convertImageToPreviewableLink(user.profilePicLocation, this.developerMode) ?? '';
        }
        this.users = result;
        this.filteredUsers = result; // Initialize filtered users list
      }
    } catch (error) {
      console.error("Error fetching users data");
      console.error(error);
    }
  }

  async convertImageToPreviewableLink(path: string, developerMode:boolean=false): Promise<string | null> {
    try {
      const statResult = await Filesystem.stat({
        path: path,
        directory: developerMode?Directory.Documents:Directory.Data
      })
      
      if (
        statResult &&
        typeof statResult == 'object' &&
        statResult.hasOwnProperty('uri')
      ) {
        const readFileResult = await Filesystem.getUri({
          path: path,
          directory: developerMode?Directory.Documents:Directory.Data,
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

    // Filter users based on search query
    filterUsers() {
      if (!this.searchQuery.trim()) {
        this.filteredUsers = this.users; // No search query, show all users
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredUsers = this.users.filter(user => {
          const fullName = (user.firstName + ' ' + user.lastName).toLowerCase();
          return (
            fullName.includes(query) || user.mobileNumber.includes(query)
          );
        });
      }
    }
  
    // Navigate to the user detail page when a user is selected
    onUserEntrySelect(user: User) {
  
      console.log('selected profile ', user);
      this.router.navigate(['/profile-detail', user.mobileNumber],);
    }

}
