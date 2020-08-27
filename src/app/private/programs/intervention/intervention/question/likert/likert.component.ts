import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {QuestionIntervention} from '../../../../../models/intervention.model';

@Component({
  selector: 'esm-likert',
  templateUrl: './likert.component.html'
})
export class LikertComponent implements OnInit, OnChanges {
  @Input() graphIndex: number;
  @Input() nextInterventions: HTMLInterventionElement[];

  intervention: QuestionIntervention;

  // Normal Likert only has 1 scale
  get scale() { return this.intervention.scales[0]; }
  set scale(scale) { this.intervention.scales[0] = scale; }
  get affirmatives() { return this.intervention.options; }

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    this.scale = '5 AGREEMENT';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  addChoice() {
    this.affirmatives.push('Afirmativa' + (this.affirmatives.length + 1));
  }

  removeChoice(choiceIndex: number) {
    this.affirmatives.splice(choiceIndex, 1);
  }
}
