import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {Intervention, MediaIntervention, QuestionIntervention, TaskIntervention} from '../../models/intervention.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveEvent} from '../../models/event.model';
import { ESPIM_REST_CustomCircleEvents, ESPIM_REST_Events, ESPIM_REST_Interventions } from 'src/app/app.api';
import { DAOService } from '../../dao/dao.service';
import { ChannelService } from '../../channel_socket/socket.service';
import Swal from 'sweetalert2';
import { CustomCircleEvent } from '../../models/circle.model';

@Injectable({
  providedIn: 'root'
})
export class InterventionService {

  //Id do programa
  program_id: number = 0;

  //Evento ou CustoCircle ao qual as intervenções pertencem
  event!: ActiveEvent | CustomCircleEvent;

  //Variável que indicará o tipo de objeto que veio como parâmetro...
  typeObject! : string;
  
  //Ùltima intervenção que foi adicionada
  lastInteractedIntervention: number = -1; //Indica que está vazio...

  //Primeira intervenção
  firstIntervention: number = 0;

  //Caso exista múltiplos caminhos nas intervenções...
  hasMultiplePaths: boolean = false;

  //Vetor de intervenções.. O HtmlElement une o model com o componente HTML Intervention..
  graphElements: HTMLInterventionElement[] = [];
  
  //Próximas intervenções da intervenção.. vai ser mudado isso..
  interventionElementsGraph: number[][] = [];

  //Observable que serve para informar quando uma intervenção é adicionada ao vetor
  newInterventions$: Subject<{graphIndex: number, intervention: HTMLInterventionElement}> = new Subject<{graphIndex: number, intervention: HTMLInterventionElement}>();

  //Observable que serve para informar quando uma intervenção é removida
  removeIntervention$: Subject<number> = new Subject<number>();
  
  //Para avisar quando houver alteração no vetor de intervenções
  redrawGraph$: Subject<void> = new Subject<void>();

  //Para avisar que os vetores foram inicializados...
  initGraph$: Subject<void> = new Subject<void>();
  
  //Para avisar quando a primeira intervenção for alterada
  firstInterventionChange$: Subject<number> = new Subject<number>();

  //Para avisar quando houver alguma alteração no programa feito por outro usuário
  outUpdateChange$: Subject<void> = new Subject<void>();

