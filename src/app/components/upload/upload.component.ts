import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UploadFileStatus } from '../../enums/upload-file-status';

import { UploadFile } from './../../classes/file';
import { UploadService } from './../../services';

@Component({
  selector: 'fs-component',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsUploadComponent implements OnDestroy, OnInit {

  public files: UploadFile[] = [];
  public failed = 0;
  public uploaded = 0;
  public processing = 0;
  public cancelled = 0;
  public uploading = 0;
  public queued = 0;
  public remainingSeconds: number;
  public closingPercent = 0;
  public closingSeconds = null;
  public uploadTotalBytes = 0;
  public uploadLoadedBytes = 0;
  public UploadFileStatus = UploadFileStatus;
  public bytesPerSecond: number[] = [];

  private _destroy$ = new Subject<void>();

  constructor(
    private _dialogRef: MatDialogRef<FsUploadComponent>,
    private _uploadService: UploadService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }
 
  public ngOnInit(): void {
    this._uploadService.removeCompletedFiles();
    this._addFiles(this._uploadService.files);

    this._uploadService.filesAdded$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((files) => {
        this._addFiles(files);
      });

    interval(1000)
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        if (this.uploading) {
          this._calcRemaning();
          this._cdRef.markForCheck();
        }

        if (!this.running) {
          this.closingSeconds--;
          this._cdRef.markForCheck();

          if (this.closingSeconds <= 0) {
            this._clearClosing();
            this._dialogRef.close();
          }
        }
      });
  }

  public cancel(file) {
    file.cancel();
    this._update();
    this._cdRef.markForCheck();
  }

  public get running() {
    return this.uploading || this.processing || this.queued;
  }

  public ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _addFiles(files: UploadFile[]) {
    this.files.push(...files);

    this.uploadTotalBytes += files
      .reduce((total: number, file) => {
        return total + file.file.size;
      }, 0);

    this._clearClosing();
    files.forEach((file: UploadFile) => {
      this._processFile(file);
    });

    this._cdRef.markForCheck();
  }

  private _calcRemaning() {
    const bytesPerSecond = this.bytesPerSecond.reduce((total, value) => {
      return total + value;
    }, 0);

    const avgBytesPerSecond = bytesPerSecond / this.bytesPerSecond.length;
    const bytes = this.uploadTotalBytes - this.uploadLoadedBytes;

    this.remainingSeconds = Math.floor(bytes / avgBytesPerSecond);
  }

  private _processFile(file: UploadFile) {
    file.status$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        this._update();
        this._cdRef.markForCheck();
      });
  }

  private _update() {
    let uploading = 0;
    let uploaded = 0;
    let processing = 0;
    let failed = 0;
    let cancelled = 0;
    let queued = 0;
    let uploadLoadedBytes = 0;
    this.closingSeconds = null;

    this.files
      .forEach((file: UploadFile) => {
        uploadLoadedBytes += file.loaded;
        switch (file.status) {
          case UploadFileStatus.Uploading:
            if (file.bytesPerSecond) {
              this.bytesPerSecond.unshift(file.bytesPerSecond);
            }
            uploading++;
            break;
          case UploadFileStatus.Processing:
            processing++;
            break;
          case UploadFileStatus.Uploaded:
            uploaded++;
            break;
          case UploadFileStatus.Cancelled:
            cancelled++;
            break;
          case UploadFileStatus.Failed:
            failed++;
            break;
          case UploadFileStatus.Queued:
            queued++;
            break;
        }
      });

    this.uploading = uploading;
    this.uploaded = uploaded;
    this.processing = processing;
    this.failed = failed;
    this.cancelled = cancelled;
    this.queued = queued;
    this.uploadLoadedBytes = uploadLoadedBytes;
    this.bytesPerSecond = this.bytesPerSecond.splice(0, 50);

    if (!this.running) {
      this._startClosing();
      this.remainingSeconds = 0;
    }
  }

  private _clearClosing() {
    this.closingSeconds = null;
  }

  private _startClosing() {
    const lastFile = this.files[this.files.length - 1];
    this.closingSeconds = lastFile?.status === UploadFileStatus.Failed ?
      20 : 0;
  }
}
