import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'esm-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public translate: TranslateService) {
    translate.addLangs(['en','pt']);
    translate.setDefaultLang('en');
  }
}
