import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsUploadComponent } from './components/upload/upload.component';
import { UploadDialog } from './services/upload-dialog.service';
import { UploadService } from './services/upload.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UploadInterceptor } from './interceptors/upload-interceptor.interceptor';
import { FS_UPLOAD_CONFIG, FS_UPLOAD_CONFIG_ORIGINAL } from './consts/const';
import { UploadConfig } from './interfaces/upload-config';
import { FsUploadConfigInit } from './functions/upload-config-init.function';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FsDateModule } from '@firestitch/date';


@NgModule({
  imports: [
    CommonModule,

    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,

    FsDateModule,
  ],
  exports: [
    FsUploadComponent
  ],
  entryComponents: [
    FsUploadComponent
  ],
  declarations: [
    FsUploadComponent,
  ]
})
export class FsUploadModule {
  static forRoot(config?: UploadConfig): ModuleWithProviders {
    return {
      ngModule: FsUploadModule,
       providers: [
         UploadDialog,
         UploadService,
        { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor,
          deps: [ UploadDialog, UploadService, Injector ], multi: true },
        { provide: FS_UPLOAD_CONFIG_ORIGINAL, useValue: config },
        { provide: FS_UPLOAD_CONFIG, useFactory: FsUploadConfigInit, deps: [ FS_UPLOAD_CONFIG_ORIGINAL ] },
      ]
    };
  }
}
