import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FsComponentComponent } from '../components/fs-component/fs-component.component';
import { BehaviorSubject } from 'rxjs';


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

    this.dialogRef = this.dialog.open(FsComponentComponent, {
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
