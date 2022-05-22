import { Component, OnInit, Injectable } from '@angular/core';
import { LoginService } from 'src/app/security/login/login.service';
import { SocialUser } from 'ngx-social-login';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {faCog, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { ProgramsAddService } from '../programs/add/programsadd.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { PublishService } from '../programs/publish/publish.service';

@Component({
  selector: 'esm-private-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  facog = faCog;
  fasingout = faSignOut;

  constructor(private _loginService: LoginService, public translate: TranslateService, private router: Router, private programService : ProgramsAddService, private spinner: NgxSpinnerService, private publishService : PublishService ) {
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

  goProgram(id : number = -1){
    this.spinner.show();    
    //Irá navegar para a próxima página quando o programa estiver pronto..
    this.programService.getProgramObservable().subscribe((data:any) => {
      this.spinner.hide();      
      this.router.navigateByUrl('private/programs/add').then();
    });
    this.programService.setProgram(id);
  }

  goPublish(id : number = -1){
    this.spinner.show();    
    //Irá navegar para a próxima página quando o programa estiver pronto..
    this.publishService.getProgramObservable().subscribe((data:any) => {
      this.spinner.hide();      
      this.router.navigateByUrl('private/publish/add').then();
    });
    this.publishService.setProgram(id);
  }


}