  //Esta variável serve para definir a instância que chamou o canal e fazer as atualizações no banco quando necessário..
  chamouCanal : boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private canal : ChannelService, public dao : DAOService ) { }
  
  //Inicializa os dados do service
  init(program_id: number, event: ActiveEvent | CustomCircleEvent, interventions: Intervention[]) {
    this.program_id = program_id;
    this.event = event;
    if (interventions.length > 0) {
      this.updateInterventions(interventions);
    } else {
      this.lastInteractedIntervention = -1; //Indica que está vazio...
      this.firstIntervention = 0;
      this.graphElements = [];
      this.graphElements.push(new HTMLInterventionElement(new Intervention()));
      this.interventionElementsGraph = [];
      this.interventionElementsGraph.push([0]);
    }
    if (event instanceof ActiveEvent){
      this.typeObject = 'event';
    } else {
      this.typeObject = 'customCircle';
    }
    this.canal.getData$.subscribe( data => this.updateGraph(data));
    //this.initGraph$.next();
  }


  /**
   * Este método atualiza os dados conforme eles sejam recebidos pelo websocket
   */
  updateGraph(data:any){
    let locdata = data.payload.message;
    if (locdata.model == this.typeObject && locdata.id == this.event.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
          //Adicionar Intervention
          if (prop == 'addIntervention'){
            let criar = true;
            //Verifica se a intervenção já não está criada para evitar duplicação..
            for (let i = 1; i < this.graphElements.length; i++){
              if (this.graphElements[i].intervention.id == locdata[prop].id){
                criar = false;
              }
            }
            if (criar){
              //O factory cria um vetor de intervenções.. pega só a primeira posição..
              let intervention: Intervention = Intervention.factory([locdata['addIntervention'].intervention])[0];
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
              if (graphIndex > 0) {
                this.graphElements.splice(graphIndex, 1);
                this.interventionElementsGraph.splice(graphIndex, 1);
                for (let pos=1; pos < this.interventionElementsGraph.length; pos++) {
                  let i = 0;
                  while (i < this.interventionElementsGraph[pos].length) {
                    if (this.interventionElementsGraph[pos][i] === graphIndex){
                      this.interventionElementsGraph[pos][i] = 0;
                    } else {
                      if (this.interventionElementsGraph[pos][i] > graphIndex) {
                        this.interventionElementsGraph[pos][i]--;
                      }
                    }
                    i++;
                  }
                  this.graphElements[pos].intervention.next= {next : this.interventionElementsGraph[pos]};
                  //Esta gravação vai ser repetida por todas as máquinas.. Tem que criar uma situação para só um fazer isso..
                  let grava:any ={};
                  grava.id = this.graphElements[pos].intervention.id;
                  grava.next = this.graphElements[pos].intervention.next;
                  this.dao.patchObject(ESPIM_REST_Interventions,grava).subscribe(data => {});
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
  updateInterventions(interventions : any[]){
    interventions.sort((a, b) => {
      if (a.orderPosition < b.orderPosition) return -1;
      else if (a.orderPosition > b.orderPosition) return 1;
      else return 0;
    });

    // Old espim did not save order position correctly, so here we have to correct
    const orderPositions : number[]=[];
    for (let i = 0; i < interventions.length; i++)
      orderPositions[interventions[i].orderPosition] = i + 1;
    orderPositions[0] = 0;


    // makes the first element invalid since index "0" is finish
    this.graphElements = [new HTMLInterventionElement(new Intervention())].concat(interventions.map(value => {
      const intervention = new HTMLInterventionElement(value);
      intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
      return intervention;
    }));

    this.firstIntervention = this.graphElements.findIndex(value => value.first === true);
    // Not needed since lastInteractedIntervention gets update on the BFS of the canvas
    // this.lastInteractedIntervention = interventions.length;
    this.interventionElementsGraph = [];
    this.interventionElementsGraph.push([0]);
    //agora o next é um campo Json e dentro o vetor next indica as próximas intervenções
    for (let i=1; i < this.graphElements.length; i++){
      if (this.graphElements[i].intervention.next.next != null){ 
        this.interventionElementsGraph[i] = this.graphElements[i].intervention.next.next;
      } else {
        this.interventionElementsGraph[i] = ([0]);
      }
      //Para desenhar o grapho...
    }
  }

  createGraph(){
    for (let i=1; i < this.graphElements.length; i++){
      //Para desenhar o grapho...
      this.newInterventions$.next({graphIndex: i, intervention: this.graphElements[i]});
    }
  }

  //Este método atualiza os vetores com os dados de uma nova intervenção criada..
  sincGraph(intervention: HTMLInterventionElement){
    //Caso o canal tente criar o mesmo elemento duas vezes..
    let voltar = false;
    for (let i = 1; i < this.graphElements.length; i++){
      if (this.graphElements[i].intervention.id == intervention.intervention.id){
        voltar = true;
      }
    }
    if (voltar){
      console.log('achou um id igual..')
      return;
    }
    
    //Verifica se o tipo da intervenção é de questão única que permite múltiplos caminhos..
    if (this.lastInteractedIntervention !== -1) {
      //if (this.graphElements[this.lastInteractedIntervention].intervention instanceof QuestionIntervention && (this.graphElements[this.lastInteractedIntervention].intervention as QuestionIntervention).questionType === 1)
      //  this.interventionElementsGraph[this.lastInteractedIntervention].push(this.interventionElementsGraph.length);
      //else
      this.interventionElementsGraph[this.lastInteractedIntervention] = [this.interventionElementsGraph.length];
    } else {
      this.firstIntervention = 1;
    }
    this.interventionElementsGraph.push([0]);
    this.graphElements.push(intervention);
    this.newInterventions$.next({graphIndex: this.graphElements.length - 1, intervention});
    this.redrawGraph$.next();
    intervention.onChange$.subscribe(_ => this.redrawGraph$.next());
    //Vetor para cancelar as subscrições no observer quando finalizar..
  }
  
  /**
   * Processo adicionar intervenção..
   * O HtmlIntervention vem do Navbar..  
   * 
   */
  
  addIntervention(intervention: HTMLInterventionElement) {
    if (this.lastInteractedIntervention === -1) {
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
    if (this.lastInteractedIntervention !== -1) {
      this.graphElements[this.lastInteractedIntervention].intervention.next = {next : [this.interventionElementsGraph.length]};
      let locInt = this.graphElements[this.lastInteractedIntervention].intervention;
      let volta = {id : locInt.id, next : locInt.next};
      //Tem que salvar por aqui, senão todo mundo vai salvar e vai crias acessos desencessários
      this.dao.patchObject(ESPIM_REST_Interventions,volta).subscribe((data: any) => {});
    }

    //Cria a nova intervenção e avisa o canal...
    if (this.typeObject == "event") {
      this.dao.postObject(ESPIM_REST_Interventions,{intervention : intervention.intervention, event : this.event.id}).subscribe((data:any) => 
      { 
        intervention.intervention.id=data.id;
        this.broadcastAddIntervention(intervention);
      });
    } else {
      this.dao.postObject(ESPIM_REST_Interventions,{intervention : intervention.intervention, customCircle : this.event.id}).subscribe((data:any) => 
      { 
        intervention.intervention.id=data.id;
        this.broadcastAddIntervention(intervention);
      });

    }
  }

  broadcastAddIntervention(intervention : HTMLInterventionElement ){
    let volta : any = {};
    volta.model = this.typeObject;
    volta.id = this.event.id;
    volta.addIntervention = intervention;
    this.canal.sendMessage(volta);
  }

  removeIntervention(graphIndex: number) {
    let volta : any = {};
    volta.model = this.typeObject;
    volta.id = this.event.id;
    volta.delIntervention = this.graphElements[graphIndex].intervention.id;
    if (this.typeObject == 'event') {
      this.dao.patchObject(ESPIM_REST_Events, {id : this.event.id, delIntervention : volta.delIntervention}).subscribe( _ => { this.canal.sendMessage(volta); });
    } else {
      this.dao.patchObject(ESPIM_REST_CustomCircleEvents, {id : this.event.id, delIntervention : volta.delIntervention}).subscribe( _ => { this.canal.sendMessage(volta); });      
    }
  }

  finish() {
    //if (this.hasMultiplePaths) {
    //  Swal.fire('Há intervenções desconectadas','Encontramos intervenções que não estão ligadas à primeira. Por favor, é necessário deleta-las ou liga-las ao caminho principal', 'warning');
    //  return;
    //}

    this.graphElements = [];
    this.graphElements.length =0;
    this.interventionElementsGraph=[[]]
    this.interventionElementsGraph.length=0;
    this.typeObject = '';

    //this.router.navigateByUrl(`private/programs/add/${this.program_id}/fourth`).then();
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

  saveUpdate(dado : any = {id : -1}){
    if (dado.id > 0){
      this.dao.patchObject(ESPIM_REST_Interventions,dado).subscribe();
    }
  }


}

export class HTMLInterventionElement {
  onChange$: Subject<HTMLInterventionElement> = new Subject<HTMLInterventionElement>();
  
  constructor(
      public intervention: Intervention,
  ) {  }

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
  get statement() { return this.intervention.statement; }
  set statement(statement: string) { this.intervention.statement = statement; }
  get orderPosition() { return this.intervention.orderPosition; }
  set orderPosition(orderPosition: number) { this.intervention.orderPosition = orderPosition; }
  get typeDescription() { return this.intervention?.getTypeDescription(); }
  get first() { return this.intervention.first; }
  set first(first: boolean) { this.intervention.first = first; }
  get obligatory() { return this.intervention.obligatory; }
  set obligatory(obligatory) { this.intervention.obligatory = obligatory; }

  get top() { return { x: this.x + this.width / 2 , y: this.y }; }
  get bottom() { return { x: this.x + this.width / 2, y: this.y + this.height}; }
  get left() { return { x: this.x , y: this.y + this.height/2} ; }
  get right() { return { x: this.x + this.width, y: this.y + this.height/2}; }
}
