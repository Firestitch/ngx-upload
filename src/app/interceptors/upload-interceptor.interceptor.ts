import { Injectable, Injector, NgZone } from '@angular/core';

import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';

import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { UploadFile } from '../classes/file';
import { DisplayUploadStatus } from '../consts';
import { FS_UPLOAD_CONFIG } from '../consts/const';
import { UploadFileStatus } from '../enums/upload-file-status';
import { UploadConfig } from '../interfaces/upload-config';
import { UploadDialog } from '../services/upload-dialog.service';

import { UploadService } from './../services/upload.service';


@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  
  private _config: UploadConfig;

  constructor(
    private _uploadDialog: UploadDialog,
    private _uploadService: UploadService,
    private _injector: Injector,
  ) {
    this._config = this._injector.get(FS_UPLOAD_CONFIG)();
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let upload = req.body instanceof FormData;

    if (upload) {
      upload = this._config.upload;

      if (req.headers.has('FsUpload')) {
        upload = coerceBooleanProperty(req.headers.get('FsUpload'));
      }

      if(!req.context.get(DisplayUploadStatus)) {
        upload = false;
      }
    }

    if (!upload) {
      return next.handle(req);
    }

    const cancelPendingRequests = new Subject<void>();
    const r = next
      .handle(req.clone({
        reportProgress: true,
        headers: req.headers.delete('FsUpload'),
      }));

    const files = [];
    for (const entry of (req.body).entries()) {
      if (this._isFile(entry[1])) {
        files.push(new UploadFile(entry[1], cancelPendingRequests));
      }
    }

    this._injector.get(NgZone)
      .run(() => {
        this._uploadService.addFiles(files);
        this._uploadDialog.open();
      });

    return r.pipe(
      tap((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent: {
            this._setFileStatus(files, UploadFileStatus.Uploading);

            break;
          }
          case HttpEventType.UploadProgress: {
            const percent = (event.loaded / event.total) * 100;
            files.forEach((file: UploadFile) => {
              file.update(event);
            });

            if (percent >= 100) {
              this._setFileStatus(files, UploadFileStatus.Processing);
            } else {
              this._setFileStatus(files, UploadFileStatus.Uploading);
            }
        
            break;
          }
          case HttpEventType.Response: {
            this._setFileStatus(files, UploadFileStatus.Uploaded);
        
            break;
          }
        // No default
        }
      }),
      catchError((err, caught) => {

        let message = err.message;
        if (err.error && err.error.message) {
          message = err.error.message;
        }

        this._setFileStatus(files, UploadFileStatus.Failed, message);

        return throwError(err);
      }),
      finalize(() => {
        const failed = files.some((file) => file.status === UploadFileStatus.Failed);

        if(!failed) {
          this._setFileStatus(files, UploadFileStatus.Uploaded);
        }
      }),
      takeUntil(
        cancelPendingRequests.asObservable(),
      ),
    );
  }

  private _setFileStatus(files: UploadFile[], status, message?) {
    files.forEach((file) => {
      file.setStatus(status, message);
    });
  }

  private _isFile(file: any) {
    return  file instanceof File ||
      (typeof file === 'object' && file.constructor && file.constructor.name === 'File') ||
      (typeof file === 'object' && typeof file.name === 'string' && file instanceof Blob);
  }
}
