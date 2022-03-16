import { Cron } from './cron.model';


export class Trigger {
  public id: number;
  public triggerType: string;
  public triggerCondition: Cron | string;
  public priority: string;
  public timeOut: number;

  constructor(trigger: any = {}) {
    this.id = trigger.id || -1;

    this.triggerType = trigger.triggerType || 'time';

    if (this.triggerType === 'time'){
      this.triggerCondition = new Cron(trigger.triggerCondition);
    }else{ 
      this.triggerCondition = trigger.triggerCondition;
    }

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
        if (dow[0] === '1' || dow[0] === '7') ans = 'Todos os ';
        else ans = 'Todas as ';
        for (const day of dow) {
          ans += dowNames[Number.parseInt(day)];

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
  getTriggerCondition() { 
    if (this.triggerCondition instanceof Cron){
      console.log(this.triggerCondition.toString());
      return this.triggerCondition.toString();
    } else {
      return this.triggerCondition; 
    }
  }
  getPriority() { return this.priority; }
  setPriority(priority: string) { this.priority = priority; }
  getTimeOut() { return this.timeOut; }
  getTimeOutInMinutes() { return this.timeOut / 60000; }
  setTimeOutInMinutes(timeOut: number | string) {
    if (typeof timeOut === 'string') timeOut = Number.parseInt(timeOut);
    this.timeOut = timeOut * 60000;
  }

  isDayActive(day?: string) { if (this.triggerCondition instanceof Cron) return this.triggerCondition.isDayActive(day); return -1}
  actOrDeactivateDay(day?: string) { if (this.triggerCondition instanceof Cron) this.triggerCondition.actOrDeactivateDay(day); }

  getMinutes() { if (this.triggerCondition instanceof Cron) return Number.parseInt(this.triggerCondition.getMinute()); return -1}
  setMinute(minutes: number) { if (this.triggerCondition instanceof Cron) 
                                  this.triggerCondition.setMinute(minutes.toString()); 
                              }
  getHour() { if (this.triggerCondition instanceof Cron) return Number.parseInt(this.triggerCondition.getHours()); return -1}
  setHour(hour: number) { if (this.triggerCondition instanceof Cron) 
                          this.triggerCondition.setHour(hour.toString()); 
                        }

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
