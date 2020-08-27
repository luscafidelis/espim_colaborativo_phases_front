import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { SocialLoginService, Provider } from 'ngx-social-login';

@Component({
  selector: 'esm-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  constructor(private _loginService: LoginService) { }

  ngOnInit() {
  }

  login() {
    this._loginService.loginWithGoogle();
  }

  logout() {
    this._loginService.logout();
  }

}
