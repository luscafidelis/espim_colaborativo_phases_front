import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {QuestionIntervention} from '../../../../../models/intervention.model';

@Component({
  selector: 'esm-likert-custom',
  templateUrl: './likert-custom.component.html'
})
export class LikertCustomComponent implements OnInit, OnChanges {
  @Input() graphIndex: number;
  @Input() nextInterventions: HTMLInterventionElement[];

  intervention: QuestionIntervention;

  locScales : string [] = [];

  get scales() { return this.intervention.scales; }

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    if (this.intervention.scales.length > 0) {
      this.locScales = this.intervention.scales.slice();
    } else {
      this.locScales = [];
      this.intervention.scales = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  addChoice() {
    this.scales.push('');
    this.locScales.push('');
  }

  removeChoice(choiceIndex: number) {
    this.scales.splice(choiceIndex, 1);
    this.locScales.splice(choiceIndex, 1);
  }

  updateIntervention(dados : any = {id : -1}) {
    dados.id = this.intervention.id;
    this.interventionService.saveUpdate(dados);
  }

  encheVetor(pos: number = 0){
    this.scales[pos]= this.locScales[pos];
    this.updateIntervention({scales : this.scales});
  }

}
