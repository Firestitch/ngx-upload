import { Subject } from 'rxjs';
import { UploadFileStatus } from './upload-file-status';


export class UploadFile {
  public file: File;
  public cancelSubject: Subject<void>;
  public statusSubject = new Subject();
  public percent = 0;
  public message = '';
  public fileType = 'generic';
  public icon = 'insert_drive_file';
  public status: UploadFileStatus;

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

  public setStatus(status, message) {
    this.status = status;
    this.message = message;
    this.statusSubject.next(status);

    if (
      status === UploadFileStatus.Cancelled
      || status === UploadFileStatus.Failed
      || status === UploadFileStatus.Uploaded
    ) {
      this.statusSubject.complete();
    }
  }

  public cancel() {
    this.cancelSubject.next();
    this.setStatus(UploadFileStatus.Cancelled, 'Upload was cancelled');
  }
}
