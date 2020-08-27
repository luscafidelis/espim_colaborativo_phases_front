import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivateComponent } from './private.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ParticipantsListComponent } from './participants/list/participantslist.component';
import { ParticipanstAddComponent } from './participants/add/participantsadd.component';
import { ProgramsListComponent } from './programs/list/programlist.component';
import { ProgramsAddComponent } from './programs/add/programsadd.component';
import { ObserversComponent } from './observers/observers.component';
import { Step1Component } from './programs/add/step1/step1.component';
import { Step2Component } from './programs/add/step2/step2.component';
import { Step3Component } from './programs/add/step3/step3.component';
import { Step4Component } from './programs/add/step4/step4.component';
import {ResultsComponent} from './results/results.component';
import {InterventionsComponent} from './programs/intervention/interventions.component';

const routes: Routes = [
    {
       path: '', component: PrivateComponent,
       children: [
        {path: '', component: DashboardComponent},
        {path: 'participants/list', component: ParticipantsListComponent},
        {path: 'participants/add', component: ParticipanstAddComponent},
        {path: 'participants/add/:id', component: ParticipanstAddComponent},
        {path: 'programs/list', component: ProgramsListComponent},
        {
         path: 'programs/add/:id',
         component: ProgramsAddComponent,
         children: [
           { path: 'first', component: Step1Component},
           { path: 'second', component: Step2Component},
           { path: 'third', component: Step3Component},
           { path: 'fourth', component: Step4Component},
         ]
        },
        {path: 'observers/add', component: ObserversComponent},
        {path: 'results/list', component: ResultsComponent}
       ]
    },
    {path: 'programs/add/:id/fourth/:event/interventions', component: InterventionsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PrivateRoutingModule { }
