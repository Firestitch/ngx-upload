import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { HttpProgressEvent } from '@angular/common/http';

import { UploadFileStatus } from '../enums/upload-file-status';


export class UploadFile {

  public file: File;  
  public percent = 0;
  public loaded = 0;
  public message = '';
  public fileType = 'generic';
  public icon = 'insert_drive_file';
  public started: Date = null;
  public completed: Date = null;

  private _statusSubject = new BehaviorSubject<UploadFileStatus>(UploadFileStatus.Queued);
  private _cancelSubject: Subject<void>;

  constructor(file: File, cancelSubject: Subject<any>) {
    this.file = file;
    this._cancelSubject = cancelSubject;

    if (file.type.match(/^image/)) {
      this.icon = 'insert_photo';
      this.fileType = 'image';
    }

    if (file.type.match(/^video/)) {
      this.icon = 'videocam';
      this.fileType = 'video';
    }
  }

  public get status$(): Observable<UploadFileStatus> {
    return this._statusSubject.asObservable();
  }

  public get status(): UploadFileStatus {
    return this._statusSubject.getValue();
  }

  public setStatus(status: UploadFileStatus, message: string) {
    if (status === UploadFileStatus.Uploading && !this.started) {
      this.started = new Date();
    }

    this.message = message;
    this._statusSubject.next(status);

    switch (status) {
      case UploadFileStatus.Cancelled:
      case UploadFileStatus.Failed:
      case UploadFileStatus.Uploaded:
        this.completed = new Date();
        this._statusSubject.complete();
        break;
    }
  }

  public cancel() {
    this._cancelSubject.next(null);
    this.setStatus(UploadFileStatus.Cancelled, 'Upload was cancelled');
  }

  public get bytesPerSecond() {
    return (this.loaded / this.elapsedSeconds) || 0;
  }

  public get elapsedSeconds() {
    const end = this.completed ? this.completed : new Date();

    return (end.getTime() - this.started.getTime()) / 1000;
  }

  public update(event: HttpProgressEvent) {
    this.loaded = event.loaded;
    this.percent = (event.loaded / this.file.size) * 100;
  }

  public isCompleted() {
    return !!this.completed;
  }
}
