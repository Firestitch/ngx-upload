import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FsComponentComponent } from './components/fs-component/fs-component.component';
import { UploadDialog } from './services';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UploadInterceptor } from './interceptors/interceptor';

import {
  MatDialogModule,
  MatIconModule,
  MatButtonModule,
  MatProgressSpinnerModule,

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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FsUploadModule,
       providers: [
        UploadDialog,
        { provide: HTTP_INTERCEPTORS, useClass: UploadInterceptor, multi: true }
      ]
    };
  }
}
