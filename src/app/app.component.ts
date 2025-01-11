import { Component } from '@angular/core';
import { DatabaseService } from './services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private databaseService: DatabaseService
  ) {}

  // Important: Initialize the database connection when the component is created  
  async ngAfterViewInit() {
    await this.databaseService.initDatabase();
  }

  // Important: Close the database connection when the component is destroyed
  async ngOnDestroy() {
    await this.databaseService.closeDatabase();
  }
}
