import { Injectable, Injector } from '@angular/core';
import { remove } from 'lodash-es';

import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, takeUntil, tap, finalize } from 'rxjs/operators';

import { UploadDialog } from '../services/upload-dialog.service';
import { UploadFileStatus } from '../classes/upload-file-status';
import { UploadFile } from '../classes/file';
import { FS_UPLOAD_CONFIG} from '../classes/const';
import { UploadConfig } from '../interfaces/upload-config';
import { UploadStatus } from '../classes/upload-status';
import { UploadService } from '../services/upload.service';


@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  private config: UploadConfig;
  private _uploadStatuses: UploadStatus[] = [];

  constructor(private _uploadDialog: UploadDialog,
              private _uploadService: UploadService,
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

    this._uploadDialog.addFiles(files);
    const uploadStatus = new UploadStatus(files);
    this._uploadStatuses.push(uploadStatus);

    return r.pipe(
      tap((event: HttpEvent<any>) => {

        if (event.type === HttpEventType.Sent) {
          this._uploadDialog.open();
          this.setFileStatus(files, UploadFileStatus.Uploading);
        }

        if (event.type === HttpEventType.UploadProgress) {

          uploadStatus.update(event);

          this._uploadService.uploadStatus$.next(this._uploadStatuses);

          const percent = (event.loaded / event.total) * 100;
          files.forEach((file) => {
            file.percent = percent;
          });

          if (percent >= 100) {
            remove(this._uploadStatuses, uploadStatus);
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
        remove(this._uploadStatuses, uploadStatus);

        let message = err.message;
        if (err.error && err.error.message) {
          message = err.error.message;
        }

        this.setFileStatus(files, UploadFileStatus.Failed, message);
        return throwError(err);
      }),
      finalize(() => {
        remove(this._uploadStatuses, uploadStatus);
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
