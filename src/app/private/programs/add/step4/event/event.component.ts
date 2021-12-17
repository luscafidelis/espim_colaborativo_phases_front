import {Component, Input, OnInit} from '@angular/core';
import {ActiveEvent, Event} from '../../../../models/event.model';
import {ProgramsAddService} from '../../programsadd.service';
import {ESPIM_REST_Events, ESPIM_REST_Programs, ESPIM_REST_Sensors, ESPIM_REST_Triggers} from '../../../../../app.api';
import {Sensor} from '../../../../models/sensor.model';
import {DAOService} from '../../../../dao/dao.service';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Trigger} from '../../../../models/trigger.model';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';

@Component({
  selector: 'esm-event',
  templateUrl: './event.component.html'
})
export class EventComponent implements OnInit {

  @Input() event: Event;

  isOpen = false;
  isAddEvent = false; // This is only true if this instance is gonna be the one to add

  constructor(private dao: DAOService, private programsAddService: ProgramsAddService, private canal : ChannelService) { }

  ngOnInit() {
    if (!this.event) {
      this.resetEvent();
      this.isAddEvent = true;
    } else {
      this.event = new Event(this.event);
      console.log(this.event);
    }
    this.canal.getData$.subscribe( data => this.sincronizeEvent(data));
  }

  resetEvent() {
    this.event = new Event();
    this.event.setType('passive');
    this.event.setTitle('Sem nome');
    this.isAddEvent = true;
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
                if (prop == 'updateSensor'){
                  let locSensor = new Sensor(locdata[prop]);
                  let pos = this.event.sensors.findIndex((value : Sensor) => value.id === locSensor.id);
                  this.event.sensors[pos] = locSensor;   
                } else {
                  //Adicionar Sensor
                  if (prop == 'addSensor'){
                       this.event.addSensor(new Sensor(locdata[prop]));
                  } else {
                    //Excluir Sensor
                    if (prop == 'delSensor'){
                      let sensorId = locdata['delSensor'];
                      this.event.sensors.splice(this.event.sensors.findIndex((value: Sensor) => value.id === sensorId), 1);
                    } else {
                      //Adicionar Intervenção
                      if (prop == 'addIntervention'){

                      } else {
                        //Excluir Intervenção
                        if (prop == 'delIntervention'){

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
  }

  addEvent() {
    this.dao.postObject(ESPIM_REST_Events, this.event).subscribe(data => {
        const event = new Event(data);
        this.programsAddService.saveStep({addEvent : event})
    });
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

  getActivitySensorCollector(): string {
    const activitySensor = this.event.getSensorOfType('activity');
    if (activitySensor) return activitySensor.getCollector();
  }
  getLocationSensorCollector(): string {
    const locationSensor = this.event.getSensorOfType('location');
    if (locationSensor) return locationSensor.getCollector();
  }
  getMeasureUseSensorCollector(): string {
    // tslint:disable-next-line:variable-name
    const measure_useSensor = this.event.getSensorOfType('measure_use');
    if (measure_useSensor) return measure_useSensor.getCollector();
  }

  getEventDetails() {
    this.requestTriggers();
    this.requestSensors();
  }

  updateEvent(eventChanges: any) {
    eventChanges.id = this.event.getId();
    this.dao.patchObject(ESPIM_REST_Events, eventChanges).subscribe((data:any) => {
      eventChanges.model = 'event';
      this.canal.sendMessage(eventChanges);
    } );
  }

  updateSensor(sensorType: string, collector: string) {
    const sensor = this.event.getSensorOfType(sensorType);
    let volta : any = {};
    volta.model = 'event';
    volta.id = this.event.id;
    if (sensor) {
      if (sensor.getCollector() === collector) {
        this.updateEvent({delSensor : sensor.id });
      }else {
        //Aqui é feita a atualização do evento.. Como a gravação é feita no model de sensor não dá para usar o updateEvent
        this.dao.patchObject(ESPIM_REST_Sensors, {id: sensor.getId(), collector}).subscribe( (data:any) => {sensor.setCollector(collector);
                                                                                                  volta.updateSensor = data;
                                                                                                  this.canal.sendMessage(volta);
                                                                                                 }
                                                                                            );
      }
    } else { 
      this.dao.postObject(ESPIM_REST_Sensors, {sensor: sensorType, collector, sensorType: 0}).subscribe(data => {
        this.updateEvent({addSensor : data})
        //this.event.addSensor(new Sensor(data));
      });
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

  requestTriggers() {
    return this.event.getTriggersInstances();
  }

  requestSensors() {
    return this.event.getSensorsInstance();
  }

}
