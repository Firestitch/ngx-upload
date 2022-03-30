import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FsApiModule } from '@firestitch/api';
import { FsExampleModule } from '@firestitch/example';
import { FsFileModule } from '@firestitch/file';
import { FsMessageModule } from '@firestitch/message';
import { FsUploadModule } from '@firestitch/upload';

import { ToastrModule } from 'ngx-toastr';

import { AppMaterialModule } from './material.module';
import { ExampleComponent, ExamplesComponent } from './components';
import { AppComponent } from './app.component';


const routes: Routes = [
  { path: '', component: ExamplesComponent },
];

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FsUploadModule.forRoot({}),
    BrowserAnimationsModule,
    AppMaterialModule,
    FormsModule,
    FsApiModule.forRoot({ maxFileConnections: 3 }),
    FsExampleModule.forRoot({ iframeObserveBody: true }),
    FsMessageModule.forRoot(),
    ToastrModule.forRoot(),
    FsFileModule.forRoot(),
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
  ],
  entryComponents: [],
  declarations: [
    AppComponent,
    ExamplesComponent,
    ExampleComponent
  ],
  providers: [],
})
export class PlaygroundModule {
}
