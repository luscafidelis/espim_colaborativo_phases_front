import { Component, OnInit } from '@angular/core';
import {ProgramsAddService} from './programs/add/programsadd.service';

@Component({
  selector: 'esm-private',
  templateUrl: './private.component.html'
})
export class PrivateComponent implements OnInit {

  /* DO NOT remove. This is here in order for programsAddService to be initialized before add/list program components*/
  constructor(private pas: ProgramsAddService) { }

  ngOnInit() {
  }

}
