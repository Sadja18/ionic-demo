import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Filesystem, Directory } from '@capacitor/filesystem';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Capacitor } from '@capacitor/core';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);
GlobalWorkerOptions.workerSrc = '/assets/pdfjs.worker.min.js';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.page.html',
  styleUrls: ['./pdf.page.scss'],
  standalone: false,
})
export class PdfPage implements OnInit {
  pdfObj: pdfMake.TCreatedPdf | undefined;
  pdfPath: string | null = null; // Path to cached PDF
  isRendered: boolean = false; // Tracks if the PDF is ready for viewing

  // pdfPreviewURL: string | undefined;

  saveFileName: string = "sample.pdf";
  pdfSrc: string | undefined;

  currentPage = 1;
  totalPages = 0;
  imageList: string[] = [];



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

  // Create and save PDF to cache

  async initializePDF() {
    try {
      const pdfDefinition = this.getPdfDefinition();
      this.pdfObj = pdfMake.createPdf(pdfDefinition);

      this.pdfObj.getBase64(async (base64Data) => {
        // Write the file to the cache directory
        try {
          const writeResult = await Filesystem.writeFile({
            path: this.saveFileName,
            data: base64Data,
            directory: Directory.Cache,
          });

          console.log(writeResult);

          this.pdfPath = writeResult.uri;

          this.pdfSrc = Capacitor.convertFileSrc(this.pdfPath);
          console.log('this path : ', this.pdfPath);
          console.log('this.pdf src : ', this.pdfSrc);

          console.log('calling ')

          await this.renderPdfAsImages();

          console.log('called ')

          // this.isRendered = true;
        } catch (error) {
          console.error('write file error ', error)
        }

        // Browser.open({ url: path });
      });
      console.log('pdf created successfully');
    } catch (error) {
      console.error('Error creating PDF', error);
    }
  }

  // Step 3: Render PDF and Convert Each Page to Image
  async renderPdfAsImages() {
    try {
      console.log('pdfdata ');

      const pdfData = await Filesystem.readFile({
        path: this.saveFileName,
        directory: Directory.Cache,
      });

      console.log('pdfdata typeof ', typeof pdfData.data);

      if (typeof pdfData.data !== 'string') {
        console.log(typeof pdfData.data)
        return;
      }

      // console.log('pdfdata ', pdfData.data);


      // Convert Base64 string to ArrayBuffer
      const pdfArrayBuffer = this.base64ToArrayBuffer(pdfData.data);

      console.log('array buffer ')
      console.log(pdfArrayBuffer);

      const pdf = await getDocument({ data: this.pdfPath ?? "" }).promise;
      console.log('get ', pdf)
      this.totalPages = pdf.numPages;

      console.log("pages ", "-----", typeof pdf, pdf.numPages)

      for (let i = 1; i <= this.totalPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        this.imageList.push(canvas.toDataURL('image/png')); // Save each page as an image
      }

      console.log('PDF converted to images successfully:', this.imageList);
    } catch (error) {
      console.error('Error rendering PDF pages:', error);
    }
  }

  // Convert Base64 string to ArrayBuffer
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Step 4: Navigation Methods
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }


  // Download the PDF to the appropriate directory
  async downloadPdf() {
    if (!this.pdfPath) return;

    try {
      const targetDirectory =
        this.platform.is('android') ? Directory.External : Directory.External;

      // Write the file to the target directory
      const copyResult = await Filesystem.copy({
        from: this.saveFileName,
        to: this.saveFileName,
        directory: Directory.Cache,
        toDirectory: targetDirectory,
      });

      console.log('copy result ', copyResult);

      // Clean up the cache
      await this.cleanupCache();

      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF', error);
    }
  }

  // Clean up the cached file
  async cleanupCache() {
    if (!this.pdfPath) return;

    try {
      await Filesystem.deleteFile({
        path: this.saveFileName,
        directory: Directory.Cache,
      });
      this.pdfPath = null;
      this.isRendered = false;
    } catch (error) {
      console.error('Error cleaning up cache', error);
    }
  }

  constructor(
    private platform: Platform,
  ) {
    try {
      GlobalWorkerOptions.workerSrc = '/assets/pdfjs.worker.min.js';


    } catch (error) {
      console.error("Error while setting worker", error);
    }
  }

  ngOnInit() {
  }

}
