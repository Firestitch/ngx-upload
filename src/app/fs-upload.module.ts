import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsComponentComponent } from './components/fs-component/fs-component.component';
import { UploadDialog } from './services/upload-dialog.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UploadInterceptor } from './interceptors/interceptor';
import { FS_UPLOAD_CONFIG, FS_UPLOAD_CONFIG_ORIGINAL } from './classes/const';
import { UploadConfig } from './interfaces/upload-config';
import { FsUploadConfigInit } from './functions/upload-config-init.function';

import {
  MatDialogModule,
  MatIconModule,
  MatButtonModule,
  MatProgressSpinnerModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  exports: [
    FsComponentComponent
  ],
  entryComponents: [
    FsComponentComponent
  ],
  declarations: [
    FsComponentComponent,
  ]
})
export class FsUploadModule {
  static forRoot(config?: UploadConfig): ModuleWithProviders {
    return {
      ngModule: FsUploadModule,
       providers: [
        UploadDialog,
        { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true },
        { provide: FS_UPLOAD_CONFIG_ORIGINAL, useValue: config },
        { provide: FS_UPLOAD_CONFIG, useFactory: FsUploadConfigInit, deps: [ FS_UPLOAD_CONFIG_ORIGINAL ] },
      ]
    };
  }
}