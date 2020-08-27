import { Component, Input, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { ProgramsAddService } from '../programsadd.service';

@Component({
  selector: 'esm-step-panel',
  templateUrl: './step-panel.component.html'
})
export class StepPanelComponent implements OnInit {

  // TODO - Right now the steps are only links, but, when leaving step 1 you need to make sure it has a title

  @Input() id: number;
  currentStep: number;

  get hasProgramObservers() { return this.programsAddService.getObserversInstance() && this.programsAddService.getObserversInstance().length > 0; }
  get hasProgramParticipants() { return this.programsAddService.getParticipantsInstance() && this.programsAddService.getParticipantsInstance().length > 0; }
  get hasEvents() { return this.programsAddService.getEventsInstance() && this.programsAddService.getEventsInstance().length > 0; }

  constructor(private programsAddService: ProgramsAddService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    // Sets the currentStep when this component is created
    if (this.id === -1) this.currentStep = 1;
    else this.currentStep = 4;

    // Subscribes to url changes. At first there will be a 'reset' queryParam that indicates that the currentStep shall be reseted. Then, it will listen to url changes and update the currentStep accordingly
    this.router.events.subscribe((value: NavigationEnd) => {
      if (this.activatedRoute.snapshot.queryParamMap.get('reset')) {
        this.currentStep = 1;
        return;
      }
      else this.updateStep(value.urlAfterRedirects);
    });
  }

  updateStep(url: string) {
    if (!url)
      return;
    const urlArray = url.split('/');
    const urlStep = urlArray.pop();

    let step: number;
    if (urlStep.startsWith('first'))
      step = 1;
    else if (urlStep.startsWith('second'))
      step = 2;
    else if (urlStep.startsWith('third'))
      step = 3;
    else if (urlStep.startsWith('fourth'))
      step = 4;

    if (step > this.currentStep)
      this.currentStep = step;
  }
}
