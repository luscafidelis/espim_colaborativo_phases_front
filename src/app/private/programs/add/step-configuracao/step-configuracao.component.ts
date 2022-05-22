import { Component, OnInit } from '@angular/core';
import { Program, ProgramAdditionalResource } from 'src/app/private/models/program.model';
import { ProgramsAddService } from '../programsadd.service';

@Component({
  selector: 'app-step-configuracao',
  templateUrl: './step-configuracao.component.html'
})
export class StepConfiguracaoComponent implements OnInit {
  isOpenButtons : boolean = true;
  programAdditionalResources : ProgramAdditionalResource[] = [];
  isOpenGroups : boolean = true;

  constructor(private programAddService: ProgramsAddService) { }

  ngOnInit(): void {
    this.programAdditionalResources = this.programAddService.program.programAdditionalResource
    this.programAddService.getProgramObservable().subscribe((programInstance: Program) => {
      this.programAdditionalResources = programInstance.programAdditionalResource;
    });
  }

  openButtons(){
    this.isOpenButtons = !this.isOpenButtons;
  }

  openGroups(){
    this.isOpenGroups = !this.isOpenGroups;
  }

  saveResource(i : number){

  }

  getResourceName(loc_id: number){
    let volta : string = 'Sem nome';
    for (let pos = 0; pos < this.programAddService.additionalResource.length; pos++ ){
      if (this.programAddService.additionalResource[pos].id == loc_id) {
        return this.programAddService.additionalResource[pos].title;
      }
    }
    return volta;
  }

}
