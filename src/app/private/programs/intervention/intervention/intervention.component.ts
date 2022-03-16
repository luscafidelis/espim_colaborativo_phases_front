import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef, EventEmitter, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../intervention.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ESPIM_REST_Interventions } from 'src/app/app.api';
import { faTimes, faPaperclip } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'esm-intervention',
  templateUrl: './intervention.component.html'
})
export class InterventionComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  //Nome do arquivo de mídia
  fileName : string = '';
  fatimes = faTimes;
  fapaperclip = faPaperclip;

  uploadForm = new FormGroup({
    imgSrc: new FormControl('')
  });

  offset!: {x: number, y: number};
  interventionCoordinate!: HTMLInterventionElement;
  previousPosition!: {x: number, y: number};

  graphIndex!: number;

  nextInterventions: HTMLInterventionElement[] = [];
  nextInterventionSelect: string = '';
  
  @Output() interventionMoved = new EventEmitter<HTMLInterventionElement>();

  @ViewChild('interventionDiv') interventionDiv!: ElementRef;

  constructor(private interventionService: InterventionService, private dao : DAOService) { }

  ngOnInit(): void {
    this.nextInterventionSelect = '0';
    this.interventionService.firstInterventionChange$.subscribe(value => {
      if (this.graphIndex !== value) this.interventionCoordinate.first = false;
    });
    this.interventionService.removeIntervention$.subscribe(index => {
      if (this.graphIndex > index) this.graphIndex -= 1;
      console.log(this.graphIndex);
    });
  }

  ngAfterViewInit(): void {
    this.interventionCoordinate.width = this.interventionDiv.nativeElement.clientWidth;
    this.interventionCoordinate.height = this.interventionDiv.nativeElement.clientHeight;
    //this.interventionCoordinate.x = this.offset.x + this.interventionCoordinate.width / 2;
    //this.interventionCoordinate.y = this.offset.y + this.interventionCoordinate.height / 2;

  }

  updateIntervention (campo : any){
    campo.id = this.interventionCoordinate.intervention.id;
    this.dao.patchObject(ESPIM_REST_Interventions,campo).subscribe((data:any) => {console.log(data)});
  }

  ngAfterContentInit(): void {
    this.updateNextInterventions();
    this.interventionService.redrawGraph$.subscribe(_ => this.updateNextInterventions());
  }

  ngOnDestroy() {
  }

  toChar(num: number) {
    return String.fromCharCode(num);
  }

  updateNextInterventions() {
    this.nextInterventions = this.interventionService.graphElements;
    // If this intervention isn't of "unique-choice", this intervention will connect to only one other, that's why we only need to take the first connection (interventionElementsGraph[this.graphIndex][0]),
    // if there is no connection, 0. If it is unique-choice, "nextInterventionSelect" will not be used so it doesn't matter
    if (this.graphIndex < this.interventionService.interventionElementsGraph.length){
      this.nextInterventionSelect = this.interventionService.interventionElementsGraph[this.graphIndex][0]?.toString() || '0';
    }
  }

  interventionCurrentCoordinate() {
    const position = this.interventionDiv.nativeElement.style.transform.match(/\d+px/g).map((value:any) => Number.parseInt(value.substring(0, value.length - 2)));
    return {x: position[0], y: position[1]};
  }

  onDragStart() {
    this.previousPosition = this.interventionCurrentCoordinate();
  }

  //Não está atualizando a posição das outras intervenções nas outras máquinas...Tem que arrumar.....
  onDragEnd(){
    this.dao.patchObject(ESPIM_REST_Interventions, {id: this.interventionCoordinate.intervention.id, _x : this.interventionCoordinate.x, _y : this.interventionCoordinate.y}).subscribe((data: any) => console.log (data));
  }

  //È necessário jogar os valores no canal...
  moving() {
    const currentPosition = this.interventionCurrentCoordinate();
    const movement = { x: currentPosition.x - this.previousPosition.x, y: currentPosition.y - this.previousPosition.y };
    this.interventionCoordinate.x = this.interventionCoordinate.x + movement.x;
    this.interventionCoordinate.y = this.interventionCoordinate.y + movement.y;
    this.interventionMoved.emit(this.interventionCoordinate);
    this.previousPosition = currentPosition;
  }

  setNextTo() {
    const from = this.graphIndex;
    if (this.nextInterventionSelect === '0') {
      this.interventionService.removeEdges(from);
    } else {
      const to = Number.parseInt(this.nextInterventionSelect);
      this.interventionService.removeEdges(from, false);
      this.interventionService.setNextFromTo(from, to);
    }
    let volta : any = {};
    volta.id = this.interventionCoordinate.intervention.id;
    volta.next = {next : this.interventionService.interventionElementsGraph[this.graphIndex]};
    this.interventionService.saveUpdate(volta);
  }

  setFirst() {
    if (!this.interventionCoordinate.first) {
      this.interventionCoordinate.first = true;
      this.interventionService.setFirst(this.graphIndex);
      this.updateIntervention({first : true});
    }
  }

  remove() {
    this.interventionService.removeIntervention(this.graphIndex);
  }

  
  
  //Tem que arrumar para os arquivos serem armazenados no bucket...
  onFileSelected(event : any) {
    const file:File = event.target.files[0];
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      reader.readAsDataURL(file);
      this.fileName = file.name;
      const formData = new FormData();
      formData.append("thumbnail", file);
      reader.onload = () => {
        this.fileName = reader.result as string;
        this.uploadForm.patchValue({
          imgSrc: reader.result
        });
      }
    }
}

}
