export class Cron {
  private seconds: string;
  private minutes: string;
  private hours: string;
  private dom: string;
  private month: string;
  private dow: Array<string>;
  private year: string;

  constructor(cronString: string = '0 0 0 ? *  *') {
    const cronArray = cronString.split(' ');
    this.seconds = cronArray[0];
    this.minutes = cronArray[1];
    this.hours = cronArray[2];
    this.dom = cronArray[3];
    this.month = cronArray[4];
    this.dow = cronArray[5].split(',');
    if (this.dow[0] === '') this.dow = [];
    this.year = cronArray[6];
  }

  getMinute() { return this.minutes; }
  setMinute(minute: string) { this.minutes = minute; }
  getHours() { return this.hours; }
  setHour(hours: string) { this.hours = hours; }
  getDow() { return this.dow; }

  isDayActive(day?: string) {
    if (day) return !!this.dow.find(value => value === day);
    else return this.dow.length === 7;
  }
  actOrDeactivateDay(day?: string) {
    if (day) {
      const dayIndex = this.dow.findIndex(value => value === day);
      if (dayIndex === -1) {
        this.dow.push(day);
        this.dow.sort();
      } else this.dow.splice(dayIndex, 1);
    } else {
      const areAllMarked = this.isDayActive();
      this.dow.splice(0, this.dow.length);
      if (!areAllMarked) for (let i = 1; i <= 7; i++) this.dow.push(i.toString());
    }
  }

  toString() { return `${this.seconds} ${this.minutes} ${this.hours} ${this.dom} ${this.month} ${this.dow} ${this.year}`; }
}
