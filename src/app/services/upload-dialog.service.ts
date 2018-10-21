import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FsComponentComponent } from '../components';


@Injectable()
export class UploadDialog {

  public files = [];
  private isOpen = false;

  constructor(private dialog: MatDialog) {}

  public open() {

    if (this.isOpen) {
      return;
    }

    this.isOpen = true;

    const dialogRef = this.dialog.open(FsComponentComponent, {
      width: '450px',
      hasBackdrop: false,
      position: { bottom: '20px', right: '20px' },
      data: { files: this.files }
    });

    const afterClose = dialogRef.afterClosed().subscribe(result => {
      this.isOpen = false;
      this.files = [];
      afterClose.unsubscribe();
    });
  }
}
