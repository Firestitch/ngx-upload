import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { FsUploadComponent } from '../components/upload/upload.component';


@Injectable()
export class UploadDialog {

  private files = new BehaviorSubject([]);
  private dialogRef;
  private data = { files: this.files };

  constructor(private dialog: MatDialog) {}

  public open() {

    if (this.dialogRef) {
      return;
    }

    this.dialogRef = this.dialog.open(FsUploadComponent, {
      width: '450px',
      hasBackdrop: false,
      position: { bottom: '20px', right: '20px' },
      data: this.data
    });

    const afterClose = this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
      this.files.next([]);
      afterClose.unsubscribe();
    });
  }

  public addFiles(files) {
    this.files.next(files);
  }
}
