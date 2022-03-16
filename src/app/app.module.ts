import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// local modules
import { IndexModule } from './index/index.module';
import { SecurityModule } from './security/security.module';
import { LoggedInGuard } from './security/loggedin.guard';
import { AuthInterceptor } from './security/auth.interceptor';
import { ApplicationErrorHandler } from './app.error-handler';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';

// tslint:disable-next-line:class-name
export class missingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    throw new Error(`No translation for ${params.key} available`);
  }
}

@NgModule({
  declarations: [
    // import components, directives and pipes
    AppComponent
  ],
  imports: [
    // imports modules
    BrowserModule,
    AppRoutingModule,
    IndexModule,
    SecurityModule,
    // configure the imports
    NgbModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useFactory: httpTranslateLoader, deps: [HttpClient] },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: missingTranslationHandler }
    }),
    [SweetAlert2Module.forRoot()],
    BrowserAnimationsModule,
    FontAwesomeModule
  ],
  exports: [TranslateModule],
  providers: [
    // import services
    LoggedInGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ApplicationErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(public library: FaIconLibrary) {
    library.addIcons(fasStar, farStar);
  }

}


// required for AOT (ahead of time) compilation


export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}