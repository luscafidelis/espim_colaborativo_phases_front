import { Injectable } from '@angular/core';
import { Program } from '../../models/program.model';
import { Observer } from '../../models/observer.model';
import { DAOService } from '../../dao/dao.service';
import {
  ESPIM_REST_Events,
  ESPIM_REST_Observers,
  ESPIM_REST_Participants, ESPIM_REST_Programs, ESPIM_REST_Sensors, ESPIM_REST_Triggers
} from '../../../app.api';
import { Subject } from 'rxjs';
import { LoginService } from '../../../security/login/login.service';
import { Participant } from '../../models/participant.model';
import { ActiveEvent, Event } from '../../models/event.model';
import { Trigger } from '../../models/trigger.model';
import { Sensor } from '../../models/sensor.model';
import { forkJoin } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ChannelService } from '../../channel_socket/socket.service';


@Injectable({
  providedIn: 'root'
})
export class ProgramsAddService {
  //Programa
  public program: Program = new Program();

  //Verificar se foi iniciado ou não a lista de participantes e de observadores
  started : boolean = false;

  //Definir a sala que irá escutar no chat...
  sala : string = 'espim';

  //Definir o maior código de Observador e Participante
  participantBigger : number = 0;
  observerBigger : number = 0;


  //Observadores e participantes do programa..
  private observers: Observer[] = new Array<Observer>();
  private participants: Participant[] = new Array<Participant>();
  private editor : Observer = undefined;

  //Observer usado para informar alterações no programa
  private programObservable$: Subject<Program> = new Subject<Program>();
  getProgramObservable(): Subject<Program> { return this.programObservable$; }

  constructor(private daoService: DAOService, private loginService: LoginService, private canal : ChannelService) {  }

  //--- Inicialização do programa na classe do service....
  setProgram(programId: number) {
    //Nesta linha o service irá escutar o websocket..
    this.canal.getData$.subscribe( data => this.updateProgram(data));
    //Conecta na sala que irá escutar...
    this.canal.init(this.sala);
    
    // If it null, sets the program to empty. Else, does a get request to get the program and then set it.
    if (programId !== -1){
      this.daoService.getObject(ESPIM_REST_Programs, programId.toString()).subscribe((data: any) => 
        { 
          console.log(data);
          this.program = new Program(data);
          console.log(this.program);
          this.programObservable$.next(this.program);
        }
      );
    } else {
      // Adds the current user as observer
      this.program = new Program({id: -1, title: 'Sem nome', description:  'Sem nome', starts: '',  ends: '', updateDate: '', 
                      hasPhases: false, isPublic: false, beingEdited: false, beingDuplicated: false, editor : undefined,
                      observers:  [], participants: [], events: [], chat_program: []});
      const userId = Number.parseInt(this.loginService.getUser().id);
      //Busca os dados do observador que está criando o programa no banco de dados
      this.daoService.getObject(ESPIM_REST_Observers,userId.toString()).subscribe(data => {
        this.editor = new Observer (data);
        this.program.observers.push(this.editor);
        this.program.editor = this.editor;
        //Cria um novo programa
        this.daoService.postObject(ESPIM_REST_Programs, this.program).subscribe((program : any) => {
          this.program = program;
          console.log(this.program);
          this.programObservable$.next(this.program); 
        });
      })
    }
    // Pega os participantes e os observadores se ainda não o fez
    if (!this.started){
      this.daoService.getNewObject(ESPIM_REST_Participants,{}).subscribe(
        (data:any) => { this.participants = data;
                        //Define o maior id dos participantes
                        for (let i=0; i<this.participants.length; i++){
                          if (this.participants[i].id > this.participantBigger){
                            this.participantBigger = this.participants[i].id;
                          }
                        }
                      }
      );
      this.daoService.getNewObject(ESPIM_REST_Observers,{}).subscribe(
        (data:any) => { this.observers = data;
                        //Define o id do maior observer
                        for (let i=0; i<this.observers.length; i++){
                          if (this.observers[i].id > this.observerBigger){
                            this.observerBigger = this.observers[i].id;
                          }
                        }
                      }
      
      );
      this.started = true;
    }
  }


  /**
   * Saves an step patching "programs". Patching results in updating the attributes specified in programs
   */
  codigoMensagem = 0;
  saveStep(dados:any = {}) {
    console.log(this.program);
    dados.id = this.program.id;
    this.daoService.patchObject(ESPIM_REST_Programs, dados).subscribe((data : any) => {
      //this.program = data;
      dados.model = 'program';
      this.codigoMensagem = Math.random();
      dados.codigoMensagem = this.codigoMensagem;
      this.canal.sendMessage(dados);
      //this.programObservable$.next(this.program); 
    });
  }

