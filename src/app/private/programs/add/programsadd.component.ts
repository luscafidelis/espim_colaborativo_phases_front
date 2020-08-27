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

      if (this.id !== -1 && this.id === this.programsService.program.id)
        return;

      // If it null, sets the program to empty. Else, does a get request to get the program and then set it.
      if (this.id !== -1)
        this.dao.getObject(ESPIM_REST_Programs, this.id.toString()).subscribe((data: any) => this.programsService.setProgram(new Program(data)));
      else {
        const program = new Program();
        // Adds the current user as observer
        const userId = Number.parseInt(this.loginService.getUser().id);
        program.setObserversId([userId]);

        this.programsService.setProgram(program);
      }
    });
  }

}
