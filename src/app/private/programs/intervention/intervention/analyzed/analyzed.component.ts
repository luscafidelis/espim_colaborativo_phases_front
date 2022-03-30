import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AnalyzedIntervention } from 'src/app/private/models/intervention.model';
import { HTMLInterventionElement, InterventionService } from '../../intervention.service';

@Component({
  selector: 'app-analyzed',
  templateUrl: './analyzed.component.html'
})
export class AnalyzedComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() graphIndex!: number;
  @Input() nextInterventions!: HTMLInterventionElement[];

  analyzeType : string = 'P';

  arrayAnalyzeType : any[] = [{type : 'P', description : 'Analisador Python'}];

  intervention!: AnalyzedIntervention;

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    this.intervention = this.interventionService.graphElement(this.graphIndex).intervention as AnalyzedIntervention;
    this.analyzeType = 'P';
  }

  ngAfterViewInit(): void {
    this.analyzeType = 'P';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['graphIndex']) this.graphIndex = changes['graphIndex'].currentValue;
    if (changes['nextInterventions']) this.nextInterventions = changes['nextInterventions'].currentValue;
  }

  saveAnalyze(){
    this.updateIntervention({functionAnalyze : this.analyzeType});
  }

  updateIntervention(dados : any = {id : -1}) {
    dados.id = this.intervention.id;
    this.interventionService.saveUpdate(dados);
  }

}
