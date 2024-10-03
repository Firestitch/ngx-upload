import { CommonModule } from '@angular/common';
import { Injector, ModuleWithProviders, NgModule } from '@angular/core';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { FsDateModule } from '@firestitch/date';

import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { FsUploadComponent } from './components/upload/upload.component';
import { FS_UPLOAD_CONFIG, FS_UPLOAD_CONFIG_ORIGINAL } from './consts/const';
import { FsUploadConfigInit } from './functions/upload-config-init.function';
import { UploadInterceptor } from './interceptors/upload-interceptor.interceptor';
import { UploadConfig } from './interfaces/upload-config';
import { UploadDialog } from './services/upload-dialog.service';
import { UploadService } from './services/upload.service';


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
    FsUploadComponent,
  ],
  declarations: [
    FsUploadComponent,
  ],
})
export class FsUploadModule {
  public static forRoot(config?: UploadConfig): ModuleWithProviders<FsUploadModule> {
    return {
      ngModule: FsUploadModule,
      providers: [
        UploadDialog,
        UploadService,
        { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor,
          deps: [UploadDialog, UploadService, Injector], multi: true },
        { provide: FS_UPLOAD_CONFIG_ORIGINAL, useValue: config },
        { provide: FS_UPLOAD_CONFIG, useFactory: FsUploadConfigInit, deps: [FS_UPLOAD_CONFIG_ORIGINAL] },
      ],
    };
  }
}
