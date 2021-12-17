import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Trigger} from '../../../../models/trigger.model';
import {FormControl} from '@angular/forms';
import {Cron} from '../../../../models/cron.model';
import {DAOService} from '../../../../dao/dao.service';
import {ESPIM_REST_Triggers} from '../../../../../app.api';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';

@Component({
  selector: 'esm-trigger',
  templateUrl: './trigger.component.html'
})
export class TriggerComponent implements OnInit {

  @Input() trigger: Trigger;
  @Output() triggerOutput = new EventEmitter<any>();
  @Output() delTriggerEmit = new EventEmitter<any>();

  isOpen = false;
  isAddTriggerComponent: boolean; // This is only true if this instance is gonna be the one to add

  time: FormControl;

  constructor(private daoService: DAOService, private canal : ChannelService) { }

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
    this.canal.getData$.subscribe( data => this.sincronizeTrigger(data));

  }

  sincronizeTrigger(data : any){
    let locdata = data.payload.message;
    if (locdata.model == 'trigger' && locdata.id == this.trigger.id ){
      this.trigger = new Trigger (locdata.trigger);
      console.log(this.time);
      this.time.value.hour = this.trigger.getHour();
      this.time.value.minute = this.trigger.getMinutes();
      this.triggerOutput.emit(this.trigger);
    }
  }

  updateTriggerTime() {
    if (this.trigger.getTriggerType() === 'manual') {
      if (this.time.value.hour != null || this.time.value.minute != null) this.time.setValue({ hour: null, minute: null });
      return;
    }
    else if (this.time.value) {
      console.log(this.time.value.hour);
      this.trigger.setHour(this.time.value.hour);
      console.log(this.time.value.minute);
      this.trigger.setMinute(this.time.value.minute);
      console.log(this.trigger);
    }
  }

  modifyTrigger() {
    let triggerCondition: Cron | string;


    this.daoService.putObject(ESPIM_REST_Triggers, {
      id: this.trigger.getId(),
      triggerType: this.trigger.getTriggerType(),
      triggerCondition: this.trigger.getTriggerCondition(),
      priority: this.trigger.getPriority(),
      timeOut: this.trigger.getTimeOut()
    }).subscribe((response : any) => {
        //this.triggerOutput.emit(new Trigger(response));
        let goTrigger : any = {};
        goTrigger.model = 'trigger';
        goTrigger.id = this.trigger.id;
        goTrigger.trigger = response;
        this.canal.sendMessage(goTrigger);
       });
  }

  addTrigger() {
    //Cria a Trigger e retorna a trigger
    //Tem que retornar um corpo de trigger para ser gravado.. senão vai dar erro na volta pq o campo pode ser cron ou string..

    let corpo_trigger = {triggerType: this.trigger.getTriggerType(), triggerCondition : this.trigger.getTriggerCondition(), priority: this.trigger.getPriority(), timeOut: this.trigger.getTimeOut()};
    this.triggerOutput.emit(corpo_trigger);
  }

  delTrigger(){
    this.delTriggerEmit.emit(this.trigger.getId());
  }
}
