import { ErrorHandler, Injectable, Injector, NgZone } from "@angular/core";
import { HttpErrorResponse } from '@angular/common/http';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import { TranslateService, TranslateStore, } from '@ngx-translate/core';

@Injectable()
export class ApplicationErrorHandler extends ErrorHandler {

    private swal_error: SwalComponent;

    constructor(private injector: Injector, private translate: TranslateService, private zone: NgZone) {
        super()
    }

    goToLoginPage() {
        this.injector.get(Router).navigate(['/index/signin']);  
    }

    handleError(errorResponse: HttpErrorResponse | any): any {
        if (errorResponse instanceof HttpErrorResponse) {
            this.zone.run(() => {
                // Get the error code based on the response or throws default error (Unknown Error)
                try {
                    this.translate.get(`errors.${errorResponse.statusText}`).subscribe(translation => {
                        this.swal_error = new SwalComponent ({
                            title: translation.title,
                            text: translation.text,
                            type: 'error'
                        });
                        this.swal_error.show()
                    }).unsubscribe()
                } catch (error) {
                    this.translate.get(`errors.Unknown Error`).subscribe(translation => {
                        this.swal_error = new SwalComponent ({
                            title: translation.title,
                            text: translation.text,
                            type: 'error'
                        });
                        this.swal_error.show()
                    }).unsubscribe()
                }
            })
        }
        super.handleError(errorResponse)
    }
}