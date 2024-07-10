import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';


import { UploadFile } from './../classes/file';


@Injectable()
export class UploadService {

  private _files: UploadFile[] = [];
  private _filesAdded$ = new Subject<UploadFile[]>();

  public get filesAdded$(): Observable<UploadFile[]> {
    return this._filesAdded$.asObservable();
  }

  public get files(): UploadFile[] {
    return this._files;
  }

  public addFiles(files) {
    this._filesAdded$.next(files);
    this._files.push(...files);
  }

  public removeCompletedFiles() {
    this._files = this.files
      .filter((uploadFile) => !uploadFile.isCompleted());
  }
}
