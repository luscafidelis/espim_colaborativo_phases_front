import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {QuestionIntervention} from '../../../../../models/intervention.model';
import {faMinusCircle } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'esm-likert',
  templateUrl: './likert.component.html'
})
export class LikertComponent implements OnInit, OnChanges {
  @Input() graphIndex: number = 0;
  @Input() nextInterventions: HTMLInterventionElement[] = [];

  faminus = faMinusCircle;
  
  intervention: QuestionIntervention = new QuestionIntervention();

  // Normal Likert only has 1 scale
  get scale() { return this.intervention.scales[0]; }
  set scale(scale) { this.intervention.scales[0] = scale; 
                     this.updateIntervention({scales : this.intervention.scales})}

  constructor(private interventionService: InterventionService) { }

  locOptions : string[] = [];
  palavra : string = '';
  
  ngOnInit(): void {

    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    this.locOptions = this.intervention.options.slice();
    if (this.intervention.scales.length > 0) {
      this.scale = this.intervention.scales[0];
    } else {
      this.scale = '5 AGREEMENT';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['graphIndex']) this.graphIndex = changes['graphIndex'].currentValue;
    if (changes['nextInterventions']) this.nextInterventions = changes['nextInterventions'].currentValue;
  }

  addChoice() {
    this.locOptions.push('');
    this.intervention.options.push('');
  }

  removeChoice(choiceIndex: number) {
    this.locOptions.splice(choiceIndex, 1);
    this.updateIntervention({options : this.locOptions});
  }

  updateIntervention(dados : any = {id : -1}) {
    dados.id = this.intervention.id;
    this.interventionService.saveUpdate(dados);
  }

  encheVetor(pos: number = 0){
    this.locOptions[pos]= this.intervention.options[pos];
    this.updateIntervention({options : this.intervention.options});
  }
}
