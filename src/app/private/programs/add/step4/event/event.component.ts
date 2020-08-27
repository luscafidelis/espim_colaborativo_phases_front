import {Component, Input, OnInit} from '@angular/core';
import {ActiveEvent, Event} from '../../../../models/event.model';
import {ProgramsAddService} from '../../programsadd.service';
import {ESPIM_REST_Events, ESPIM_REST_Programs, ESPIM_REST_Sensors} from '../../../../../app.api';
import {Sensor} from '../../../../models/sensor.model';
import {DAOService} from '../../../../dao/dao.service';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Trigger} from '../../../../models/trigger.model';

@Component({
  selector: 'esm-event',
  templateUrl: './event.component.html'
})
export class EventComponent implements OnInit {

  @Input() event: Event;

  isOpen = false;
  isAddEvent = false; // This is only true if this instance is gonna be the one to add

  constructor(private dao: DAOService, private programsAddService: ProgramsAddService) { }

  ngOnInit() {
    if (!this.event) {
      this.resetEvent();
      this.isAddEvent = true;
    }
  }

  resetEvent() {
    this.event = new Event();
    this.event.setType('passive');
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
      const event = new Event(data);

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

    if (!this.isAddEvent) this.dao.patchObject(ESPIM_REST_Events, eventChanges).subscribe();
  }
  updateSensor(sensorType: string, collector: string) {
    const sensor = this.event.getSensorOfType(sensorType);
    if (sensor) {
      if (sensor.getCollector() === collector)
        this.dao.deleteObject(ESPIM_REST_Sensors, sensor.getId().toString()).subscribe(_ => this.event.removeCollectorOfType(sensorType));
      else
        this.dao.patchObject(ESPIM_REST_Sensors, {id: sensor.getId(), collector}).subscribe(_ => sensor.setCollector(collector));
    } else this.dao.postObject(ESPIM_REST_Sensors, {sensor: sensorType, collector, sensorType: 0}).subscribe(data => {
      this.event.addSensor(new Sensor(data));
      if (!this.isAddEvent) this.dao.patchObject(ESPIM_REST_Events, {id: this.event.getId(), sensors: this.event.getSensorsId()}).subscribe();
    });
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

  requestTriggers() {
    if (this.event.getTriggersId().length === this.event.getTriggersInstances().length)
      return this.event.getTriggersInstances();
    const triggersInstances = this.programsAddService.requestTriggers(this.event.getTriggersId());
    this.event.setTriggerInstance(triggersInstances);
    return triggersInstances;
  }
  requestSensors() {
    if (this.event.getSensorsId().length === this.event.getSensorsInstance().length)
      return this.event.getSensorsInstance();
    const sensorsInstance = this.programsAddService.requestSensors(this.event.getSensorsId());
    this.event.setSensorsInstances(sensorsInstance);
    return sensorsInstance;
  }

}
