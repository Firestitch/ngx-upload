import { HttpEventType, HttpEvent } from "@angular/common/http";

export class UploadStatus {
  private uploadStarted = new Date();

  constructor(files) {
    files.forEach(file => {
      this.remainingBytes += file.file.size;
    });
  }

  public bytesPerSecond = 0;
  public remainingSeconds = 0;
  public elapsedSeconds = 0;
  public remainingBytes = 0;
  public loadedBytes = 0;
  public status: HttpEventType;

  public update(event: any) {
    this.loadedBytes = event.loaded;
    this.status = event.type;
    this.remainingBytes = event.total - event.loaded;
    this.elapsedSeconds = ((new Date()).getTime() - this.uploadStarted.getTime()) / 1000;
    this.bytesPerSecond = event.loaded / this.elapsedSeconds;
    this.remainingSeconds = this.remainingBytes / this.bytesPerSecond;
  }
}
