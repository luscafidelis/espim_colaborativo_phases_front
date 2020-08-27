import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ProgramsAddService } from '../programsadd.service';
import { Event } from '../../../models/event.model';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import { DAOService } from '../../../dao/dao.service';
import {Program} from '../../../models/program.model';

@Component({
  selector: 'esm-step4',
  templateUrl: './step4.component.html'
})
export class Step4Component implements OnInit {
  events: Array<Event>;

  constructor(private programsAddService: ProgramsAddService, private formbuilder: FormBuilder, private router: Router, private dao: DAOService) { }

  ngOnInit() {
    this.events = this.programsAddService.getEventsInstance();

    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.programsAddService.getProgramObservable().subscribe((programInstance: Program) => this.events = this.programsAddService.getEventsInstance());
  }

  submit() {
    // TODO - Think a better approach for beignEdited
    if (this.programsAddService.getParticipantsInstance() && this.programsAddService.getParticipantsInstance().length > 0) {
      this.programsAddService.saveStep({editor: null, beingEdited: false});
      new SwalComponent ({
        type: 'success'
      }).show().then(_ => this.router.navigate(['/private']));
    } else {
      new SwalComponent ({
        title: 'Você não adicionou participantes, tem certeza que deseja continuar?!',
        type: 'warning',
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusCancel: true,
        showCancelButton: true
      }).show().then(response => {
        if (response.value === true) {
          this.programsAddService.saveStep({editor: null, beingEdited: false});
          new SwalComponent ({
            type: 'success'
          }).show().then(_ => this.router.navigate(['/private']));
        }
      });
    }
  }
}
