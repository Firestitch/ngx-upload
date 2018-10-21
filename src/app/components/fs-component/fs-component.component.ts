import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'fs-component',
  templateUrl: 'fs-component.component.html',
  styleUrls: [ 'fs-component.component.scss' ],
})
export class FsComponentComponent {

  public fileClasses = {  1: 'uploading',
                          2: 'processing',
                          3: 'complete',
                          4: 'error',
                          5: 'cancelled' };

  constructor(public dialogRef: MatDialogRef<FsComponentComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {
  }

  public cancel(file) {
    file.cancel();
  }
}
