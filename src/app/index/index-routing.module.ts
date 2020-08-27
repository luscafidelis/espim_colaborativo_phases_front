import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index.component';
import { WorksComponent } from './works/works.component';
import { HomeComponent } from './home/home.component';
import { DownloadComponent } from './download/download.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TeamComponent } from './team/team.component';
import { SigninComponent } from './signin/signin.component';

const routes: Routes = [
    {
        path: 'index',
        component: IndexComponent,
        children: [
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'home',
                component: HomeComponent
            },
            {
                path: 'works',
                component: WorksComponent
            },
            {
                path: 'download',
                component: DownloadComponent
            }
            ,
            {
                path: 'timeline',
                component: TimelineComponent
            },
            {
                path: 'team',
                component: TeamComponent
            },
            {
                path: 'documentation',
                component: WorksComponent
            },
            {
                path: 'signin',
                component: SigninComponent
            }

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IndexRoutingModule { }