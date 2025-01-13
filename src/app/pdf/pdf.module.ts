import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PdfPageRoutingModule } from './pdf-routing.module';

import { PdfPage } from './pdf.page';
// import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule, NgxKeyboardManagerService } from 'ngx-extended-pdf-viewer'
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PdfPageRoutingModule,
  ],
  declarations: [PdfPage],
})
export class PdfPageModule { }
