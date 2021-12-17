import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DAOService } from '../../dao/dao.service';
import { ESPIM_REST_Programs } from '../../../app.api';
import { ProgramsAddService } from './programsadd.service';
import { Program } from '../../models/program.model';
import {LoginService} from '../../../security/login/login.service';

@Component({
  selector: 'esm-programsadd',
  templateUrl: './programsadd.component.html'
})
export class ProgramsAddComponent implements OnInit {

  id: number;

  constructor(private programsService: ProgramsAddService, private dao: DAOService, private activatedRoute: ActivatedRoute, private loginService: LoginService) { }

  ngOnInit() {
    // Subscribes to route changes
    this.activatedRoute.paramMap.subscribe(paramMap => {
      // Gets the id in the url
      this.id = Number.parseInt(paramMap.get('id'));
      //if (this.id !== -1 && this.id === this.programsService.program.id){
      //  return;
      //}
      this.programsService.setProgram(this.id);
    });
  }

  mostrar():boolean {
    return this.programsService.program.id != -1;
  }

}
