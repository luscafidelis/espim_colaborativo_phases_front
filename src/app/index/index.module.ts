import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//local components
import { IndexComponent } from './index.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { WorksComponent } from './works/works.component';
import { IndexRoutingModule } from './index-routing.module';
import { DownloadComponent } from './download/download.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TeamComponent } from './team/team.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { NgxSocialLoginModule } from 'ngx-social-login';
import { SecurityModule } from '../security/security.module';
import { SigninComponent } from './signin/signin.component';
import { DAOService } from '../private/dao/dao.service';
import { ObserversService } from '../private/observers/observers.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DateConverterService } from '../util/util.date.converter.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  imports: [
    CommonModule,
    IndexRoutingModule,
    SecurityModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbModule,
    SweetAlert2Module,
    NgxSocialLoginModule.init(
      {
        google: {
          client_id: '465781881543-slrnopuhb3up2d97mlkmvgelgpsqthd0.apps.googleusercontent.com'
        }
      }
    )
  ],
  declarations: [IndexComponent, HeaderComponent, FooterComponent, HomeComponent, WorksComponent, DownloadComponent, TimelineComponent, TeamComponent, DocumentationComponent, SigninComponent],
  providers:[DAOService, ObserversService, DateConverterService],
  exports: []
})
export class IndexModule { }
