import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {Intervention, QuestionIntervention} from '../../models/intervention.model';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveEvent} from '../../models/event.model';
import { ESPIM_REST_Interventions } from 'src/app/app.api';
import { ProgramsAddService } from '../add/programsadd.service';
import { DAOService } from '../../dao/dao.service';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {

  //Id do programa
  program_id: number;

  //Evento ao qual as intervenções pertencem
  event: ActiveEvent;

  //Ùltima intervenção que foi adicionada
  lastInteractedIntervention: number;

  //Primeira intervenção
  firstIntervention: number;

  //Caso exista múltiplos caminhos nas intervenções...
  hasMultiplePaths: boolean = false;

  //Vetor de intervenções.. O HtmlElement une o model com o componente HTML Intervention..
  graphElements: HTMLInterventionElement[];
  
  //Próximas intervenções da intervenção.. vai ser mudado isso..
  interventionElementsGraph: number[][];

  //Observable que serve para informar quando uma intervenção é adicionada ao vetor
  newInterventions$: Subject<{graphIndex: number, intervention: HTMLInterventionElement}> = new Subject<{graphIndex: number, intervention: HTMLInterventionElement}>();

  //Observable que serve para informar quando uma intervenção é removida
  removeIntervention$: Subject<number> = new Subject<number>();
  
  //Para avisar quando houver alteração no vetor de intervenções
  redrawGraph$: Subject<void> = new Subject<void>();
  
  //Para avisar quando a primeira intervenção for alterada
  firstInterventionChange$: Subject<number> = new Subject<number>();

  //Para avisar quando houver alguma alteração no programa feito por outro usuário
  outUpdateChange$: Subject<void> = new Subject<void>();

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private programService : ProgramsAddService ) { }
  
  //Inicializa os dados do service
  init(program_id: number, event: ActiveEvent, interventions: Intervention[]) {
    console.log(this.programService.getEventsInstance());
    this.program_id = program_id;
    this.event = event;
    console.log(interventions);
    this.updateInterventions(interventions);
    console.log('Antes', this.graphElements);
  }

  //Alterou o primeira intervenção
  set first(first: number) {
    this.firstIntervention = first; 
    this.redrawGraph$.next(); 
    this.firstInterventionChange$.next(first); 
  }

  /**
  * Este método vai criar todos os vetores de intervenções..
  * Ele está sendo chamado a cada atualização..
  * Tem que ser repensado..
  */
  updateInterventions(interventions : Intervention[]){
    interventions.sort((a, b) => {
      if (a.orderPosition < b.orderPosition) return -1;
      else if (a.orderPosition > b.orderPosition) return 1;
      else return 0;
    });
    // Old espim did not save order position correctly, so here we have to correct
    const orderPositions = {};
    for (let i = 0; i < interventions.length; i++)
      orderPositions[interventions[i].orderPosition] = i + 1;
    orderPositions[0] = 0;

    // makes the first element invalid since index "0" is finish
    this.graphElements = [new HTMLInterventionElement()].concat(interventions.map(value => {
      const intervention = new HTMLInterventionElement(value);
      intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
      return intervention;
    }));

    this.firstIntervention = this.graphElements.findIndex(value => value.first === true);
    // Not needed since lastInteractedIntervention gets update on the BFS of the canvas
    // this.lastInteractedIntervention = interventions.length;
    this.interventionElementsGraph = [[]].concat(interventions.map(value => {
      if (value.type === 'question' && (value as QuestionIntervention).questionType === 1)
        return Object.keys((value as QuestionIntervention).conditions).map(alternative => orderPositions[(value as QuestionIntervention).conditions[alternative]]);
      else return [orderPositions[value.next]];
    }));
    console.log(this.graphElements);
    console.log(this.interventionElementsGraph);
  }

  addIntervention(intervention: HTMLInterventionElement) {
    
    if (this.lastInteractedIntervention !== undefined) {
      if (this.graphElements[this.lastInteractedIntervention] instanceof QuestionIntervention && (this.graphElement[this.lastInteractedIntervention] as QuestionIntervention).questionType === 1)
        this.interventionElementsGraph[this.lastInteractedIntervention].push(this.interventionElementsGraph.length);
      else
        this.interventionElementsGraph[this.lastInteractedIntervention] = [this.interventionElementsGraph.length];
    }
    else {
      intervention.first = true;
      this.firstIntervention = 1;
    }
    //Salva a intervenção no banco..
    this.http.post(ESPIM_REST_Interventions,{intervention : intervention.intervention, event : this.event.id}).subscribe((data:any) => 
    { intervention.intervention.id=data.id;
      this.interventionElementsGraph.push([0]);
      this.graphElements.push(intervention);
      this.newInterventions$.next({graphIndex: this.graphElements.length - 1, intervention});
      this.redrawGraph$.next();
      intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
    });
  }

  removeIntervention(graphIndex: number) {
    this.graphElements.splice(graphIndex, 1);
    this.interventionElementsGraph.splice(graphIndex, 1);
    for (const intervention of this.interventionElementsGraph) {
      let i = 0;
      while (i < intervention.length) {
        if (intervention[i] === graphIndex)
          intervention[i] = 0;
        else if (intervention[i] > graphIndex) {
          intervention[i]--;
          i++;
        }
        else
          i++;
      }
    }

    this.removeIntervention$.next(graphIndex);
    this.redrawGraph$.next();
  }


  finish() {
    if (this.hasMultiplePaths) {
      new SwalComponent({
        title: 'Há intervenções desconectadas',
        text: 'Encontramos intervenções que não estão ligadas à primeira. Por favor, é necessário deleta-las ou liga-las ao caminho principal'
      }).show().then();
      return;
    }
    // Irá salvar cada uma das intervenções.... Tem que acertar isso.. está fazendo muitas requisições http...
    this.event.interventions = [];
    for (let i = 1; i < this.graphElements.length; i++) {
      const intervention = this.graphElements[i]?.intervention;
      if (!intervention) {
        continue;
      }
      // if the intervention is of unique choice, it is already up to date (it gets updated in unique-choice.component.ts)
      // else we must updated intervention.next to the first and only intervention it points
      if (intervention.type !== 'question' && (intervention as QuestionIntervention).questionType !== 1){
        this.graphElements[i].intervention.next = this.interventionElementsGraph[i][0];
      }
      if (intervention.id){
        this.event.interventions.push(intervention);
        this.http.patch(`${ESPIM_REST_Interventions}${intervention.id}/`, intervention).subscribe(
          //Salva a intervenção no evento..
          _ => { }, 
          _ => console.log(`Failed to patch intervention of id ${intervention.id}, orderPosition ${intervention.orderPosition}`));
      } else{
        this.http.post(ESPIM_REST_Interventions, {intervention : intervention, event : this.event.id}).subscribe(
          (data: any) => {intervention.id = data.id; }, 
          _ => console.log(`Failed to post intervention of orderPosition ${intervention.orderPosition}`));
      }
    }

    // it is not necessary to update orderPosition since it gets updated together with the canvas (arrows)
    console.log(this.programService.getEventsInstance());
    this.programService.updateEvent(this.event);
    //this.event.interventions = this.event.interventionsInstances.map(value => value.id);

    this.router.navigateByUrl(`private/programs/add/${this.program_id}/fourth`).then();
  }

  graphElement(i: number) { return this.graphElements[i]; }


  setNextFromTo(from: number, to: number) {
    if (this.hasArrow(from, to)) return;

    this.interventionElementsGraph[from].push(to);
    this.redrawGraph$.next();
  }

  private hasArrow(from: number, to: number) {
    for (const intervention of this.interventionElementsGraph[from])
      if (intervention === to) return true;
    return false;
  }

  removeEdges(vertice: number, emit: boolean = true) {
    this.interventionElementsGraph[vertice] = [];
    if (emit) this.redrawGraph$.next();
  }

  warnCycle(intervention: number) {
    // alert('Intervenção ' + intervention + ' resulta em um ciclo');
  }

  setFirst(vertice: number) {
    this.firstIntervention = vertice;
    this.redrawGraph$.next();
    this.firstInterventionChange$.next(vertice);
  }
}

