import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProgramsAddService } from '../programsadd.service';
import {Program} from '../../../models/program.model';

@Component({
  selector: 'app-step-sensor',
  templateUrl: './step-sensor.component.html'
})
export class StepSensorComponent implements OnInit, OnDestroy {
  events!: Array<any>;

  constructor(private programsAddService: ProgramsAddService) { }
  
  
  ngOnDestroy(): void {

  }

  ngOnInit() {
    this.events = this.programsAddService.getEventsInstance();

    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.programsAddService.getProgramObservable().subscribe((programInstance: Program) => this.events = this.programsAddService.getEventsInstance());
  }
}