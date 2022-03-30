import { Component, OnInit } from '@angular/core';
import { CircleType } from 'src/app/private/models/circle.model';
import { AlertNotificationButton, Program } from 'src/app/private/models/program.model';
import { ProgramsAddService } from '../../programsadd.service';
import { faTrashAlt,faMinusCircle, faL } from '@fortawesome/free-solid-svg-icons';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ESPIM_REST_AlertNotificationButtons, ESPIM_REST_CircleTypes } from 'src/app/app.api';

@Component({
  selector: 'app-comunicate-buttons',
  templateUrl: './comunicate-buttons.component.html'
})
export class ComunicateButtonsComponent implements OnInit {

  arrayButtons : AlertNotificationButton[] = [];
  buttonsCollapse : boolean[] = [];

  //Vetor dos participantes círculo, representa o banco de dados..
  listCircleType : CircleType[] = [];
  booleanCircleType : boolean[] =[];

  //icons
  faTras = faTrashAlt;
  faMinus = faMinusCircle;

  //Id do programa..
  program_id : number = -1;
  geted : boolean = false;

  constructor(private programAdd : ProgramsAddService, private dao : DAOService) { }

  ngOnInit(): void {
    this.program_id = this.programAdd.program.id;
    this.dao.getNewObject(ESPIM_REST_CircleTypes,{}).subscribe((data : any) => {this.listCircleType = data;});
    this.geted = false;
    this.getButtons();
    this.programAdd.getProgramObservable().subscribe((data : any) => {
      this.program_id = data.id;
      this.getButtons();
    })

  }

  getButtons(){
    if (this.program_id != -1 && !this.geted) {
      this.geted = true;
      this.dao.getNewObject(ESPIM_REST_AlertNotificationButtons,{program : this.program_id}).subscribe((data : any) => {
        this.arrayButtons = data;
        for (let i=0 ; i < this.arrayButtons.length; i++){
          this.buttonsCollapse.push(true);
        }
      })
    }
  }

  saveButton(campo : any = {}, posButton : number){
    campo.id = this.arrayButtons[posButton].id;
    this.dao.patchObject(ESPIM_REST_AlertNotificationButtons, campo). subscribe ((data : any) => {});
  }

  addButton(){
    let locObj = {type : 'N',buttonLabel : 'Notificar', title : 'Botão sem título', description: '', program : this.programAdd.program.id}
    this.dao.postObject(ESPIM_REST_AlertNotificationButtons,locObj).subscribe((data : any) => {
      this.arrayButtons.push(data);
      this.buttonsCollapse.push(false);
    });
  }

  //Exibe ou esconde os dados do botão
  changeButtonCollapse(posButton : number){
    this.buttonsCollapse[posButton] = !this.buttonsCollapse[posButton];
  }

  // Apaga um botão
  removeButton (posButton: number){
    this.dao.deleteObject(ESPIM_REST_AlertNotificationButtons,this.arrayButtons[posButton].id.toString()).subscribe((volta : any) =>
    {
      this.buttonsCollapse.splice(posButton,1);
      this.arrayButtons.splice(posButton,1);
    })
  }

  //Este método apaga um tipo de círculo da lista dos participantes círculo que irão receber as intervenções
  removeCircle(posCircle : number, posButton: number){
    this.arrayButtons[posButton].circleType.splice(posCircle,1);
    let locObj = {circleType : this.arrayButtons[posButton].circleType};
    this.saveButton(locObj,posButton);
  }

  
  //Posição do botão que está sendo editado o círculo...
  posButton : number = 0;

  addCircle(posButton : number){
    //Tem que salvar para saber a hora que vier a escolha do modal
    this.posButton = posButton;
    this.booleanCircleType = [];
    for (let i=0; i < this.listCircleType.length; i++){
      this.booleanCircleType.push(this.isSelected(i));
    }
  }

  isSelected (posCircle : number=0) : boolean{
    let volta : boolean = false;
    this.arrayButtons[this.posButton].circleType.forEach(tipo => {if (tipo.id == this.listCircleType[posCircle].id){volta=true}});
    return volta;
  }

    
  saveCircle(posCircle : number){
    this.arrayButtons[this.posButton].circleType.push(this.listCircleType[posCircle]);
    let locObj = {circleType : this.arrayButtons[this.posButton].circleType};
    this.saveButton(locObj,this.posButton);
  }


}
