import {Component, Input, OnInit} from '@angular/core';
import {ActiveEvent} from '../../../../models/event.model';
import {ProgramsAddService} from '../../programsadd.service';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {DAOService} from '../../../../dao/dao.service';
import {ESPIM_REST_Events, ESPIM_REST_Programs, ESPIM_REST_Triggers} from '../../../../../app.api';
import {Trigger} from '../../../../models/trigger.model';
import {ActivatedRoute, Router} from "@angular/router";
import {InterventionService} from "../../../intervention/intervention.service";
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { Intervention, MediaIntervention, QuestionIntervention, TaskIntervention } from 'src/app/private/models/intervention.model';
import { CONFIG } from 'ngx-social-login/lib/models/config-injection-token';

@Component({
  selector: 'esm-active-event',
  templateUrl: './active-event.component.html'
})
export class ActiveEventComponent implements OnInit {

  @Input() event: ActiveEvent;

  isOpen = false;
  isAddEvent = false; // This is only true if this instance is gonna be the one to add

  constructor(private programsAddService: ProgramsAddService, private interventionService: InterventionService, private dao: DAOService, 
    private router: Router, private route: ActivatedRoute, private canal : ChannelService) { }

  ngOnInit() {
    if (!this.event) {
      this.resetEvent();
    } else {
      this.event = new ActiveEvent(this.event);
    }
  //Nesta linha o service irá escutar o websocket..
  this.canal.getData$.subscribe( data => this.sincronizeEvent(data));
  }

  resetEvent() {
    this.event = new ActiveEvent();
    this.event.setType('active');
    this.event.setTitle('Sem Título');
    this.isAddEvent = true;
    this.isOpen = false;
  }

  addEvent() {
    this.dao.postObject(ESPIM_REST_Events, this.event).subscribe(data => {
        const event = new ActiveEvent(data);
        this.programsAddService.saveStep({addEvent : event})
    });
  }

  getEventDetails() {
    this.requestInterventions();
    this.requestTriggers();
  }

  delete_event() {
    new SwalComponent({
      title: 'Deletar evento?',
      text: `Você tem certeza que deseja deletar ${this.event.getTitle()}?`,
      type: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).show().then(result => {
      if (result.value === true) this.programsAddService.saveStep({delEvent : this.event.getId()});
    });
  }

  updateEvent(eventChanges: any) {
    eventChanges.id = this.event.getId();
    this.dao.patchObject(ESPIM_REST_Events, eventChanges).subscribe((data:any) => {
      eventChanges.model = 'event';
      this.canal.sendMessage(eventChanges);
    } );
  }

  /**
 * Este método recebe as atualizações que são enviadas pelo canal e atualiza o programa 
 * que está em edição...
 */
  sincronizeEvent(data:any){
    let locdata = data.payload.message;
    if (locdata.model == 'event' && locdata.id == this.event.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
          //Adicionar Trigger
          if (prop == 'addTrigger'){
              let loc_trigger = new Trigger(locdata[prop]);
              this.event.getTriggersId().push(loc_trigger.id);
              this.event.getTriggersInstances().push(loc_trigger);
          } else {
            //Excluir Trigger
            if (prop == 'delTrigger'){
              let triggerId = locdata['delTrigger'];
              this.event.triggers.splice(this.event.triggers.findIndex((value: Trigger) => value.id === triggerId), 1);
            } else {
              //Adicionar ComplexCondition
              if (prop == 'addComplexCondition'){

              } else {
                //Excluir ComplexCondition
                if (prop == 'delComplexCondition'){

                } else {
                  //Adicionar Sensor
                  if (prop == 'addSensor'){

                  } else {
                    //atualiza todas as intervenções
                    if (prop == 'updateEvent'){
                      console.log(locdata[prop]);
                      this.event = new ActiveEvent(locdata[prop]);
                      console.log(this.event);
                    } else {
                      //Excluir Intervenção
                      if (prop == 'delIntervention'){
                        //A deleção no banco é feita diretamente pelo editor canvas..
                        let interventionId = locdata[prop];
                        this.event.interventions.splice(this.event.interventions.findIndex((value: Intervention) => value.id === interventionId), 1);
                      } else {
                        //Outros Campos
                        this.event[prop] = locdata[prop];
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  addTrigger(trigger: any) {
    //Grava a trigger no evento...
    this.dao.postObject(ESPIM_REST_Triggers,trigger). subscribe((data:any) => {
      this.updateEvent({addTrigger : data});
      //this.event.getTriggersId().push(data.id);
      //this.event.getTriggersInstances().push( new Trigger(data));
    });
  }

  delTrigger(id: any){
    this.updateEvent({delTrigger : id});
  }

  requestInterventions() {
    return this.event.getInterventionsInstances();
  }

  requestTriggers() {
    return this.event.getTriggersInstances();
  }

  goToInterventions() {
    this.interventionService.init(this.programsAddService.program.id, this.event, this.event.getInterventionsInstances());
    this.router.navigate([this.event.getId(), 'interventions'], {relativeTo: this.route});
  }
}
