import { remove } from 'lodash-es';
import { UploadFile } from './../classes/file';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable()
export class UploadService {

  private _files: UploadFile[] = [];
  private _filesAdded$ = new Subject<UploadFile[]>();

  public get filesAdded$() {
    return this._filesAdded$;
  }

  public get files(): UploadFile[] {
    return this._files;
  }

  public addFiles(files) {
    this._filesAdded$.next(files);
    this._files.push(...files);
  }

  public removeFiles(files) {
    remove(this._files, (file) => {
       return files.indexOf(file) >= 0;
    });
  }
}
