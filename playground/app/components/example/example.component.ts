import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FsApi } from '@firestitch/api';
import { FsMessage, MessageMode } from '@firestitch/message';
import { DisplayUploadStatus } from '@firestitch/upload';

import { HttpContext } from '@angular/common/http';

@Component({
  selector: 'example',
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleComponent {

  public files = [];
  public kbLoaded = 0;
  public percent = 0;
  public url = 'https://specify.firestitch.dev/api/dummy/upload';

  constructor(
    private _api: FsApi,
    private _message: FsMessage,
  ) {
  }

  public select(fsFiles, error?, sleep?) {
    this.files.push(...fsFiles);

    fsFiles.forEach((fsFile) => {
      const data: any = { 
        file: fsFile.file, 
        sleep, 
      };

      if (error) {
        data.exception = 'Something bad happened and there is no way to fix it! Call 911!';
      }

      this.kbLoaded = 0;
      this.percent = 0;

      this._api.post(this.url, data, {
        context: new HttpContext().set(DisplayUploadStatus, true),  
      })
        .subscribe((event) => {
          this._message.success('Upload Successful');
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
          this._message.error(err.message, { mode: MessageMode.Toast });
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
