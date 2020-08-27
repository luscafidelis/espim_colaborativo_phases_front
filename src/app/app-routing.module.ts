import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { HomeComponent } from './index/home/home.component';
import { LoggedInGuard } from './security/loggedin.guard';
import {InterventionsComponent} from "./private/programs/intervention/interventions.component";

const routes: Routes = [
  {
    path: '',
    // component: InterventionsComponent
    component: IndexComponent,
    children: [
      { path: '', component: HomeComponent }
    ]
  },
  {
    path: 'private',
    loadChildren: () => import('./private/private.module').then(m => m.PrivateModule),
    canLoad: [LoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

