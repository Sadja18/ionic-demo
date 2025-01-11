import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileListPageRoutingModule } from './profile-list-routing.module';

import { ProfileListPage } from './profile-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileListPageRoutingModule
  ],
  declarations: [ProfileListPage]
})
export class ProfileListPageModule {}
