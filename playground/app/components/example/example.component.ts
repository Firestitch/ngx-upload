import { HttpContext } from '@angular/common/http';
import { Component } from '@angular/core';
import { FsApi } from '@firestitch/api';
import { FsMessage, MessageMode } from '@firestitch/message';
import { DisplayUploadStatus } from '@firestitch/upload';

@Component({
  selector: 'example',
  templateUrl: 'example.component.html'
})
export class ExampleComponent {

  files = [];
  kbLoaded = 0;
  percent = 0;
  url = 'https://specify.dev.firestitch.com/api/dummy';

  public constructor(
    private fsApi: FsApi,
    private fsMessage: FsMessage,
  ) {
  }

  public select(fsFiles, error?, sleep?) {
    this.files.push(...fsFiles);

    fsFiles.forEach(fsFile => {
      const data: any = { 
        file: fsFile.file, 
        sleep 
      };

      if (error) {
        data.exception = 'Something bad happened and there is no way to fix it! Call 911!';
      }

      this.kbLoaded = 0;
      this.percent = 0;

      this.fsApi.post(this.url, data, {
        context: new HttpContext().set(DisplayUploadStatus, true)  
      })
        .subscribe(event => {
          this.fsMessage.success('Upload Successful');
          // if (event.type === HttpEventType.Sent) {
          //   fsFile.progress = true;
          // }

          // if (event.type === HttpEventType.UploadProgress) {
          //   this.kbLoaded = Math.round(event.loaded / 1024);
          //   this.percent = Math.round((event.loaded / event.total) * 100);
          // }

          // if (event.type === HttpEventType.ResponseHeader) {

          // }

          // if (event.type === HttpEventType.DownloadProgress) {

          // }

          // if (event.type === HttpEventType.Response) {

          // }
        }, (err) => {
          this.fsMessage.error(err.message, { mode: MessageMode.Toast });
        }, () => {

          //this.fsMessage.info('Upload Cancelled');
          const idx = this.files.indexOf(fsFile);
          if (idx >= 0) {
            this.files.splice(idx, 1);
          }
          this.percent = 0;

        });
    });
  }
}
