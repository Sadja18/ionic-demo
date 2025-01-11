import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileInputPageRoutingModule } from './profile-input-routing.module';

import { ProfileInputPage } from './profile-input.page';
import { CustomTextBoxComponent } from '../components/custom-text-box/custom-text-box.component';
import { CustomRadioComponent } from '../components/custom-radio/custom-radio.component';
import { CustomDropDownComponent } from '../components/custom-drop-down/custom-drop-down.component';
import { CustomImageGetterComponent } from '../components/custom-image-getter/custom-image-getter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileInputPageRoutingModule,
    CustomTextBoxComponent,
    CustomRadioComponent,
    CustomDropDownComponent,
    CustomImageGetterComponent,
  ],
  declarations: [ProfileInputPage]
})
export class ProfileInputPageModule {}
