import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';

import { Filesystem, Directory } from '@capacitor/filesystem';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Capacitor } from '@capacitor/core';

(<any>pdfMake).addVirtualFileSystem(pdfFonts);

@Component({
  selector: 'app-export-profile',
  templateUrl: './export-profile.page.html',
  styleUrls: ['./export-profile.page.scss'],
  standalone: false
})
export class ExportProfilePage implements OnInit {

  saveFileName: string = "sample.pdf";

  previewFileName: string = 'sample.jpeg';

  isRendered: boolean = false;

  pdfObject: pdfMake.TCreatedPdf | undefined;

  pdfFileUri: string | undefined;

  pdfBase64Data: string = '';

  pdfImageSrcSafeUri: string = ''

  @ViewChild('pdfViewer') pdfViewer!: ElementRef;


  constructor(
    private platform: Platform,
    private toastController: ToastController,
  ) {
  
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // this.initializePDF();
  }

  getImgSrcUri() {
    return `data:application/pdf;base64,${this.pdfBase64Data}`;
  }

  async showToast(message: string, type: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass: `custom-toast-${type}`,
    });
    toast.present();
  }

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

  async initializePDF() {
    const pdfDefinition = this.getPdfDefinition();
    this.pdfObject = pdfMake.createPdf(pdfDefinition);

    const saveDir = Directory.Documents;

    this.pdfObject.getBase64(async (base64Data) => {
      // Write the file as an image to the cache directory
      try {
        const writeResult = await Filesystem.writeFile({
          path: this.saveFileName,
          directory: Directory.Cache,
          data: base64Data,
          recursive: true,
        })


        // var raw = atob(base64Data);
        // var uint8Array = new Uint8Array(raw.length);
        // for (var i = 0; i < raw.length; i++) {
        //   uint8Array[i] = raw.charCodeAt(i);
        // }

        // var blob = new Blob([uint8Array], {type: 'application/jpeg'});

        this.pdfImageSrcSafeUri = writeResult.uri;

        // console.log(this.pdfImageSrcSafeUri)
        // console.log(blob);


        console.log(writeResult);
        this.pdfFileUri = Capacitor.convertFileSrc(writeResult.uri);

        console.log('File saved successfully!');

        this.isRendered = true

      } catch (error) {
        console.error('write file error ', error);
        this.isRendered = false;
      }
    }
    );
  }

  // Download the PDF to the appropriate directory
  async downloadPdf() {
    // if (!this.pdfImageSrcSafeUri || this.pdfImageSrcSafeUri.trim() == '') return;

    try {

      const targetDirectory = Directory.Documents;

      console.log(this.pdfFileUri);

      if (!this.pdfFileUri) return;

      console.log('downloading');
      const fileName = `PDF_${Date.now()}.jpeg`; // Store the file name

      this.pdfObject?.getBase64(async (base64Data) => {
        // Write the file as an image to the cache directory
        try {
          const writeResult = await Filesystem.writeFile({
            path: fileName,
            directory: targetDirectory,
            data: base64Data,
            recursive: true,
          })

          console.log(writeResult);
          this.pdfFileUri = Capacitor.convertFileSrc(writeResult.uri);

          await Filesystem.stat({
            directory: targetDirectory,
            path: fileName,

          })

          console.log('File downloaded successfully!');

          this.isRendered = true

        } catch (error) {
          console.error('write file error ', error);
          this.isRendered = false;
        }
      }
      );

    } catch (error) {
      console.error('Error downloading PDF', error);
      this.showToast("Error downloading PDF ", 'error');

    }
  }

  // Clean up the cached file
  async cleanupCache() {
    if (!this.pdfImageSrcSafeUri) return;

    try {
      await Filesystem.deleteFile({
        path: this.previewFileName,
        directory: Directory.Cache,
      });

      this.pdfImageSrcSafeUri = '';
      this.isRendered = false;
    } catch (error) {
      console.error('Error cleaning up cache', error);
      throw error;
    }
  }

  async ensureDownloadsSubdir() {
    try {
      // Attempt to create the Downloads subdirectory
      await Filesystem.mkdir({
        path: 'Downloads',
        directory: Directory.External,
        recursive: true, // Ensures parent directories are created if needed
      });
      console.log('Downloads directory ensured');
    } catch (error: any) {
      if (error.message !== 'Directory exists' || !`${error.message}`.includes('exists')) {
        console.error('Error ensuring Downloads directory:', error);
        this.showToast('Error creating Downloads directory.', 'error');
        throw error;
      }
      console.log('Downloads directory already exists');
    }
  }

  async saveFileWithChunking(
    base64Data: string,
    fileDownloadPath: string,
    directoryToSave = Directory.Cache
  ) {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(base64Data.length / chunkSize);

    console.log(base64Data)
    console.log('saveFile')

    try {
      console.log(`trying to save ${fileDownloadPath} at ${directoryToSave} ${totalChunks}`)

      // Initialize the file      
      await Filesystem.writeFile({
        path: `${fileDownloadPath}`,
        directory: directoryToSave,
        data: '', // Start with an empty file
        recursive: true,
      });

      console.log('initialized');

      // Write data in chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunk = base64Data.slice(i * chunkSize, (i + 1) * chunkSize);
        console.log('write chunk ', i);

        await Filesystem.appendFile({
          path: `${fileDownloadPath}`,
          directory: directoryToSave,
          data: chunk,
        });

        console.log(`Chunk ${i + 1}/${totalChunks} written.`);
      }

      // file cretion might take longer
      // therefore for 20 ms
      setTimeout(() => {

      }, 20);

      console.log('File saved successfully. ', fileDownloadPath, directoryToSave);
    } catch (error) {
      console.error('Error saving file:', error);
      this.showToast('Error saving file.', 'error');
      throw error;
    }
  }



  ionViewDidLeave() {
    this.cleanupCache();
  }

  ngOnDestroy() {
    this.cleanupCache();
  }
}
