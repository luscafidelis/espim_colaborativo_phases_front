export class Intervention {
  public id: number;
  public type: string;
  public statement: string;
  public orderPosition: number;
  public first: boolean;
  public next: number;
  public obligatory: boolean;

  protected medias;
  protected complexConditions;

  constructor(intervention: any = {}) {
    this.id = intervention.id;
    this.statement = intervention.statement;
    this.orderPosition = intervention.orderPosition;
    this.first = intervention.first !== undefined ? intervention.first : false;
    this.next = intervention.next;
    this.obligatory = intervention.obligatory !== undefined ? intervention.obligatory : false;

    this.medias = intervention.medias;
    this.complexConditions = intervention.complexConditions;

    this.type = 'empty';
  }

  getTypeDescription() { return 'Mensagem'; }
}

export class MediaIntervention extends Intervention {
  private mediaType: string;

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

  getTypeDescription() {
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
  private appPackage: string;
  private parameters: object;
  private startFromNotification: boolean;

  constructor(intervention: any = {}) {
    super(intervention);

    this.appPackage = intervention.appPackage;
    this.parameters = intervention.parameters;
    this.startFromNotification = intervention.startFromNotification;
    this.type = 'task';
  }
}
