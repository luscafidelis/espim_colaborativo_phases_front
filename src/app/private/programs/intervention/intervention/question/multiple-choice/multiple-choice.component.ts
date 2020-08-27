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

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    this.alternatives.push('Alternativa 1');
    this.alternatives.push('Alternativa 2');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  addChoice() {
    this.alternatives.push('Alternative ' + (this.alternatives.length + 1));
  }

  removeChoice(choiceIndex: number) {
    this.alternatives.splice(choiceIndex, 1);
  }

  debug() {
    console.log(this.intervention);
  }
}
