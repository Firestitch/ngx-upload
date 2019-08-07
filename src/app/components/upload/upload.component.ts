import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UploadFileStatus } from './../../classes/upload-file-status';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UploadService } from '../../services/upload.service';
import { duration } from '@firestitch/date';
import { UploadStatus } from 'src/app/classes/upload-status';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'fs-component',
  templateUrl: 'upload.component.html',
  styleUrls: ['upload.component.scss'],
})
export class FsUploadComponent implements OnDestroy {

  public files = [];
  public failed = 0;
  public uploaded = 0;
  public processing = 0;
  public cancelled = 0;
  public uploading = 0;
  public remaining = '';
  private closingProgressInterval;
  public closingPercent = 0;
  public closingTimeout = 15;
  public closingSeconds = 0;
  public fileClasses = {
    1: 'uploading',
    2: 'processing',
    3: 'complete',
    4: 'failed',
    5: 'cancelled'
  };

  private _destroy$ = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<FsUploadComponent>,
              private _uploadService: UploadService,
              @Inject(MAT_DIALOG_DATA) public data) {

    this._uploadService.uploadStatus$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((uploadedStatuses: UploadStatus[]) => {

        this.remaining = '';

        if (uploadedStatuses.length) {

          let bytesPerSecond = 0;
          let remainingBytes = 0;

          const statuses = uploadedStatuses.filter(item => {
            return item.status === HttpEventType.UploadProgress;
          });

          statuses.forEach(uploadedStatus => {
            bytesPerSecond += uploadedStatus.bytesPerSecond;
            remainingBytes += uploadedStatus.remainingBytes;
          });

          const remainingSeconds = remainingBytes / (bytesPerSecond / statuses.length);

          if (remainingSeconds > 0) {
            this.remaining = ' '
                              .concat(duration(remainingSeconds, { hours: true, minutes: true, seconds: true }))
                              .concat(' remaining');
          }
        }
      });

    this.data.files
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(files => {

        this.files.push(...files);
        this.clearClosing();

        files.forEach(file => {

          file.statusSubject
          .pipe(
            takeUntil(this._destroy$),
          )
          .subscribe(status => {

            let uploading = 0;
            let uploaded = 0;
            let processing = 0;
            let failed = 0;
            let cancelled = 0;

            this.files.forEach(file => {
              switch (file.status) {
                case UploadFileStatus.Uploading:
                  uploading++;
                  break;
                case UploadFileStatus.Processing:
                  processing++;
                  break;
                case UploadFileStatus.Uploaded:
                  uploaded++;
                  break;
                case UploadFileStatus.Failed:
                  failed++;
                  break;
                case UploadFileStatus.Cancelled:
                  cancelled++;
                  break;
              }
            });

            this.uploading = uploading;
            this.uploaded = uploaded;
            this.processing = processing;
            this.failed = failed;
            this.cancelled = cancelled;

            if (status !== UploadFileStatus.Failed &&
                status !== UploadFileStatus.Cancelled &&
                !this.uploading &&
                !this.processing) {
              this.startClosing();
            }
          });
        });
    });
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public cancel(file) {
    file.cancel();
  }

  public clearClosing() {
    clearInterval(this.closingProgressInterval);
    this.closingPercent = 0;
  }

  private startClosing() {

    if (this.failed) {
      return;
    }

    const interval = 100;
    this.clearClosing();
    this.closingProgressInterval = setInterval(() => {
      this.closingPercent += (interval / (this.closingTimeout * 1000)) * 100;
      this.closingSeconds = Math.floor(this.closingTimeout - ((this.closingPercent / 100) * this.closingTimeout));

      if (this.closingSeconds <= 0) {
        this.clearClosing();
        this.dialogRef.close();
      }
    }, interval);
  }
}
