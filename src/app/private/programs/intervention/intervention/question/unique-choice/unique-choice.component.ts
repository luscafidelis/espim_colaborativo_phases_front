import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {QuestionIntervention} from '../../../../../models/intervention.model';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'esm-unique-choice',
  templateUrl: './unique-choice.component.html'
})
export class UniqueChoiceComponent implements OnInit, OnChanges {
  @Input() graphIndex: number;
  @Input() nextInterventions: HTMLInterventionElement[];

  intervention: QuestionIntervention;

  get alternatives() { return this.intervention?.options; }
  get conditions() { return this.intervention?.conditions; }

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    this.interventionService.newInterventions$.subscribe(value => {
      if (this.interventionService.lastInteractedIntervention === this.graphIndex) {
        let change = false;
        for (const alternative of this.alternatives)
          if (this.conditions[alternative] === 0) {
            this.conditions[alternative] = value.graphIndex;
            change = true;
          }
        if (!change) this.addChoice(value.graphIndex);
      }
    });
    this.interventionService.removeIntervention$.subscribe(value => {
      for (const alternative of this.alternatives) {
        if (this.conditions[alternative] === value)
          this.conditions[alternative] = 0;
        if (this.conditions[alternative] > value)
          this.conditions[alternative]--;
      }
      if (this.graphIndex > value) this.graphIndex -= 1;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // graphIndex only changes when removing an intervention and unique-choice needs special treatment so graphIndex gets updated in a subscription in ngInit()
    // if (changes.graphIndex) this.graphIndex = changes.graphIndex.currentValue;
    if (changes.nextInterventions) this.nextInterventions = changes.nextInterventions.currentValue;
  }

  toChar(num: number) {
    return String.fromCharCode(num);
  }

  addChoice(nextIndex: number = 0) {
    const text = `Alternativa ${this.alternatives.length + 1}`;
    this.alternatives.push(text);
    this.conditions[text] = nextIndex;
  }

  removeChoice(choiceIndex: number) {
    this.alternatives.splice(choiceIndex, 1);
    this.updateEdges();
  }

  updateEdges() {
    this.interventionService.removeEdges(this.graphIndex);
    for (const alternative of this.alternatives)
      if (this.conditions[alternative] !== 0) this.interventionService.setNextFromTo(this.graphIndex, Number.parseInt(this.conditions[alternative]));
  }

  setNextTo() {
    this.updateEdges();
  }

  onTextChange(alternativeIndex: number, oldAlternative: string, newAlternative: string) {
    this.conditions[newAlternative] = this.conditions[oldAlternative];
    this.alternatives[alternativeIndex] = newAlternative;
    delete this.conditions[oldAlternative];
  }

  onNextChange(alternative: string, nextSelected: string) {
    this.conditions[alternative] = Number.parseInt(nextSelected);
  }
}
