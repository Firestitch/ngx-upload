import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FsUploadModule } from '@firestitch/upload';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { FsApiModule } from '@firestitch/api';
import { FsExampleModule } from '@firestitch/example';
import { FsMessageModule } from '@firestitch/message';
import { ToastrModule } from 'ngx-toastr';
import { FsFileModule } from '@firestitch/file';
import { provideRouter, Routes } from '@angular/router';
import { ExamplesComponent } from './app/components';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  { path: '', component: ExamplesComponent },
];



if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, FsUploadModule.forRoot({}), FormsModule, FsApiModule.forRoot({ maxFileConnections: 3 }), FsExampleModule.forRoot({ iframeObserveBody: true }), FsMessageModule.forRoot(), ToastrModule.forRoot(), FsFileModule.forRoot()),
        provideAnimations(),
        provideRouter(routes),
    ]
})
  .catch(err => console.error(err));

