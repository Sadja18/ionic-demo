import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExportProfilePageRoutingModule } from './export-profile-routing.module';

import { ExportProfilePage } from './export-profile.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExportProfilePageRoutingModule,
    PdfViewerModule
    
  ],
  declarations: [ExportProfilePage]
})
export class ExportProfilePageModule {}
