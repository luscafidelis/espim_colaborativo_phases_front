import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injector, Injectable } from '@angular/core';
import { LoginService } from './login/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const loginService = this.injector.get(LoginService);
        if (loginService.isLoggedIn()) {
            const headers = new HttpHeaders({
                Authorization: `Bearer google-oauth2 ${loginService.user.accessToken}`
            });

            const authRequest = request.clone(
                { headers }
            );
            return next.handle(authRequest);
        } else {
            return next.handle(request);
        }

    }
}
