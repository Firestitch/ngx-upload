import { UploadFileStatus } from "./upload-file-status";
import { Subject } from "rxjs";


export class UploadFile {
  public file: File;
  public cancelSubject: Subject<void>;
  public percent = 0;
  public message = '';
  public icon = 'insert_drive_file';
  public status: UploadFileStatus;

  constructor(file: File, cancelSubject) {
    this.file = file;
    this.cancelSubject = cancelSubject;
    // insert_photo
    // videocam
  }

  public cancel() {
    this.cancelSubject.next();
    this.status = UploadFileStatus.Cancelled;
    this.message = 'Upload was cancelled';
  }
}