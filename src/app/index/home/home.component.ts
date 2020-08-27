import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'esm-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private translate: TranslateService) {
  }

  ngOnInit() {
  }

}
