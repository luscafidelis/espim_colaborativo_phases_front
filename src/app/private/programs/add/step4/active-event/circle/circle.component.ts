import { Component, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import {ESPIM_REST_CircleTypes, ESPIM_REST_CustomCircleEvents, ESPIM_REST_Interventions, ESPIM_REST_RespostCircleEvents, ESPIM_REST_SameCircleEvents, ESPIM_REST_TargetCircleEvents } from 'src/app/app.api';
import { DAOService } from 'src/app/private/dao/dao.service';
import { CircleType, CustomCircleEvent, RespostCircleEvent, SameCircleEvent, TargetCircleEvent } from 'src/app/private/models/circle.model';
import { ActiveEvent, Event } from 'src/app/private/models/event.model';
import { InterventionService } from 'src/app/private/programs/intervention/intervention.service';
import Swal from 'sweetalert2';
import { ProgramsAddService } from '../../../programsadd.service';
import { faTrashAlt,faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { InterventionsComponent } from 'src/app/private/programs/intervention/interventions.component';
import { Intervention } from 'src/app/private/models/intervention.model';
declare var window: any;



@Component({
  selector: 'esm-circle',
  templateUrl: './circle.component.html'
})
export class CircleComponent implements OnInit {
  @Input() event : ActiveEvent = new ActiveEvent();

  formModal : any;
  
  //Criar em tempo de execução o componente interventions..
  @ViewChild('divInterventions2', { read: ViewContainerRef }) interventionsContainer!: ViewContainerRef;
  locIntervention! : ComponentRef<InterventionsComponent>;
  
  //Constantes, tipos de design círculo
  same = 1;
  custom = 2;
  respost = 3;  
  target=4;

  //icons
  faTras = faTrashAlt;
  faMinus = faMinusCircle;

  // Participantes Círculo que participarão das intervenções  
  sameInterventions : SameCircleEvent = {id : -1, event : this.event, selected : false, circle_type : []};
  arrayCustomInterventions : CustomCircleEvent[] = [];
  respostToCircle : RespostCircleEvent = {id : -1, event : this.event, selected : false, circle_type : [], need_autorization : false};
  targetCircle : TargetCircleEvent = {id : -1, event : this.event, selected : false, need_autorization : false, circle_type : []};
 
  //Variáveis dos checkbox
  booleanCustomInterventions! : boolean;

  //Vetor dos participantes círculo, representa o banco de dados..
  listCircleType : CircleType[] = [];
  booleanCircleType : boolean[] =[];

  //Vetor que controla o colapso das custom interventions
  customCollapse : boolean[] = [];

  //Variáveis que define o tipo de circle em edição
  typeCircleEditing! : number;
  customEditing!  : number;

  //Variável que controla a abertura do editor de intervenções..
  editorCollapse : boolean = true;

  constructor(private dao : DAOService, private interventionService : InterventionService, private programAddService : ProgramsAddService) { }

  ngOnInit(): void {
    this.dao.getNewObject(ESPIM_REST_CircleTypes,{}).subscribe((data : any) => {this.listCircleType = data; 
    console.log(this.listCircleType)});
    this.booleanCustomInterventions = false;
     if (this.event.id > 0) {
      this.dao.getNewObject(ESPIM_REST_SameCircleEvents,{event : this.event?.id}).subscribe((data : any) => {
        if (data.id > 0){
          this.sameInterventions = data;
        }
      });
      this.dao.getNewObject(ESPIM_REST_CustomCircleEvents,{event : this.event?.id}).subscribe((data : any) => {
        //Caso tenha algum conjunto de intervenções personalizadas cadastrados
        if (data.length > 0){
          this.arrayCustomInterventions = data;
          this.booleanCustomInterventions = true;
        }
      });
      this.dao.getNewObject(ESPIM_REST_RespostCircleEvents,{event : this.event?.id}).subscribe((data : any) => {
        if (data.id > 0) {
          this.respostToCircle = data;
        }
      });
      this.dao.getNewObject(ESPIM_REST_TargetCircleEvents,{event : this.event?.id}).subscribe((data : any) => {
        if (data.id > 0) {
          this.targetCircle = data;
        }
      });
    }
    this.formModal = new window.bootstrap.Modal(
      document.getElementById('editorModal')
    );
  }

  //Este método serve para gerar o bg-primary e text-white e bold das opções selecionadas...
  gClass(teste : boolean): any {
    return {'fw-bold' : teste, ' bg-primary': teste, ' text-white': teste }
  }

  //Este método verifica quando altera o campo selected do tipo de circlo e confirma antes de apagar tudo..
  changeSelected(type : number){
    let testar : boolean = false;
    //verifica se a opção foi passada para falso..
    if (type == this.same && !this.sameInterventions.selected && (this.sameInterventions.id || 0) > 0) testar=true;
    if (type == this.custom && !this.booleanCustomInterventions && this.arrayCustomInterventions.length > 0) testar=true;
    if (type == this.respost && !this.respostToCircle.selected && (this.respostToCircle.id || 0) > 0) testar=true;
    if (type == this.target && !this.targetCircle.selected && (this.targetCircle.id || 0) > 0) testar=true;


    if (testar) {
      Swal.fire({
        title: 'Remover a opção',
        text: `Você tem certeza que deseja deletar todas as escolhas já feitas para esta opção?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não'
      }).then((result : any) => {
        if (result.isConfirmed){
          this.delChangeSelected (type);
        } else {
          if (type == this.same) this.sameInterventions.selected=true;
          if (type == this.custom) this.booleanCustomInterventions=true;
          if (type == this.respost) this.respostToCircle.selected=true;
          if (type == this.target) this.targetCircle.selected=true;
        }
      });  
    }
  }

  delChangeSelected(type : number){
    switch(type){
      case this.same :{
        this.dao.deleteObject(ESPIM_REST_SameCircleEvents,this.sameInterventions.id!.toString()).subscribe((data : any) => {console.log('apagou same')});
        this.sameInterventions = {id : -1, event : this.event, selected : false, circle_type : []};
        break;
      }
      case this.custom : {
        for (let i=0; i < this.arrayCustomInterventions.length; i++){
          this.dao.deleteObject(ESPIM_REST_CustomCircleEvents,this.arrayCustomInterventions[i].id!.toString()).subscribe((data:any) => {console.log('apagou custom')});
        }
        this.arrayCustomInterventions = [];
        this.booleanCustomInterventions = false;
        break;
      }
      case this.respost :{
        this.dao.deleteObject(ESPIM_REST_RespostCircleEvents,this.respostToCircle.id!.toString()).subscribe((data:any) => {console.log('apagou respost')});
        this.respostToCircle = {id : -1, event : this.event, selected : false, circle_type : [], need_autorization : false};
        break;
      }
      case this.target : {

      }
    }

    if (type == this.same){

    } else {
      if (type == this.custom){


      } else {
        if (type == this.respost && !this.respostToCircle.selected){

        }
      }
    }
  }
    
  //Este método apaga um tipo de círculo da lista do participantes círculo que irão receber as intervenções
  removeCircle(i : number, type: number, custom : number = -1){
    switch(type){
      case this.same : {  //same
        this.sameInterventions.circle_type.splice(i,1);
        this.saveSame({circle_type : this.sameInterventions.circle_type});
        break;
      }
      case this.custom : { //custom
        this.arrayCustomInterventions[custom].circle_type.splice(i,1);
        this.saveCustom({circle_type : this.arrayCustomInterventions[custom].circle_type},custom);
        break;
      }
      case this.respost : { //Respost 
        this.respostToCircle.circle_type.splice(i,1);
        this.saveRespost({circle_type : this.respostToCircle.circle_type});
        break;
      }
      case this.target : { //Respost 
        this.targetCircle.circle_type.splice(i,1);
        this.saveTarget({circle_type : this.targetCircle.circle_type});
        break;
      }
    }
  }

  //Cria um novo elemento no vetor de intervenções personalizadas dos círculos..
  addCustom(){
    this.dao.postObject(ESPIM_REST_CustomCircleEvents, {event : this.event.id, title : 'sem título', description : '', circle_type : []}).subscribe((data : any) => {
                                                        this.arrayCustomInterventions.push(data);
                                                        this.customCollapse.push(false); });
  }

  //Abre e fecha a janela de algum dos conjuntos de intervenções personalizadas dos círculos...
  changeCustomCollapse(i : number){
    this.customCollapse[i] = !this.customCollapse[i];
  }

  //remove um conjunto de intervenções personalizadas
  removeCustom (pos : number) {
    Swal.fire({
      title: 'Deletar?',
      text: `Você tem certeza que deseja deletar ${this.arrayCustomInterventions[pos].title}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result : any) => {
      if (result.isConfirmed){
         this.dao.deleteObject(ESPIM_REST_CustomCircleEvents, this.arrayCustomInterventions[pos].id!.toString()).subscribe((data:any) =>{
           console.log("apagou"); })
         this.arrayCustomInterventions.splice(pos,1);
         this.customCollapse.splice(pos,1);
      }
    });    
  }

  //Este método é chamado quando é clicado o botão para escolher os círculos, ele inicializa os vetores conforme o tipo de 
  //círculo selecionado na interface. quando for o Custom será indicada também a posição do custom no vetor
  //Ele é chamado antes de abrir o modall
  chooseCircle(circle : number, custom : number = -1){
    this.typeCircleEditing = circle;
    this.customEditing = custom;
    this.booleanCircleType = [];
    for (let i=0; i < this.listCircleType.length; i++){
      this.booleanCircleType.push(this.isSelected(i));
    }
  }

  //Método que verifica se o Tipo de Círculo está selecionado, utilizado para criar a lista da janela modal
  isSelected (pos : number=0) : boolean{
    let volta : boolean = false;
    switch(this.typeCircleEditing){
      case this.same : {  //same
        this.sameInterventions.circle_type.forEach(tipo => {if (tipo.id == this.listCircleType[pos].id){volta=true}});
        break;
      }
      case this.custom : { //custom
        this.arrayCustomInterventions[this.customEditing].circle_type.forEach(tipo => {if (tipo.id == this.listCircleType[pos].id){volta=true}});
        break;
      }
      case this.respost : { //Respost 
        this.respostToCircle.circle_type.forEach(tipo => {if (tipo.id == this.listCircleType[pos].id){volta=true}});
        break;
      }
      case this.target : { //Target
        this.targetCircle.circle_type.forEach(tipo => {if (tipo.id == this.listCircleType[pos].id){volta=true}});
        break;
      }
    }
    return volta;
  }

  //Este método é chamado pela janela modal.. o tipo de círculo e a posição do custom são defenidas no método choosecircle
  saveCircle(pos:number){
    switch(this.typeCircleEditing){
      case this.same : {  //same
        this.sameInterventions.circle_type.push(this.listCircleType[pos]);
        this.sameInterventions.circle_type.sort((a,b) => {
          if (a.description < b.description) return -1;
          else if (a.description > b.description) return 1;
          else return 0;
        })
        this.saveSame({circle_type : this.sameInterventions.circle_type});
        break;
      }
      case this.custom : { //custom
        this.arrayCustomInterventions[this.customEditing].circle_type.push(this.listCircleType[pos]);
        this.arrayCustomInterventions[this.customEditing].circle_type.sort((a,b) => {
          if (a.description < b.description) return -1;
          else if (a.description > b.description) return 1;
          else return 0;
        })
        this.saveCustom({circle_type : this.arrayCustomInterventions[this.customEditing].circle_type}, this.customEditing)
        break;
      }
      case this.respost : { //Respost 
        this.respostToCircle.circle_type.push(this.listCircleType[pos]);
        this.respostToCircle.circle_type.sort((a,b) => {
          if (a.description < b.description) return -1;
          else if (a.description > b.description) return 1;
          else return 0;
        })
        this.saveRespost({circle_type : this.respostToCircle.circle_type});
        break;
      }
      case this.target : { //Target 
        this.targetCircle.circle_type.push(this.listCircleType[pos]);
        this.targetCircle.circle_type.sort((a,b) => {
          if (a.description < b.description) return -1;
          else if (a.description > b.description) return 1;
          else return 0;
        })
        this.saveTarget({circle_type : this.targetCircle.circle_type});
        break;
      }
    }
  }

 //Métodos de gravação no banco de dados..

  saveSame(obj : any = {}){
    if (this.sameInterventions.id == -1){
      if (this.sameInterventions.selected && this.sameInterventions.circle_type.length > 0){
        this.dao.postObject(ESPIM_REST_SameCircleEvents, {event : this.event.id, circle_type : this.sameInterventions.circle_type, selected : this.sameInterventions.selected}).subscribe((data : any) => {this.sameInterventions.id = data.id;});
     }
    } else {
      obj.id = this.sameInterventions.id;
      this.dao.patchObject(ESPIM_REST_SameCircleEvents, obj).subscribe((data:any) => {console.log(data)});
    }
  }

  saveCustom(obj : any = {}, pos: number){
    if (this.arrayCustomInterventions[pos].id != -1){
      obj.id = this.arrayCustomInterventions[pos].id;
      this.dao.patchObject(ESPIM_REST_CustomCircleEvents, obj).subscribe((data:any) => {console.log(data)});
    }
  }

  saveRespost(obj : any = {}){
    if (this.respostToCircle.id == -1){
      if (this.respostToCircle.selected && this.respostToCircle.circle_type.length > 0){
        this.dao.postObject(ESPIM_REST_RespostCircleEvents, {event : this.event.id, circle_type : this.respostToCircle.circle_type, selected : this.respostToCircle.selected, need_autorization : this.respostToCircle.need_autorization}).subscribe((data : any) => {this.respostToCircle.id = data.id;});
     }
    } else {
      obj.id = this.respostToCircle.id;
      this.dao.patchObject(ESPIM_REST_RespostCircleEvents, obj).subscribe((data:any) => {console.log(data)});
    }
  }

  saveTarget(obj : any = {}){
    if (this.targetCircle.id == -1){
      if (this.targetCircle.selected){
        this.dao.postObject(ESPIM_REST_TargetCircleEvents, {event : this.event.id, selected : this.targetCircle.selected, need_autorization : this.targetCircle.need_autorization}).subscribe((data : any) => {this.targetCircle.id = data.id;});
     }
    } else {
      obj.id = this.targetCircle.id;
      this.dao.patchObject(ESPIM_REST_TargetCircleEvents, obj).subscribe((data:any) => {console.log(data)});
    }
  }

  //Configuração para abrir e fechar o editor de intervenções

  posx : number = 0;
  posy : number = 0;

  goToInterventions(pos : number) {
    this.posx = window.pageXOffset;
    this.posy = window.pageYOffset;

    let locCustom = this.arrayCustomInterventions[pos];
    this.customEditing = pos;
    if (locCustom.id != null){
      this.dao.getNewObject(ESPIM_REST_Interventions,{CustomCircleEvent : locCustom.id}).subscribe((data : any) => {
        this.interventionService.init(this.programAddService.program.id, locCustom, Intervention.factory(data));
        this.formModal.show();
        this.locIntervention = this.interventionsContainer.createComponent(InterventionsComponent);
        this.locIntervention.instance.closeInterventions.subscribe((val:any) => this.closeInterventions(val));
        //this.router.navigate([this.event.getId(), 'interventions'], {relativeTo: this.route});
      })
    }
  }

  closeInterventions(volta : any){
    this.formModal.hide();
    this.locIntervention.destroy();
    this.dao.getObject(ESPIM_REST_CustomCircleEvents,this.arrayCustomInterventions[this.customEditing].id!.toString()).subscribe((data : any) => {
      this.arrayCustomInterventions[this.customEditing].interventions = data.interventions; 
    })
    window.scrollTo(this.posx, this.posy);
  }


}
