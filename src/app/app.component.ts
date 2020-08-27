import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {InterventionService} from "./private/programs/intervention/intervention.service";
@Component({
  selector: 'esm-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

}
