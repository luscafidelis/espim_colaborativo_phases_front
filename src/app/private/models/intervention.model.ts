export class Intervention {
  public id: number;
  public type: string;
  public statement: string;
  public orderPosition: number=0;
  public first: boolean;
  public next: any = {next : []};
  public obligatory: boolean;
  public _x: number=0;
  public _y: number=0;
  public _width: number=0;
  public _height: number=0;

  protected medias;
  protected complexConditions;

  constructor(intervention: any = {}) {
    this.id = intervention.id;
    this.statement = intervention.statement;
    this.orderPosition = intervention.orderPosition;
    this.first = intervention.first !== undefined ? intervention.first : false;
    this.next = intervention.next;
    this.obligatory = intervention.obligatory !== undefined ? intervention.obligatory : false;

    this._x = intervention._x;
    this._y = intervention._y;
    this._height = intervention._height;
    this._width = intervention._width;

    this.medias = intervention.medias;
    this.complexConditions = intervention.complexConditions;

    this.type = 'empty';
  }

  getTypeDescription() { return this.type; }

  static factory (entrada : any[]) : any[] {
    let interventions : any[] = [];
    for (let i = 0; i < entrada.length; i++) {
        if (entrada[i].type === 'empty')
            interventions.push(new Intervention(entrada[i]));
        else if (entrada[i].type === 'media')
            interventions.push(new MediaIntervention(entrada[i]));
        else if (entrada[i].type === 'question')
            interventions.push(new QuestionIntervention(entrada[i]));
        else if (entrada[i].type === 'question')
            interventions.push(new QuestionIntervention(entrada[i]));
        else if (entrada[i].type === 'analyzed')
            interventions.push(new AnalyzedIntervention(entrada[i]));
        else
            interventions.push(new TaskIntervention(entrada[i]));
    }
    interventions.sort((a: Intervention, b: Intervention) => a.orderPosition - b.orderPosition);
    return interventions;
  }
}

export class MediaIntervention extends Intervention {
  public mediaType: string;

  constructor(intervention: any = {}) {
    super(intervention);

    this.mediaType = intervention.mediaType;
    this.type = 'media';
  }
}

export class QuestionIntervention extends Intervention {
  public questionType: number;
  public conditions: {};
  public options: string[];
  public scales: string[];

  constructor(intervention: any = {}) {
    super(intervention);

    this.questionType = intervention.questionType;
    this.conditions = intervention.conditions || {};
    this.options = intervention.options || [];
    this.scales = intervention?.scales || [];
    this.type = 'question';
  }

  override getTypeDescription() {
    if (this.questionType === 0)
      return 'Questão aberta';
    if (this.questionType === 1)
      return 'Escolha única';
    if (this.questionType === 2)
      return 'Múltipla escolha';
    if (this.questionType === 3)
      return 'Likert';
    if (this.questionType === 4)
      return 'Diferencial semântico';
    if (this.questionType === 31)
      return 'Likert personalizado';
    return 'Mensagem';
  }
}

export class TaskIntervention extends Intervention {
  public appPackage: string;
  public parameters: object;
  public startFromNotification: boolean;

  constructor(intervention: any = {}) {
    super(intervention);

    this.appPackage = intervention.appPackage;
    this.parameters = intervention.parameters;
    this.startFromNotification = intervention.startFromNotification;
    this.type = 'task';
  }
}


export class AnalyzedIntervention extends Intervention {
  public functionAnalyze : string;

  constructor(intervention: any = {}) {
    super(intervention);
    this.functionAnalyze = intervention.functionAnalyze;
    this.type = 'analyzed';
  }
}