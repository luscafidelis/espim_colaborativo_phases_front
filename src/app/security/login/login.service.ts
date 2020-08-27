import { Injectable, NgZone } from '@angular/core';
import { SocialLoginService, Provider, SocialUser } from 'ngx-social-login';
import 'rxjs/operator/do';
import { Router } from '@angular/router';
import { ObserversService } from 'src/app/private/observers/observers.service';
import { ESPIM_REST_Observers } from 'src/app/app.api';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  urlObservers: string = ESPIM_REST_Observers + 'auth/';
  user: SocialUser;

  constructor(private _service: SocialLoginService, private router: Router, private zone: NgZone, private _observerService: ObserversService) { }

  loginWithGoogle(): void {
    this._service.login(Provider.GOOGLE).subscribe(
      user => {
        this.user = user;
        this.zone.run(() => {
          this._observerService.authenticate(this.urlObservers).subscribe(
              (response: any) => {
                this.user.id = response.id;
                console.log(this.user.accessToken);
                this.router.navigate(['/private']);
              },
              error => {
                this.router.navigate(['/index/signin'])
              }
          );
        });
      },
      error => console.log(error)
    );
  }

  logout(): void {
    this._service.logout().subscribe({
      complete: () => {
        this.zone.run(() => {
          this.router.navigate(['/']);
        });
      },
      error: err => console.log(err)
    });
    this.user = undefined;
  }

  getUser(): SocialUser {
    return this.user;
  }

  isLoggedIn(): boolean {
    return this.user !== undefined;
  }



}
