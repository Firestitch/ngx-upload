import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpEventType, HttpSentEvent, HttpProgressEvent } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';
import { UploadDialog } from '../services';
import { UploadFile, UploadFileStatus } from '../classes';

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  constructor(private uploadDialog: UploadDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.headers.has('FsUpload') || !(req.body instanceof FormData)) {
      return next.handle(req);
    }

    const cancelPendingRequests = new Subject<void>()
    const r = next.handle(req.clone({ reportProgress: true, headers: req.headers.delete('FsUpload') }));

    const files = [];
    (<any>req.body).forEach(file => {
      if (file instanceof File) {
        files.push(new UploadFile(file, cancelPendingRequests));
      }
    });

    this.uploadDialog.files.push(...files);

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

          if (event.status>=200 && event.status<300) {
            this.setFileStatus(files, UploadFileStatus.Complete);
          } else {
            this.setFileStatus(files, UploadFileStatus.Error);
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

        this.setFileStatus(files, UploadFileStatus.Error, message);

        return _throw(err);
      })
    );
  }

  private setFileStatus(files, status, message?) {
    files.forEach((file) => {
      file.status = status;
      file.message = message;
    });
  }
}