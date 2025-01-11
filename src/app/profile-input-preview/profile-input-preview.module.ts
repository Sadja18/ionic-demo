import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileInputPreviewPageRoutingModule } from './profile-input-preview-routing.module';

import { ProfileInputPreviewPage } from './profile-input-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileInputPreviewPageRoutingModule
  ],
  declarations: [ProfileInputPreviewPage]
})
export class ProfileInputPreviewPageModule {}
