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

  get scales() { return this.intervention.scales; }

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  addChoice() {
    this.scales.push('Valor' + (this.scales.length + 1));
  }

  removeChoice(choiceIndex: number) {
    this.scales.splice(choiceIndex, 1);
  }

}
