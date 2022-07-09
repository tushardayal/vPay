import {Injectable} from '@angular/core';
import {Platform} from "@ionic/angular";
import {AngularAjaxService} from "./aps-services/ajaxService/angular-ajax.service";
import {LoadingService} from "./aps-services/loading-service";
import {ToastService} from "./aps-services/toast-service";

declare let window: any;

@Injectable({
    providedIn: 'root'
})
export class PrintingService {

    constructor(
        private platform: Platform,
        private ajaxService: AngularAjaxService,
        private loadingService: LoadingService,
        private toastservice: ToastService,
    ) {
    }

    public print(pdfObj, filename) {
        // this.loadingService.present();
        if (this.platform.is('cordova')) {
            this.downloadPdf(pdfObj, filename);
        } else {
            pdfObj.download(filename);
        }
    }

    async downloadPdf(pdfObj, filename) {
        try {
            pdfObj.getBase64(async (base64Pdf) => {
                // Define the mimetype of the file to save, in this case a PDF
                const contentType = "application/pdf";
                // The path where the file will be saved
                const folderpath = await this.ajaxService.getDownloadPath();
                this.savebase64AsPDF(folderpath, filename, base64Pdf, contentType);
            }, (err) => {
                console.log('ERR downloadPdf', err);
            });
        } catch (e) {

        }
    }

    /* async downloadPdf(pdfObj) {
         const date = this.usrSrv.formatDate(Date.now());
         const filename = `NDC_Nations Trust Bank_LPOPP_${date}.pdf`;
         const folderpath = await this.ajaxService.getDownloadPath();
         const fileType = 'application/pdf';

         pdfObj.getBuffer((buffer) => {
             const blob = new Blob([buffer], {type: fileType});

             // Save the PDF to the data Directory of our App
             this.file.writeFile(folderpath, filename, blob, {replace: true})
                 .then(fileEntry => {
                     // Open the PDf with the correct OS tools
                     this.toastservice.presentToast(`File Downloaded Successfully At ${folderpath + filename}`, {position: 'top'});
                     const filePathName = folderpath + filename; // cdv File Path not working on iOS
                     this.ajaxService.openFile(filePathName, fileType);
                 }, (err) => {
                     alert('Unable to create file on path ' + JSON.stringify(err));
                 });
         });

     }*/


    /**
     * Convert a base64 string in a Blob according to the data and contentType.
     *
     * @param b64Data String Pure base64 string without contentType
     * @param contentType String the content type of the file i.e (application/pdf - text/plain)
     * @param sliceSize Int SliceSize to process the byteCharacters
     * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @return Blob
     */
    b64toBlob(b64Data, contentType, sliceSize?) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    /**
     * Create a PDF file according to its database64 content only.
     * @param folderpath String The folder where the file will be created
     * @param filename String The name of the file that will be created
     * @param content Base64 String Important : The content can't contain the following string (data:application/pdf;base64).
     * Only the base64 string is expected.
     */
    savebase64AsPDF(folderpath, filename, content, contentType) {
        // Convert the base64 string in a Blob
        const dataBlob = this.b64toBlob(content, contentType);

        console.log("Starting to write the file :3");

        window.resolveLocalFileSystemURL(folderpath, (dir) => {
            console.log("Access to the directory granted succesfully");
            dir.getFile(filename, {create: true}, (file) => {
                console.log("File created succesfully.");
                file.createWriter((fileWriter) => {
                    console.log("Writing content to file");
                    fileWriter.write(dataBlob);
                    // this.loadingService.dismiss();
                    this.toastservice.presentToast(`File Downloaded Successfully At ${folderpath + filename}`, {position: 'top'});
                    const filePathName = folderpath + filename; // cdv File Path not working on iOS
                    this.ajaxService.openFile(filePathName, dataBlob.type);
                }, () => {
                    alert('Unable to save file in path ' + folderpath);
                });
            }, (err) => {
                alert('Unable to create file on path ' + JSON.stringify(err));
            });
        });
    }
}
