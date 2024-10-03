import { Injectable } from '@angular/core';

import { Overlay } from '@angular/cdk/overlay';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

import { take } from 'rxjs/operators';

import { FsUploadComponent } from '../components/upload';


@Injectable()
export class UploadDialog {

  private _dialogRef: MatDialogRef<FsUploadComponent>;

  constructor(
    private _dialog: MatDialog,
    private _overlay: Overlay,
  ) { }

  public get dialogOpen():boolean {
    return !!this._dialogRef;
  }

  public open() {
    if (this._dialogRef) {
      return;
    }

    this._dialogRef = this._dialog
      .open(FsUploadComponent, {
        width: '450px',
        hasBackdrop: false,
        panelClass: 'fs-upload-pane',
        position: { bottom: '20px', right: '20px' },
        disableClose: true,
        scrollStrategy: this._overlay.scrollStrategies.noop(),
      });

    this._dialogRef
      .afterClosed()
      .pipe(
        take(1),
      )
      .subscribe(() => {
        this._dialogRef = null;
      });
  }

}