  /**
   * Este método recebe as atualizações que são enviadas pelo canal e atualiza o programa 
   * que está em edição... Todas as atualizações são enviadas pelo canal..
   * 
   */
  //Serve para não deixar mensagens repetidas
  ultima : number = 0;
  updateProgram(data:any){
    let locdata = data.payload.message;
    if (locdata.codigoMensagem != this.ultima){
      this.ultima = locdata.codigoMensagem;
    } else {
      return;
    }
    if (locdata.model == 'program' && locdata.id == this.program.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
          //Adicionar Oberver
          if (prop == 'addObserver'){
            let locObserver = new Observer(locdata['addObserver']);
            this.program.observers.push(locObserver);
            if (locObserver.getId() > this.observerBigger){
              this.observers.push(locObserver);
              this.observerBigger = locObserver.getId();
            }
          } else {
            //Excluir Observer
            if (prop == 'delObserver'){
              let observerId = locdata['delObserver'];
              this.program.observers.splice(this.program.observers.findIndex((value: Observer) => value.id === observerId), 1);
            } else {
              //Adicionar Participant
              if (prop == 'addParticipant'){
                let locParticipant = new Participant(locdata['addParticipant']);
                this.program.participants.push(locParticipant);
                if (locParticipant.getId() > this.participantBigger){
                  this.participants.push(locParticipant);
                  this.participantBigger = locParticipant.getId();
                }
              } else {
                //Excluir Participant
                if (prop == 'delParticipant'){
                  let participantId = locdata['delParticipant'];
                  this.program.participants.splice(this.program.participants.findIndex((value: Participant) => value.id === participantId), 1);
                } else {
                  //Adicionar Evento
                  if (prop == 'addEvent'){
                    let locEvent : Event;
                    if (locdata['addEvent']['type'] == "active") {
                      locEvent = new ActiveEvent(locdata['addEvent']);
                    } else {
                      locEvent = new Event(locdata['addEvent']);
                    }
                    this.program.events.push(locEvent);
                  } else {
                    //Excluir Participant
                    if (prop == 'delEvent'){
                      let eventId = locdata['delEvent'];
                      this.program.events.splice(this.program.events.findIndex((value: Event) => value.id === eventId), 1);
                    } else {
                      if (prop == 'updateEvent') {
                        const eventInstancesIndex = this.program.events.findIndex(value => value.id === locdata[prop].id);
                        this.program.events[eventInstancesIndex] = new ActiveEvent(locdata[prop]);
                        console.log (this.program);
                      } else {
                        //Outros Campos
                        this.program[prop] = locdata[prop];
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.programObservable$.next(this.program); 
      console.log(this.program);
    }
  }

  getObservers(): Observer[] { 
    console.log(this.program);
    return this.observers; }
  getObserversInstance(): Observer[] { return this.program?.observers || []; }
  getParticipants(): Participant[] { return this.participants; }
  getParticipantsInstance(): Participant[] { return this.program?.participants || []; }
  getEventsId(): number[] { return this.program?.events.map((evento) => evento.getId()) || [] }
  getEventsInstance(): Event[] {return this.program?.events || []; }

 
  delete_event(eventId: number): void {
    this.daoService.deleteObject(ESPIM_REST_Events, eventId.toString()).subscribe(_ => {
      const eventInstancesIndex = this.program.events.findIndex(value => value.id === eventId);
      this.program.events.splice(eventInstancesIndex, 1);      
      new SwalComponent({
        title: 'Deletado com sucesso!',
        type: 'success'
      }).show().then();
    });
  }


  /**
   * Requests interventions specified in "interventionsId"
   */
  requestTriggers(triggersId: Array<number>) {
    /**
     * The received interventions will be stored in "triggerInstances" and returned
     * The requests array stores all observables before subscribing to them so that we can use forkJoin. forkJoin is used to sort the array after all requests receives their responses.
     */
    const triggerInstances: Array<Trigger> = new Array<Trigger>();
    const requests = new Array<any>();
    for (let i = 0; i < triggersId.length; i++) {
      requests.push(this.daoService.getObject(ESPIM_REST_Triggers, triggersId[i].toString()));
      requests[i].subscribe((data: any) => {
        triggerInstances.push(new Trigger(data));
      });
    }
    forkJoin(requests).subscribe(_ => triggerInstances.sort((a: Trigger, b: Trigger) => a.getId() - b.getId()));
    return triggerInstances;
  }

  /**
   * Requests interventions specified in "interventionsId"
   */
  requestSensors(sensorsId: Array<number>) {
    /**
     * The received interventions will be stored in "sensorsInstances" and returned
     * The requests array stores all observables before subscribing to them so that we can use forkJoin. forkJoin is used to sort the array after all requests receives their responses.
     */
    const sensorsInstances: Array<Sensor> = new Array<Sensor>();
    const requests = new Array<any>();
    for (let i = 0; i < sensorsId.length; i++) {
      requests.push(this.daoService.getObject(ESPIM_REST_Sensors, sensorsId[i].toString()));
      requests[i].subscribe((data: any) => sensorsInstances.push(new Sensor(data)));
    }
    forkJoin(requests).subscribe(_ => sensorsInstances.sort((a: Sensor, b: Sensor) => a.getId() - b.getId()));
    return sensorsInstances;
  }

  updateEvent(event : Event){
    const eventInstancesIndex = this.program.events.findIndex(value => value.id === event.id);
    this.program.events[eventInstancesIndex] = event;
    this.programObservable$.next(this.program); 
  }
}
