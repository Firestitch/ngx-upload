import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpEventType } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { UploadDialog } from '../services/upload-dialog.service';
import { UploadFile, UploadFileStatus, FS_UPLOAD_CONFIG } from '../classes';
import { UploadConfig } from '../interfaces';

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  constructor(private uploadDialog: UploadDialog,
              @Inject(FS_UPLOAD_CONFIG) private config: UploadConfig) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let upload = req.body instanceof FormData;

    if (upload) {
      upload = this.config.upload;

      if (req.headers.has('FsUpload')) {
        upload = !!req.headers.get('FsUpload');
      }
    }

    if (!upload) {
      return next.handle(req);
    }

    const cancelPendingRequests = new Subject<void>();
    const r = next.handle(req.clone({ reportProgress: true, headers: req.headers.delete('FsUpload') }));

    const files = [];
    (<any>req.body).forEach(file => {
      if (file instanceof File) {
        files.push(new UploadFile(file, cancelPendingRequests));
      }
    });

    this.uploadDialog.addFiles(files);

    return r.pipe(
      tap((event: HttpEvent<any>) => {

        if (event.type === HttpEventType.Sent) {
          this.uploadDialog.open();
          this.setFileStatus(files, UploadFileStatus.Uploading);
        }

        if (event.type === HttpEventType.UploadProgress) {
          const percent = (event.loaded/event.total) * 100;
          files.forEach((file) => {
            file.percent = percent;
          });

          if(percent>=100) {
            this.setFileStatus(files, UploadFileStatus.Processing);
          }
        }

        if (event.type === HttpEventType.ResponseHeader) {
          if (event.status && event.status<400) {
            this.setFileStatus(files, UploadFileStatus.Uploaded);
          }
        }
      }),
      takeUntil(
        cancelPendingRequests.asObservable()
      ),
      catchError((err, caught) => {

        let message = err.message;
        if (err.error && err.error.message) {
          message = err.error.message;
        }

        this.setFileStatus(files, UploadFileStatus.Failed, message);
        return _throw(err);
      })
    );
  }

  private setFileStatus(files, status, message?) {
    files.forEach((file) => {
      file.setStatus(status,message);
    });
  }
}