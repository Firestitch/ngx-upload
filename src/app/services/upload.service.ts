import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UploadStatus } from '../classes/upload-status';


@Injectable()
export class UploadService {
  public uploadStatus$ = new Subject<UploadStatus[]>();
}
