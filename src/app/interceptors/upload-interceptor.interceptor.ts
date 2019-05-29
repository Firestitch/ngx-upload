import { Injectable, Injector } from '@angular/core';

import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { UploadDialog } from '../services/upload-dialog.service';
import { UploadFileStatus } from '../classes/upload-file-status';
import { UploadFile } from '../classes/file';
import { FS_UPLOAD_CONFIG} from '../classes/const';
import { UploadConfig } from '../interfaces/upload-config';


@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  private config: UploadConfig;

  constructor(private uploadDialog: UploadDialog,
              private injector: Injector) {
    this.config = this.injector.get(FS_UPLOAD_CONFIG)();
  }

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
    const r = next.handle(req.clone({
      reportProgress: true,
      headers: req.headers.delete('FsUpload')
    }));

    const files = [];
    (<any>req.body).forEach(file => {
      if (this.isFile(file)) {
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
          const percent = (event.loaded / event.total) * 100;
          files.forEach((file) => {
            file.percent = percent;
          });

          if (percent >= 100) {
            this.setFileStatus(files, UploadFileStatus.Processing);
          }
        }

        if (event.type === HttpEventType.ResponseHeader) {
          if (event.status && event.status < 400) {
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
        return throwError(err);
      })
    );
  }

  private setFileStatus(files, status, message?) {
    files.forEach((file) => {
      file.setStatus(status, message);
    });
  }

  private isFile(file: any) {
    return  file instanceof File ||
            (typeof file === 'object' && file.constructor && file.constructor.name === 'File') ||
            (typeof file === 'object' && typeof file.name === 'string' && file instanceof Blob);
  }
}