export class HTMLInterventionElement {
  onChange$: Subject<HTMLInterventionElement> = new Subject<HTMLInterventionElement>();

  constructor(
      public intervention?: Intervention,
      public _x?: number,
      public _y?: number,
      public _width?: number,
      public _height?: number
  ) {}

  get x() { return this._x; }
  set x(x: number) {
    if (x !== this._x) {
      this._x = x;
      this.onChange$.next(this);
    }
  }

  get y() { return this._y; }
  set y(y: number) {
    if (y !== this._y) {
      this._y = y;
      this.onChange$.next(this);
    }
  }

  get width() { return this._width; }
  set width(width: number) {
    if (width !== this._width) {
      this._width = width;
      this.onChange$.next(this);
    }
  }

  get height() { return this._height; }
  set height(height: number) {
    if (height !== this._height) {
      this._height = height;
      this.onChange$.next(this);
    }
  }

  get type() { return this.intervention?.type; }
  get questionType() {
    if (this.intervention instanceof QuestionIntervention)
      return (this.intervention as QuestionIntervention).questionType;
    return undefined;
  }
  get statement() { return this.intervention?.statement; }
  set statement(statement: string) { this.intervention.statement = statement; }
  get orderPosition() { return this.intervention?.orderPosition; }
  set orderPosition(orderPosition: number) { this.intervention.orderPosition = orderPosition; }
  get typeDescription() { return this.intervention?.getTypeDescription(); }
  get first() { return this.intervention?.first; }
  set first(first: boolean) { this.intervention.first = first; }
  get obligatory() { return this.intervention?.obligatory; }
  set obligatory(obligatory) { this.intervention.obligatory = obligatory; }

  get top() { return { x: this.x, y: this.y - this.height / 2}; }
  get bottom() { return { x: this.x, y: this.y + this.height / 2}; }
  get left() { return { x: this.x - this.width / 2, y: this.y}; }
  get right() { return { x: this.x + this.width / 2, y: this.y}; }
}
