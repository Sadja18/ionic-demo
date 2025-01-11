import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private dbName: string = "users.db";
  private sqlite: SQLiteConnection;

  private db: SQLiteDBConnection | null = null; // Holds the database connection instance

  /**
   * Initialize the SQLite database and create the User table if it doesn't exist.
   */
  async initDatabase(): Promise<void> {
    try {
      // Check connection consistency
      const retCC = (await this.sqlite.checkConnectionsConsistency()).result;

      // Check is connected
      const isConnection = (await this.sqlite.isConnection('appDB', false)).result;

      if (!isConnection && !retCC) {
        // Create a new connection
        this.db = await this.sqlite.createConnection(this.dbName, false, 'no-encryption', 1, false);
        await this.db.open();
        await this.createTables();
      } else {
        // Retrieve existing connection
        this.db = await this.sqlite.retrieveConnection(this.dbName, false);
        await this.db.open();
      }
    } catch (error) {
      console.error("Error initializing database ", this.dbName);
      console.error(error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database connection is not open');
    // Create the User table if it doesn't exist
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing primary key
      firstName TEXT NOT NULL,               -- First name is mandatory
      lastName TEXT NOT NULL,                -- Last name is mandatory
      mobileNumber TEXT NOT NULL UNIQUE,     -- Mobile number must be unique
      dateOfBirth TEXT,                      -- Date of birth (optional)
      highestEducation TEXT,                 -- Highest education level (optional)
      gender TEXT,                           -- Gender (optional)
      address TEXT,                          -- Address (optional)
      profilePicLocation TEXT,               -- Profile picture location (optional)
      latitude REAL NOT NULL,                -- Latitude of user's location
      longitude REAL NOT NULL                -- Longitude of user's location
    );`

    await this.db.execute(createTableQuery);
  }

  /**
   * Add a new user to the database.
   * @param user The user object conforming to the User interface
   */
  async addUser(user: User): Promise<void> {

    const query = `
      INSERT INTO User (firstName, lastName, mobileNumber, dateOfBirth, highestEducation, gender, address, profilePicLocation, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    try {
      // Execute the query with the user details
      await this.db?.executeSet([
        {
          statement: query,
          values: [
            user.firstName,
            user.lastName,
            user.mobileNumber,
            user.dateOfBirth,
            user.highestEducation,
            user.gender,
            user.address,
            user.profilePicLocation,
            user.location.lat,
            user.location.long,
          ],
        },
      ]);
    } catch (error) {
      console.error('Error adding user:', error); // Handle errors during user addition
      throw error;
    }
  }

  /**
   * Fetch all users from the database.
   * @returns A promise that resolves to an array of User objects.
   */
  async getAllUsers(developerMode:boolean=false): Promise<User[]> {

    if(!developerMode){
      const query = `SELECT * FROM User;`; // SQL query to fetch all records
      try {
        const result = await this.db?.query(query);
        return result?.values?.map((row) => this.mapRowToUser(row)) || []; // Map database rows to User objects
      } catch (error) {
        console.error('Error fetching all users:', error); // Log errors for debugging
        return [];
      }
    }else{
      return [
        {
          firstName: 'Naman',
          lastName: 'Mishra',
          mobileNumber: '9988776655',
          dateOfBirth: `${new Date("1999-04-02T00:00:00.000Z").toISOString()}`,
          highestEducation: '10th',  // Default value
          gender: 'Male',
          address: 'CDAC, Pune Maharastra',
          profilePicLocation: 'Pictures/IMGb.png',
          location: { lat: 18.535265017926786, long: 73.81119289603281 },  // Default coordinates
        },
        {
          firstName: 'Test',
          lastName: 'User',
          mobileNumber: '9988776654',
          dateOfBirth: `${new Date("1999-04-02T00:00:00.000Z").toISOString()}`,
          highestEducation: '10th',  // Default value
          gender: 'Male',
          address: 'CDAC, Pune Maharastra',
          profilePicLocation: 'Pictures/IMGa.jpeg',
          location: { lat: 18.535265017926786, long: 73.81119289603281 },  // Default coordinates
        }
      ]
    }
    
  }

  /**
   * Fetch a user by their mobile number.
   * @param mobileNumber The mobile number of the user to fetch.
   * @returns A promise that resolves to a User object or null if not found.
   */
  async getUserFromMobile(mobileNumber: string): Promise<User | null> {
    const query = `SELECT * FROM User WHERE mobileNumber = ?;`; // SQL query with a WHERE clause
    try {
      const result = await this.db?.query(query, [mobileNumber]);
      const row = result?.values?.[0];
      return row ? this.mapRowToUser(row) : null; // Map the row to a User object or return null
    } catch (error) {
      console.error('Error fetching user by mobile number:', error); // Log errors
      return null;
    }
  }

  /**
   * Map a database row to a User object.
   * @param row The row from the database query result.
   * @returns A User object.
   */
  private mapRowToUser(row: any): User {
    return {
      firstName: row.firstName,
      lastName: row.lastName,
      mobileNumber: row.mobileNumber,
      dateOfBirth: row.dateOfBirth,
      highestEducation: row.highestEducation,
      gender: row.gender,
      address: row.address,
      profilePicLocation: row.profilePicLocation,
      location: {
        lat: row.latitude,
        long: row.longitude,
      },
    };
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(this.dbName, false);
      this.db = null;
    }
  }

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite); // create sqlite connection instance
  }
}
