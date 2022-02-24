import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {QuestionIntervention} from '../../../../../models/intervention.model';

@Component({
  selector: 'esm-multiple-choice',
  templateUrl: './multiple-choice.component.html'
})
export class MultipleChoiceComponent implements OnInit, OnChanges {
  @Input() graphIndex: number;
  @Input() nextInterventions: HTMLInterventionElement[];

  intervention: QuestionIntervention;

  get alternatives() { return this.intervention.options; }

  locScales : string[] = [];

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    if (this.alternatives.length == 0) {
      this.alternatives.push('Alternativa 1');
      this.alternatives.push('Alternativa 2');
    }
    this.locScales = this.alternatives.slice();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  addChoice() {
    this.alternatives.push('');
    this.locScales.push('');
  }

  removeChoice(choiceIndex: number) {
    this.alternatives.splice(choiceIndex, 1);
    this.locScales.splice(choiceIndex, 1);
  }

  updateIntervention(dados : any = {id : -1}) {
    dados.id = this.intervention.id;
    this.interventionService.saveUpdate(dados);
  }

  encheVetor(pos: number = 0){
    this.alternatives[pos]= this.locScales[pos];
    this.updateIntervention({options : this.alternatives});
  }

  debug() {
    console.log(this.intervention);
  }
}
