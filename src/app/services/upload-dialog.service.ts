import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { FsUploadComponent } from '../components/upload/upload.component';
import { Overlay } from '@angular/cdk/overlay';


@Injectable()
export class UploadDialog {

  private files = new BehaviorSubject([]);
  private dialogRef;
  private data = { files: this.files };

  constructor(private dialog: MatDialog,
              private overlay: Overlay) {}

  public open() {

    if (this.dialogRef) {
      return;
    }

    this.dialogRef = this.dialog.open(FsUploadComponent, {
      width: '450px',
      hasBackdrop: false,
      panelClass: 'fs-upload-pane',
      position: { bottom: '20px', right: '20px' },
      data: this.data,
      scrollStrategy: this.overlay.scrollStrategies.noop()
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
