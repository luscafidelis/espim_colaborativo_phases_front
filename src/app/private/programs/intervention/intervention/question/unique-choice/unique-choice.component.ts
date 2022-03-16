import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {QuestionIntervention} from '../../../../../models/intervention.model';
import {HTMLInterventionElement, InterventionService} from '../../../intervention.service';
import {faMinusCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'esm-unique-choice',
  templateUrl: './unique-choice.component.html'
})
export class UniqueChoiceComponent implements OnInit, OnChanges {
  @Input() graphIndex: number = 0;
  @Input() nextInterventions: HTMLInterventionElement[] = [];

  intervention: QuestionIntervention = new QuestionIntervention();
  id : number = -1;
  faminus = faMinusCircle;
  locAlternative : string [] = [];
 
  get alternatives(): string[] { return this.intervention?.options; }
  get conditions(): any { return this.intervention?.conditions; }

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as QuestionIntervention;
    this.id = this.intervention.id;
    this.locAlternative = this.alternatives.slice();
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
    if (changes['nextInterventions']){ 
      this.nextInterventions = changes['nextInterventions'].currentValue;
    }
  }

  toChar(num: number) {
    return String.fromCharCode(num);
  }

  addChoice(nextIndex: number = 0) {
    const text = `Alternativa ${this.alternatives.length + 1}`;
    this.alternatives.push(text);
    this.locAlternative.push(text);
    this.conditions[text] = nextIndex;
    //this.interventionService.saveUpdate({id : this.id, conditions : this.conditions, options : this.alternatives})
  }

  removeChoice(choiceIndex: number) {
    delete this.conditions[this.alternatives[choiceIndex]];
    this.alternatives.splice(choiceIndex, 1);
    this.locAlternative.splice(choiceIndex, 1);
    this.updateEdges();
    this.updateIntervention({conditions : this.conditions, options : this.alternatives, next : {next : this.interventionService.interventionElementsGraph[this.graphIndex]}});

  }

  updateEdges() {
    this.interventionService.removeEdges(this.graphIndex);
    for (const alternative of this.alternatives){
      if (this.conditions[alternative] !== 0) {
        this.interventionService.setNextFromTo(this.graphIndex, Number.parseInt(this.conditions[alternative]));
      }
    }
  }

  setNextTo() {
    this.updateEdges();
  }

  onTextChange(index: number) {
    //this.conditions[newAlternative] = this.conditions[oldAlternative];
    //delete this.conditions[oldAlternative];
    //this.alternatives[alternativeIndex] = newAlternative;
    this.conditions[this.locAlternative[index]] = this.conditions[this.alternatives[index]];
    delete this.conditions[this.alternatives[index]];
    this.alternatives[index] = this.locAlternative[index];
    this.updateIntervention({conditions : this.conditions, options : this.alternatives})
  }

  onNextChange(alternative: string, nextSelected: string) {
    this.conditions[alternative] = Number.parseInt(nextSelected);
    this.updateEdges();
    this.updateIntervention({conditions : this.conditions, next : {next : this.interventionService.interventionElementsGraph[this.graphIndex]}})
  }

  updateIntervention(dados : any = {id : -1}) {
    dados.id = this.intervention.id;
    this.interventionService.saveUpdate(dados);
  }
}
