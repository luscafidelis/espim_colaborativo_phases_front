import {Component, Input, OnInit} from '@angular/core';
import {ActiveEvent} from '../../../../models/event.model';
import {ProgramsAddService} from '../../programsadd.service';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {DAOService} from '../../../../dao/dao.service';
import {ESPIM_REST_Events, ESPIM_REST_Programs} from '../../../../../app.api';
import {Trigger} from '../../../../models/trigger.model';
import {ActivatedRoute, Router} from "@angular/router";
import {InterventionService} from "../../../intervention/intervention.service";

@Component({
  selector: 'esm-active-event',
  templateUrl: './active-event.component.html'
})
export class ActiveEventComponent implements OnInit {

  @Input() event: ActiveEvent;

  isOpen = false;
  isAddEvent = false; // This is only true if this instance is gonna be the one to add

  constructor(private programsAddService: ProgramsAddService, private interventionService: InterventionService, private dao: DAOService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    if (!this.event) {
      this.resetEvent();
      this.isAddEvent = true;
    }
  }

  resetEvent() {
    this.event = new ActiveEvent();
    this.event.setType('active');
    this.isAddEvent = true;
  }

  addEvent() {
    if (this.isOpen && !this.event.getTitle()) {
      new SwalComponent({
        type: 'warning',
        title: 'Adicione um título'
      }).show();
      return;
    }

    if (this.isOpen) this.dao.postObject(ESPIM_REST_Events, this.event).subscribe(data => {
      const event = new ActiveEvent(data);

      this.programsAddService.getEventsId().push(event.getId());
      this.programsAddService.getEventsInstance().push(event);

      this.dao.patchObject(ESPIM_REST_Programs, {
        id: this.programsAddService.program.getId(),
        events: this.programsAddService.getEventsId()
      }).subscribe(_ => {
        this.resetEvent();
        this.isOpen = !this.isOpen;
      });
    });
    else this.isOpen = !this.isOpen;
  }
  getEventDetails() {
    this.requestInterventions();
    this.requestTriggers();
  }
  delete_event() {
    if (this.isAddEvent) {
      this.isOpen = !this.isOpen;
      this.resetEvent();
      return;
    }

    new SwalComponent({
      title: 'Deletar evento?',
      text: `Você tem certeza que deseja deletar ${this.event.getTitle()}?`,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).show().then(result => {
      if (result.value === true) this.programsAddService.delete_event(this.event.getId());
    });
  }
  updateEvent(eventChanges: any) {
    eventChanges.id = this.event.getId();

    if (!this.isAddEvent) this.dao.patchObject(ESPIM_REST_Events, eventChanges).subscribe();
  }

  addTrigger(trigger: Trigger) {
    this.event.getTriggersId().push(trigger.getId());

    if (!this.isAddEvent) this.dao.patchObject(ESPIM_REST_Events, {
      id: this.event.getId(),
      triggers: this.event.getTriggersId()
    }).subscribe(response => {
      this.event.getTriggersInstances().push(trigger);
    }, error => {
      // TODO - Deletar o trigger caso esse patch falhe
    });
    else this.event.getTriggersInstances().push(trigger);
  }

  requestInterventions() {
    if (this.event.getInterventionsId().length === this.event.getInterventionsInstances().length)
      return this.event.getInterventionsInstances();
    const interventionsInstances = this.programsAddService.requestInterventions(this.event.getInterventionsId());
    this.event.setInterventionsInstances(interventionsInstances);
    return interventionsInstances;
  }
  requestTriggers() {
    if (this.event.getTriggersId().length === this.event.getTriggersInstances().length)
      return this.event.getTriggersInstances();
    const triggersInstances = this.programsAddService.requestTriggers(this.event.getTriggersId());
    this.event.setTriggerInstance(triggersInstances);
    return triggersInstances;
  }

  goToInterventions() {
    this.interventionService.init(this.programsAddService.program.id, this.event, this.event.getInterventionsInstances());
    this.router.navigate([this.event.getId(), 'interventions'], {relativeTo: this.route});
  }
}
