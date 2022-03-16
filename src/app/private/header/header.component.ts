import { Component, OnInit, Injectable } from '@angular/core';
import { LoginService } from 'src/app/security/login/login.service';
import { SocialUser } from 'ngx-social-login';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {faCog, faSignOut } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'esm-private-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  facog = faCog;
  fasingout = faSignOut;

  constructor(private _loginService: LoginService, public translate: TranslateService) {
    translate.addLangs(['en','pt']);
    translate.setDefaultLang('pt');
   }

  user!: SocialUser;

  ngOnInit() {
    this.user = this._loginService.getUser();
  }


  logout() {
    this._loginService.logout();
  }


  chooseLanguage(language: string) {
    this.translate.use(language);
  }


}
