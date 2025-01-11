import { Component, OnInit } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file'
import { FileOpener } from '@awesome-cordova-plugins/file-opener';
import { Platform } from '@ionic/angular';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.page.html',
  styleUrls: ['./pdf.page.scss'],
  standalone: false,
})
export class PdfPage implements OnInit {
  pdfObj: any;

  getPdfDefinition() {

    var dd: any = {
      content: [
        {
          text: 'This paragraph uses header style and extends the alignment property',
          style: 'header',
          alignment: 'center'
        },
        {
          text: [
            'This paragraph uses header style and overrides bold value setting it back to false.\n',
            'Header style in this example sets alignment to justify, so this paragraph should be rendered \n',
            'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit, officiis viveremus aeternum superstitio suspicor alia nostram, quando nostros congressus susceperant concederetur leguntur iam, vigiliae democritea tantopere causae, atilii plerumque ipsas potitur pertineant multis rem quaeri pro, legendum didicisse credere ex maluisset per videtis. Cur discordans praetereat aliae ruinae dirigentur orestem eodem, praetermittenda divinum. Collegisti, deteriora malint loquuntur officii cotidie finitas referri doleamus ambigua acute. Adhaesiones ratione beate arbitraretur detractis perdiscere, constituant hostis polyaeno. Diu concederetur.'
          ],
          style: 'header',
          bold: false
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'justify'
        }
      }
    }

    return dd;
  }

  async createPdf() {
    try {
      var docObj = this.getPdfDefinition();

      this.pdfObj=pdfMake.createPdf(docObj).open();

    } catch (error) {
      console.error("PDF Maker error");
      console.error(error);
    }
  }

  constructor(
    private platform: Platform
  ) { }

  ngOnInit() {
  }

}
