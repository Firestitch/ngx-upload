import { UploadFile } from './../classes/file';
import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FsUploadComponent } from '../components/upload/upload.component';
import { UploadService } from './upload.service';


@Injectable()
export class UploadDialog {

  private _dialogRef: MatDialogRef<FsUploadComponent>;

  constructor(
    private _dialog: MatDialog,
    private _overlay: Overlay,
    private _uploadService: UploadService,
  ) { }

  public open() {

    if (this._dialogRef) {
      return;
    }

    this._dialogRef = this._dialog.open(FsUploadComponent, {
      width: '450px',
      hasBackdrop: false,
      panelClass: 'fs-upload-pane',
      position: { bottom: '20px', right: '20px' },
      disableClose: true,
      scrollStrategy: this._overlay.scrollStrategies.noop(),
    });

    const afterClose = this._dialogRef
      .afterClosed()
      .subscribe(result => {

        const files = this._uploadService.files.filter((file: UploadFile) => {
          return file.isCompleted();
        });

        this._uploadService.removeFiles(files);
        this._dialogRef = null;
        afterClose.unsubscribe();
      });
  }

}
