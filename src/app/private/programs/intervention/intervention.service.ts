import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {Intervention, MediaIntervention, QuestionIntervention, TaskIntervention} from '../../models/intervention.model';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveEvent} from '../../models/event.model';
import { ESPIM_REST_Events, ESPIM_REST_Interventions } from 'src/app/app.api';
import { ProgramsAddService } from '../add/programsadd.service';
import { DAOService } from '../../dao/dao.service';
import { ChannelService } from '../../channel_socket/socket.service';

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

  //Subscrições, vetor para marcar todas as subscrições do service
  inscritos : any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private canal : ChannelService, public dao : DAOService ) { }
  
  //Inicializa os dados do service
  init(program_id: number, event: ActiveEvent, interventions: Intervention[]) {

    this.program_id = program_id;
    this.event = event;
    console.log(interventions);
    this.updateInterventions(interventions);

    this.canal.getData$.subscribe( data => this.updateGraph(data));
  }


  /**
   * Este método atualiza os dados conforme eles sejam recebidos pelo websocket
   */
  updateGraph(data:any){
    console.log(data.payload.message);
    let locdata = data.payload.message;
    if (locdata.model == 'event' && locdata.id == this.event.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
          //Adicionar Intervention
          if (prop == 'addIntervention'){
            let criar = true;
            for (let i = 1; i < this.graphElements.length; i++){
              if (this.graphElements[i].intervention.id == locdata[prop].id){
                criar = false;
              }
            }
            if (criar){
              let intervention: Intervention;
              let type = locdata['addIntervention'].intervention.type;
              if (type === 'empty') intervention = new Intervention(locdata['addIntervention'].intervention);
              else if (type === 'media') intervention = new MediaIntervention(locdata['addIntervention'].intervention);
              else if (type === 'question') intervention = new QuestionIntervention(locdata['addIntervention'].intervention);
              else if (type === 'task') intervention = new TaskIntervention(locdata['addIntervention'].intervention);
              this.sincGraph(new HTMLInterventionElement(intervention));
            }
          } else {
            //Excluir Intervention
            if (prop == 'delIntervention'){
              //É passado o id da intervention que será apagada..
              //let graphIndex=1;
              let graphIndex = -1;
              for (let i = 1; i < this.graphElements.length; i++){
                if (this.graphElements[i].intervention.id == locdata[prop]){
                  graphIndex = i;
                }
              }
              console.log(graphIndex);
              if (graphIndex > 0) {
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
            } else {
              if (prop == 'setFirst'){
              }
            }
          }
        }
      }
    }
  }



  //Alterou o primeira intervenção
  set first(first: number) {
    this.firstIntervention = first; 
    this.redrawGraph$.next(); 
    this.firstInterventionChange$.next(first); 
  }

  /**
  * Este método vai criar todos os vetores de intervenções..
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
      let subs = intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
      this.inscritos.push(subs);
      return intervention;
    }));

    this.firstIntervention = this.graphElements.findIndex(value => value.first === true);
    // Not needed since lastInteractedIntervention gets update on the BFS of the canvas
    // this.lastInteractedIntervention = interventions.length;
    this.interventionElementsGraph = [];
    this.interventionElementsGraph.push([0]);
    //agora o next é um campo Json e dentro o vetor next indica as próximas intervenções
    for (let i=0; i < interventions.length; i++){
      console.log(interventions[i]);
      if (interventions[i].next.next != null){ 
        this.interventionElementsGraph.push(interventions[i].next.next);
      } else {
        this.interventionElementsGraph.push([0]);
      }
    }
    console.log(this.interventionElementsGraph);
    console.log(this.graphElements);

  }

  //Este método atualiza os vetores com os dados de uma nova intervenção criada..
  sincGraph(intervention: HTMLInterventionElement){
    //Caso o canal tente criar o mesmo elemento duas vezes..
    let voltar = false;
    for (let i = 1; i < this.graphElements.length; i++){
      console.log(intervention);
      console.log(this.graphElement);
      if (this.graphElements[i].intervention.id == intervention.intervention.id){
        voltar = true;
      }
    }
    if (voltar){
      console.log('achou um id igual..')
      return;
    }
    console.log(intervention.intervention.id);
    
    //Verifica se o tipo da intervenção é de questão única que permite múltiplos caminhos..
    if (this.lastInteractedIntervention !== undefined) {
      if (this.graphElements[this.lastInteractedIntervention].intervention instanceof QuestionIntervention && (this.graphElements[this.lastInteractedIntervention].intervention as QuestionIntervention).questionType === 1)
        this.interventionElementsGraph[this.lastInteractedIntervention].push(this.interventionElementsGraph.length);
      else
        this.interventionElementsGraph[this.lastInteractedIntervention] = [this.interventionElementsGraph.length];
    }
    else {
      this.firstIntervention = 1;
    }
    this.interventionElementsGraph.push([0]);
    this.graphElements.push(intervention);
    this.newInterventions$.next({graphIndex: this.graphElements.length - 1, intervention});
    this.redrawGraph$.next();
    let subs = intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
    //Vetor para cancelar as subscrições no observer quando finalizar..
    this.inscritos.push(subs);

  }
  
  /**
   * Processo adicionar intervenção..
   * O HtmlIntervention vem do Novbar..  
   * 
   */
  
  addIntervention(intervention: HTMLInterventionElement) {
    if (this.lastInteractedIntervention === undefined) {
      intervention.first = true;
    }

    //Salva a intervenção no banco..
    let x = (this.graphElements.length -1) * 340.5;
    let y = 50;
    intervention.intervention._x = x;
    intervention.intervention._y = y;
    intervention.intervention.next = {next : [0]};
    intervention.intervention.orderPosition = this.graphElements.length;

    //Estas linhas salvam no banco de dados a alteração da última intervenção
    //Estas linhas serão repetidas no sincgraph para atualizar os vetores...
    //Verifica se o tipo da intervenção é de questão única que permite múltiplos caminhos..
    if (this.lastInteractedIntervention !== undefined) {
      if (this.graphElements[this.lastInteractedIntervention].intervention instanceof QuestionIntervention && (this.graphElements[this.lastInteractedIntervention].intervention as QuestionIntervention).questionType === 1){
        let vetloc = this.interventionElementsGraph[this.lastInteractedIntervention].slice() ;
        vetloc.push(this.interventionElementsGraph.length);
        this.graphElements[this.lastInteractedIntervention].intervention.next = {next: vetloc};
      } else {
        this.graphElements[this.lastInteractedIntervention].intervention.next = {next : [this.interventionElementsGraph.length]};
      }
      console.log(this.graphElements[this.lastInteractedIntervention]);
      let locInt = this.graphElements[this.lastInteractedIntervention].intervention;
      let volta = {id : locInt.id, next : locInt.next};
      //Precisa atualizar o canal...
      this.dao.patchObject(ESPIM_REST_Interventions,volta).subscribe((data: any) => {console.log(data)});
    }

    //Cria a nova intervenção e avisa o canal...
    this.http.post(ESPIM_REST_Interventions,{intervention : intervention.intervention, event : this.event.id}).subscribe((data:any) => 
    { 
      intervention.intervention.id=data.id;
      let volta : any = {};
      volta.model = 'event';
      volta.id = this.event.id;
      volta.addIntervention = intervention;
      console.log(volta);
      this.canal.sendMessage(volta);
    });
  }

  removeIntervention(graphIndex: number) {
    let volta : any = {};
    volta.model = 'event';
    volta.id = this.event.id;
    volta.delIntervention = this.graphElements[graphIndex].intervention.id;
    console.log(volta);
    this.dao.patchObject(ESPIM_REST_Events, {id : this.event.id, delIntervention : volta.delIntervention}).subscribe( _ => { });
    this.canal.sendMessage(volta);
  }

  finish() {
    if (this.hasMultiplePaths) {
      new SwalComponent({
        title: 'Há intervenções desconectadas',
        text: 'Encontramos intervenções que não estão ligadas à primeira. Por favor, é necessário deleta-las ou liga-las ao caminho principal'
      }).show().then();
      return;
    }

    //Desinscreve os observers do padrão observer...
    for (let i = 0; i < this.inscritos.length; i++){
      this.inscritos[i].unsubscribe();
    }

    this.graphElements = [];
    this.graphElements.length =0;
    this.interventionElementsGraph=[[]]
    this.interventionElementsGraph.length=0;

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
  ) {}

  get x() { return this.intervention._x; }
  set x(x: number) {
    if (x !== this.intervention._x) {
      this.intervention._x = x;
      this.onChange$.next(this);
    }
  }

  get y() { return this.intervention._y; }
  set y(y: number) {
    if (y !== this.intervention._y) {
      this.intervention._y = y;
      this.onChange$.next(this);
    }
  }

  get width() { return this.intervention._width; }
  set width(width: number) {
    if (width !== this.intervention._width) {
      this.intervention._width = width;
      this.onChange$.next(this);
    }
  }

  get height() { return this.intervention._height; }
  set height(height: number) {
    if (height !== this.intervention._height) {
      this.intervention._height = height;
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

  get top() { return { x: this.x + this.width / 2 , y: this.y }; }
  get bottom() { return { x: this.x + this.width / 2, y: this.y + this.height}; }
  get left() { return { x: this.x , y: this.y + this.height/2} ; }
  get right() { return { x: this.x + this.width, y: this.y + this.height/2}; }
}
