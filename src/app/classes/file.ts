import { Subject } from 'rxjs';
import { UploadFileStatus } from '../enums/upload-file-status';
import { HttpProgressEvent } from '@angular/common/http';


export class UploadFile {

  public file: File;
  public cancelSubject: Subject<void>;
  public statusSubject = new Subject();
  public percent = 0;
  public loaded = 0;
  public message = '';
  public fileType = 'generic';
  public icon = 'insert_drive_file';
  public status = UploadFileStatus.Queued;
  public started: Date = null;
  public completed: Date = null;

  constructor(file: File, cancelSubject) {
    this.file = file;
    this.cancelSubject = cancelSubject;

    if (file.type.match(/^image/)) {
      this.icon = 'insert_photo';
      this.fileType = 'image';
    }

    if (file.type.match(/^video/)) {
      this.icon = 'videocam';
      this.fileType = 'video';
    }
  }

  public setStatus(status: UploadFileStatus, message: string) {
    if (status === UploadFileStatus.Uploading && !this.started) {
      this.started = new Date();
    }

    this.status = status;
    this.message = message;
    this.statusSubject.next(status);

    switch (status) {
      case UploadFileStatus.Cancelled:
      case UploadFileStatus.Failed:
      case UploadFileStatus.Uploaded:
        this.completed = new Date();
        this.statusSubject.complete();
        break;
    }
  }

  public cancel() {
    this.cancelSubject.next();
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
