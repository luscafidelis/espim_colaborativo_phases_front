import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SecurityRoutingModule } from './security-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { DAOService } from '../private/dao/dao.service';
import { ObserversService } from '../private/observers/observers.service';

@NgModule({
  declarations: [LoginComponent],
  exports: [LoginComponent],
  providers: [DAOService, ObserversService],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    TranslateModule,
  ]
})
export class SecurityModule { }
