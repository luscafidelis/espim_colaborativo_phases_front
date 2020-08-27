import { Cron } from './cron.model';
import {isString} from '@ng-bootstrap/ng-bootstrap/util/util';

export class Trigger {
  private id: number;
  private triggerType: string;
  private triggerCondition: Cron | string;
  private priority: string;
  private timeOut: number;

  constructor(trigger: any = {}) {
    this.id = trigger.id || -1;

    this.triggerType = trigger.triggerType || 'time';

    if (this.triggerType === 'time') this.triggerCondition = new Cron(trigger.triggerCondition);
    else this.triggerCondition = trigger.triggerCondition;

    this.priority = trigger.priority;
    this.timeOut = trigger.timeOut;
  }

  getDescription() {
    const dowNames = ['', 'domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'];
    let ans;

    if (this.triggerCondition instanceof Cron) {
      const dow = this.triggerCondition.getDow();
      if (dow.length === 0) return 'Nenhum dia selecionado. Antes de modificar selecione ao menos algum dia.';
      else if (dow.length < 7) {
        if (dow[0] === '1' || dow[0] === '7') ans = 'Todas os ';
        else ans = 'Todas as ';

        for (const day of dow) {
          ans += dowNames[day];

          if (dow[dow.length - 1] === day) {
            ans += ' ';
            break;
          }

          if (dow.length >= 3) {
            if (day === dow[dow.length - 2]) ans += ' e ';
            else ans += ', ';
          } else if (dow.length === 2) ans += ' e ';
          else ans += ' ';
        }
      }
      else ans = 'Todos os dias ';

      if (this.priority === 'NC') ans += 'uma notificação curta ';
      else if (this.priority === 'NL') ans += 'uma notificação longa ';
      else if (this.priority === 'AL') ans += 'um alarme ';

      if (this.getHour() && this.getMinutes()) ans += 'às ' + this.triggerCondition.getHours() + ':' + this.triggerCondition.getMinute();
    }
    else ans = 'Manual';

    return ans;
  }
  getId() { return this.id; }
  getTriggerType() { return this.triggerType; }
  getTriggerCondition() { return this.triggerCondition; }
  getPriority() { return this.priority; }
  setPriority(priority: string) { this.priority = priority; }
  getTimeOut() { return this.timeOut; }
  getTimeOutInMinutes() { return this.timeOut / 60000; }
  setTimeOutInMinutes(timeOut: number | string) {
    if (typeof timeOut === 'string') timeOut = Number.parseInt(timeOut);
    this.timeOut = timeOut * 60000;
  }

  isDayActive(day?: string) { if (this.triggerCondition instanceof Cron) return this.triggerCondition.isDayActive(day); }
  actOrDeactivateDay(day?: string) { if (this.triggerCondition instanceof Cron) this.triggerCondition.actOrDeactivateDay(day); }

  getMinutes() { if (this.triggerCondition instanceof Cron) return Number.parseInt(this.triggerCondition.getMinute()); }
  setMinute(minutes: number) { if (this.triggerCondition instanceof Cron && minutes) this.triggerCondition.setMinute(minutes.toString()); }
  getHour() { if (this.triggerCondition instanceof Cron) return Number.parseInt(this.triggerCondition.getHours()); }
  setHour(hour: number) { if (this.triggerCondition instanceof Cron && hour) this.triggerCondition.setHour(hour.toString()); }

  changeType() {
    console.log('Begin changeType');
    if (this.triggerType === 'time') {
      this.triggerType = 'manual';
      this.triggerCondition = 'manual';
      this.priority = 'manual';
      this.timeOut = 0;
    } else {
      this.triggerType = 'time';
      this.triggerCondition = new Cron();
      this.priority = '';
    }
    console.log('End changeType');
  }
}
