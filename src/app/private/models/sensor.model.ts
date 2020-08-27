export class Sensor {
  /**
   * sensor: May be "activity", "location" or "measure_use".
   * collector: May be "smartphone" or "smartwatch"
   */
  private id: number;
  private sensor: string;
  private collector: string;
  private sensorType: number;

  constructor(data: any = {}) {
    this.id = data.id;
    this.sensor = data.sensor;
    this.collector = data.collector;
    this.sensorType = data.sensorType;
  }

  public getId(): number { return this.id; }
  public getSensor(): string { return this.sensor; }
  public getCollector(): string { return this.collector; }

  public setCollector(collector: string) { this.collector = collector; }
}
