import {Component, ComponentRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ActiveEvent} from '../../../../models/event.model';
import {ProgramsAddService} from '../../programsadd.service';
import {DAOService} from '../../../../dao/dao.service';
import {ESPIM_REST_Events, ESPIM_REST_Interventions, ESPIM_REST_Programs, ESPIM_REST_Triggers} from '../../../../../app.api';
import {Trigger} from '../../../../models/trigger.model';
import {ActivatedRoute, Router} from "@angular/router";
import {InterventionService} from "../../../intervention/intervention.service";
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { Intervention} from 'src/app/private/models/intervention.model';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { InterventionsComponent } from '../../../intervention/interventions.component';
declare var window: any;
import {faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'esm-active-event',
  templateUrl: './active-event.component.html'
})
export class ActiveEventComponent implements OnInit, OnDestroy {
  @ViewChild('divInterventions', { read: ViewContainerRef }) interventionsContainer!: ViewContainerRef;
  
  edit = faEdit;
  trash = faTrashAlt;

  locIntervention! : ComponentRef<InterventionsComponent>;

  formModal : any;

  editorClosed : boolean = true;

  @Input() event!: ActiveEvent;

  subSynk = new SubSink();

  isOpenAdvanced = true;
  isOpenCircle = true;
  isOpenGame = true;
  isOpen = false;
  isAddEvent = false; // This is only true if this instance is gonna be the one to add

  constructor(private programsAddService: ProgramsAddService, private interventionService: InterventionService, private dao: DAOService, 
    private router: Router, private route: ActivatedRoute, private canal : ChannelService) { }
  
  
  ngOnDestroy(): void {
    this.subSynk.unsubscribe();
  }

  ngOnInit() {
    if (!this.event) {
      this.resetEvent();
    } else {
      console.log(this.event);
      this.event = new ActiveEvent(this.event);
    }
  //Nesta linha o service irá escutar o websocket..
  this.subSynk.sink = this.canal.getData$.subscribe( data => this.sincronizeEvent(data));
  this.formModal = new window.bootstrap.Modal(
    document.getElementById('editorModal2')
  );
  }

  resetEvent() {
    this.event = new ActiveEvent();
    this.event.setType('active');
    this.event.setTitle('Sem Título');
    this.isAddEvent = true;
    this.isOpen = false;
  }

  addEvent() {
    this.subSynk.sink = this.dao.postObject(ESPIM_REST_Events, this.event).subscribe(data => {
        const event = new ActiveEvent(data);
        this.programsAddService.saveStep({addEvent : event})
    });
  }

  getEventDetails() {
    this.requestInterventions();
    this.requestTriggers();
  }

  delete_event() {
    Swal.fire({
      title: 'Deletar evento?',
      text: `Você tem certeza que deseja deletar ${this.event.getTitle()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result : any) => {
      if (result.isConfirmed === true) this.programsAddService.saveStep({delEvent : this.event.getId()});
    });
  }

  updateEvent(eventChanges: any) {
    eventChanges.id = this.event.getId();
    this.subSynk.sink = this.dao.patchObject(ESPIM_REST_Events, eventChanges).subscribe((data:any) => {
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
                      this.event = new ActiveEvent(locdata[prop]);
                    } else {
                      //Excluir Intervenção
                      if (prop == 'delIntervention'){
                        //A deleção no banco é feita diretamente pelo editor canvas..
                        let interventionId = locdata[prop];
                        this.event.interventions.splice(this.event.interventions.findIndex((value: Intervention) => value.id === interventionId), 1);
                      } else {
                        //Outros Campos
                        //this.event[prop] = locdata[prop]; <- Não funcionou no angular 13 :-(
                        if (prop == 'title') this.event.title = locdata[prop];
                        if (prop == 'description') this.event.description = locdata[prop];
                        if (prop == 'color') this.event.color = locdata[prop];
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
    this.subSynk.sink = this.dao.postObject(ESPIM_REST_Triggers,trigger). subscribe((data:any) => {
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

  openAdvanced(){
    this.isOpenAdvanced = !this.isOpenAdvanced;
  }

  openCircle(){
    this.isOpenCircle = !this.isOpenCircle;
  }

  openGame(){
    this.isOpenGame = !this.isOpenGame;
  }
  

  goToInterventions() {
    //Antes de abrir o editor de intervenções atualiza o evento com os dados do banco..
    //console.log(this.event.getInterventionsInstances());
    this.subSynk.sink=this.dao.getNewObject(ESPIM_REST_Interventions,{ActiveEvent : this.event.id}).subscribe((data : any) => {
      this.event.criaInterventions(data);
      this.interventionService.init(this.programsAddService.program.id, this.event, this.event.getInterventionsInstances());
      this.formModal.show();
      this.locIntervention = this.interventionsContainer.createComponent(InterventionsComponent);
      this.locIntervention.instance.closeInterventions.subscribe((val:any) => this.closeInterventions(val));
      //this.router.navigate([this.event.getId(), 'interventions'], {relativeTo: this.route});
    })
  }

  closeInterventions(volta : any){
    this.formModal.hide();
    this.locIntervention.destroy();
  }

}
