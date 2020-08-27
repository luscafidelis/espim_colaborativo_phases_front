import { Injectable } from '@angular/core';
import { Program } from '../../models/program.model';
import { Observer } from '../../models/observer.model';
import { DAOService } from '../../dao/dao.service';
import {
  ESPIM_REST_Events,
  ESPIM_REST_Interventions,
  ESPIM_REST_Observers,
  ESPIM_REST_Participants, ESPIM_REST_Programs, ESPIM_REST_Sensors, ESPIM_REST_Triggers
} from '../../../app.api';
import { Observable, Subject } from 'rxjs';
import { LoginService } from '../../../security/login/login.service';
import { Participant } from '../../models/participant.model';
import { ActiveEvent, Event } from '../../models/event.model';
import {
  Intervention,
  MediaIntervention,
  QuestionIntervention,
  TaskIntervention
} from '../../models/intervention.model';
import { Trigger } from '../../models/trigger.model';
import { Sensor } from '../../models/sensor.model';
import { forkJoin } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ProgramsAddService {
  public program: Program = new Program();

  private observers: Observer[] = new Array<Observer>();
  private participants: Participant[] = new Array<Participant>();

  private programObservable$: Subject<Program> = new Subject<Program>();

  constructor(private daoService: DAOService, private loginService: LoginService) {
    this.observers = this.requestObservers();
    this.participants = this.requestParticipants();
  }

  /**
   * Saves an step patching "programs". Patching results in updating the attributes specified in programs
   */
  saveStep(programs?: any) {
    programs.id = this.program.getId();

    if (programs.id !== -1) this.daoService.patchObject(ESPIM_REST_Programs, programs).subscribe(program => this.program.reconstructor(program));
    else {
      // When adding a program, it is necessary that the current user gets submitted as observer. The user is added to the program array at "requestObservers()" and here we post it.
      const userId = Number.parseInt(this.loginService.getUser().id);
      programs.observers = this.program.getObserversId();
      programs.editor = userId;
      programs.beingEdited = true;

      this.daoService.postObject(ESPIM_REST_Programs, programs).subscribe(program => {
        this.program.reconstructor(program);

        if (this.program.getObserversId()) {
          const programObservers = this.requestObservers(this.program.getObserversId());
          for (const observer of programObservers)
            this.program.getObserversInstance().push(observer);
        } 
      });
    }
  }

  getProgramObservable(): Subject<Program> { return this.programObservable$; }
  setProgram(program: Program): void {
    this.program = program;
    /**
     * Incosistência aqui. Os usuários antigos do espim não possuem nenhum observerContact. Quando um usuário antigo lista um programa que tem outros observers responsáveis, esses observers são automaticamente adicionados na observerContacts do usuário atual quando é dado um retrieve pro server (o retrive é dado na linha 61). Entretanto, na linha 62 nós buscamos todos os observersContacts do usuário. O problema é que acontece de não dar retrieve em todos os observers até o momento em que a linha 62 é executada. Dessa forma, acontece de o servidor retornar os observerContacts incompletos, já que, até o momento da request, não damos retrieve em todos os observers e, portanto, tais observers não foram adicionados ao observerContacts do user. Bom, não acho que tenha o que fazer. Isso vai acontecer 1 vez, então acho que ta ok msm assim. (O mesmo acontece para os participantes)
     */
    if (this.program.getObserversId()) this.program.setObserversInstance(this.requestObservers(this.program.getObserversId()));
    else this.program.setObserversInstance(new Array<Observer>());

    if (this.program.getParticipantsId()) this.program.setParticipantsInstance(this.requestParticipants(this.program.getParticipantsId()));
    else this.program.setParticipantsInstance(new Array<Participant>());

    if (this.program.getEventsId()) this.program.setEventsInstance(this.requestEvents(this.program.getEventsId()));
    else this.program.setEventsInstance(new Array<Event>());

    console.log(this.program);
    this.programObservable$.next(this.program);
  }

  getObservers(): Observer[] { return this.observers; }
  getObserversInstance(): Observer[] { return this.program.getObserversInstance(); }

  getParticipants(): Participant[] { return this.participants; }
  getParticipantsInstance(): Participant[] { return this.program.getParticipantsInstance(); }

  getEventsId(): number[] { return this.program.getEventsId(); }
  getEventsInstance(): Event[] { return this.program.getEventsInstance(); }
  delete_event(eventId: number): void {
    this.daoService.deleteObject(ESPIM_REST_Events, eventId.toString()).subscribe(_ => {
      this.program.removeEvent(eventId);
      new SwalComponent({
        title: 'Deletado com sucesso!',
        type: 'success'
      }).show().then();
    });
  }

  requestEvents(eventsId: number[]): Event[] {
    const eventsInstance = new Array<Event>();
    const requests = new Array<any>();
    for (let i = 0; i < eventsId.length; i++) {
      requests.push(this.daoService.getObject(ESPIM_REST_Events, eventsId[i].toString()));
      requests[i].subscribe((data: any) => {
        if (data.type === 'active')
          eventsInstance.push(new ActiveEvent(data));
        else
          eventsInstance.push(new Event(data));
      });
    }
    forkJoin(requests).subscribe(_ => eventsInstance.sort((a: Event, b: Event) => a.getId() - b.getId()));

    return eventsInstance;
  }

  /**
   * If "observersId" is passed, requests such observers, sort, and returns. Else, requests all observers contacts of the user. They already come sorted.
   */
  requestObservers(observersId?: number[]): Array<Observer> {
    /**
     * The received interventions will be stored in "observersInstance" and returned
     */
    const observersInstances = new Array<Observer>();

    if (observersId) {
      /**
       * The requests array stores all observables before subscribing to them so that we can use forkJoin. forkJoin is used to sort the array after all requests receives their responses.
       */
      const requests = new Array<any>();
      for (let i = 0; i < observersId.length; i++) {
        requests.push(this.daoService.getObject(ESPIM_REST_Observers, observersId[i].toString()));
        requests[i].subscribe((data: any) => observersInstances.push(new Observer(data)));
      }
      forkJoin(requests).subscribe(_ => observersInstances.sort((a: Observer, b: Observer) => a.getName().localeCompare(b.getName())));
    } else
      this.daoService.getObjects(ESPIM_REST_Observers + 'list_contacts/').subscribe((data: any) => { for (const observer of data.results) observersInstances.push(new Observer(observer)); });

    return observersInstances;
  }

  /**
   * If "participantsId" is passed, requests such participants, sort, and returns. Else, requests all observers contacts of the user. They already come sorted.
   */
  requestParticipants(participantsId?: number[]): Array<Participant> {
    /**
     * The received interventions will be stored in "interventionsInstance" and returned
     */
    const participantsInstances = new Array<Participant>();

    if (participantsId) {
      /**
       * The requests array stores all observables before subscribing to them so that we can use forkJoin. forkJoin is used to sort the array after all requests receives their responses.
       */
      const requests = new Array<any>();
      for (let i = 0; i < participantsId.length; i++) {
        requests.push(this.daoService.getObject(ESPIM_REST_Participants, participantsId[i].toString()));
        requests[i].subscribe(data => participantsInstances.push(new Participant(data)));
      }
      forkJoin(requests).subscribe(_ => participantsInstances.sort((a: Participant, b: Participant) => a.getName().localeCompare(b.getName())));
    } else
      this.daoService.getObjects(ESPIM_REST_Participants + 'list_contacts/').subscribe((data: any) => {
        for (const participant of data.results) participantsInstances.push(new Participant(participant));
      });

    return participantsInstances;
  }

  /**
   * Requests interventions specified in "interventionsId"
   */
  requestInterventions(interventionsId: Array<number>) {
    /**
     * The received interventions will be stored in "interventionsInstance" and returned
     * The requests array stores all observables before subscribing to them so that we can use forkJoin. forkJoin is used to sort the array after all requests receives their responses.
     */
    const interventionsInstances = new Array<Intervention>();
    const requests = new Array<any>();
    for (let i = 0; i < interventionsId.length; i++) {
      requests.push(this.daoService.getObject(ESPIM_REST_Interventions, interventionsId[i].toString()));
      requests[i].subscribe((data: any) => {
        if (data.type === 'empty')
          interventionsInstances.push(new Intervention(data));
        else if (data.type === 'media')
          interventionsInstances.push(new MediaIntervention(data));
        else if (data.type === 'question')
          interventionsInstances.push(new QuestionIntervention(data));
        else
          interventionsInstances.push(new TaskIntervention(data));
      });
    }
    forkJoin(requests).subscribe(_ => interventionsInstances.sort((a: Intervention, b: Intervention) => a.orderPosition - b.orderPosition));
    return interventionsInstances;
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
}
