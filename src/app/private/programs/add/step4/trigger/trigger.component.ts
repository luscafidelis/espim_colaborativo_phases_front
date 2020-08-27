import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Trigger} from '../../../../models/trigger.model';
import {FormControl} from '@angular/forms';
import {Cron} from '../../../../models/cron.model';
import {DAOService} from '../../../../dao/dao.service';
import {ESPIM_REST_Triggers} from '../../../../../app.api';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'esm-trigger',
  templateUrl: './trigger.component.html'
})
export class TriggerComponent implements OnInit {

  @Input() trigger: Trigger;
  @Output() triggerOutput = new EventEmitter<Trigger>();

  isOpen = false;
  isAddTriggerComponent: boolean; // This is only true if this instance is gonna be the one to add

  time: FormControl;

  constructor(private daoService: DAOService) { }

  ngOnInit() {
    // If there is no trigger, it means that this component is for adding triggers, not displaying one
    if (!this.trigger) {
      this.isAddTriggerComponent = true;
      this.trigger = new Trigger();
      this.time = new FormControl({ hour: null, minute: null });
    }
    else {
      this.isAddTriggerComponent = false;
      this.time = new FormControl({ hour: this.trigger.getHour(), minute: this.trigger.getMinutes() });
    }

    this.time.valueChanges.subscribe(_ => this.updateTriggerTime());
  }

  updateTriggerTime() {
    if (this.trigger.getTriggerType() === 'manual') {
      if (this.time.value.hour != null || this.time.value.minute != null) this.time.setValue({ hour: null, minute: null });
      return;
    }
    else if (this.time.value) {
      this.trigger.setHour(this.time.value.hour);
      this.trigger.setMinute(this.time.value.minute);
    }
  }

  modifyTrigger() {
    let triggerCondition: Cron | string;

    if (this.trigger.getTriggerCondition() instanceof Cron) triggerCondition = this.trigger.getTriggerCondition().toString();
    else triggerCondition = this.trigger.getTriggerCondition();

    this.daoService.patchObject(ESPIM_REST_Triggers, {
      id: this.trigger.getId(),
      triggerType: this.trigger.getTriggerType(),
      triggerCondition,
      priority: this.trigger.getPriority(),
      timeOut: this.trigger.getTimeOut()
    }).subscribe(response => this.triggerOutput.emit(new Trigger(response)));
  }

  addTrigger() {
    let triggerCondition: Cron | string;

    if (this.trigger.getTriggerCondition() instanceof Cron) triggerCondition = this.trigger.getTriggerCondition().toString();
    else triggerCondition = this.trigger.getTriggerCondition();

    this.daoService.postObject(ESPIM_REST_Triggers, {
      triggerType: this.trigger.getTriggerType(),
      triggerCondition,
      priority: this.trigger.getPriority(),
      timeOut: this.trigger.getTimeOut()
    }).subscribe(response => this.triggerOutput.emit(new Trigger(response)));
  }
}
