import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {QuestionIntervention} from '../../../../models/intervention.model';
import {HTMLInterventionElement, InterventionService} from "../../intervention.service";

@Component({
  selector: 'esm-question',
  templateUrl: './question.component.html'
})
export class QuestionComponent implements OnInit, OnChanges {

  @Input() graphIndex: number;
  @Input() nextInterventions: HTMLInterventionElement[];

  intervention: QuestionIntervention;

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }
}
