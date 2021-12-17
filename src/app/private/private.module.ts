import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// imports from dependencies
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

// local imports
import { PrivateRoutingModule } from './private-routing.module';
import { PrivateComponent } from './private.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ParticipantsComponent } from './participants/participants.component';
import { ParticipanstAddComponent } from './participants/add/participantsadd.component';
import { ParticipantsListComponent } from './participants/list/participantslist.component';
import { ProgramsComponent } from './programs/programs.component';
import { ProgramsListComponent } from './programs/list/programlist.component';
import { SearchComponent } from './search/search.component';
import { SearchService } from './search/search.service';
import { DAOService } from './dao/dao.service';
import { ProgramsAddComponent } from './programs/add/programsadd.component';
import { ObserversComponent } from './observers/observers.component';
import { ObserversService } from './observers/observers.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DateConverterService } from '../util/util.date.converter.service';
import { Step1Component } from './programs/add/step1/step1.component';
import { Step2Component } from './programs/add/step2/step2.component';
import { Step3Component } from './programs/add/step3/step3.component';
import { ProgramsAddService } from './programs/add/programsadd.service';
import { EventComponent } from './programs/add/step4/event/event.component';
import { ActiveEventComponent } from './programs/add/step4/active-event/active-event.component';
import { TriggerComponent } from './programs/add/step4/trigger/trigger.component';
import { ResultsComponent } from './results/results.component';
import { UserCheckBoxComponent } from './programs/add/user-checkbox/user-checkbox.component';
import { Step4Component } from './programs/add/step4/step4.component';
import { InterventionsComponent } from './programs/intervention/interventions.component';
import { CanvasComponent } from './programs/intervention/canvas/canvas.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { InterventionComponent } from './programs/intervention/intervention/intervention.component';
import { NavbarComponent } from './programs/intervention/navbar/navbar.component';
import { UniqueChoiceComponent } from './programs/intervention/intervention/question/unique-choice/unique-choice.component';
import {QuestionComponent} from './programs/intervention/intervention/question/question.component';
import { MultipleChoiceComponent } from './programs/intervention/intervention/question/multiple-choice/multiple-choice.component';
import { LikertComponent } from './programs/intervention/intervention/question/likert/likert.component';
import { LikertCustomComponent } from './programs/intervention/intervention/question/likert-custom/likert-custom.component';
import { ProgramHistoricComponent } from './programs/add/program-historic/program-historic.component';
import { ProgramChatComponent } from './programs/add/program-chat/program-chat.component';
import { EditoresOnlineComponent } from './programs/add/editores-online/editores-online.component';
import { StepPanelComponent } from './programs/add/step-panel/step-panel.component';
import { ChannelService } from './channel_socket/socket.service';
import { InterventionService } from './programs/intervention/intervention.service';

@NgModule({
    imports: [
        CommonModule,
        PrivateRoutingModule,
        TranslateModule.forChild(),
        ReactiveFormsModule,
        FormsModule,
        SweetAlert2Module,
        NgbModule,
        DragDropModule
    ],
    declarations: [
      PrivateComponent,
      HeaderComponent,
      ParticipantsComponent,
      DashboardComponent,
      ParticipantsListComponent,
      ParticipanstAddComponent,
      PaginationComponent,
      SearchComponent,
      ProgramsComponent,
      ProgramsListComponent,
      ProgramsAddComponent,
      ObserversComponent,
      StepPanelComponent,
      Step1Component,
      Step2Component,
      Step3Component,
      Step4Component,
      EventComponent,
      ActiveEventComponent,
      TriggerComponent,
      ResultsComponent,
      UserCheckBoxComponent,
      InterventionsComponent,
      CanvasComponent,
      InterventionComponent,
      NavbarComponent,
      UniqueChoiceComponent,
      QuestionComponent,
      MultipleChoiceComponent,
      LikertComponent,
      LikertCustomComponent,
      ProgramHistoricComponent,
      ProgramChatComponent,
      EditoresOnlineComponent,
      ],
  providers: [ChannelService, DAOService, SearchService, ObserversService, DateConverterService, ProgramsAddService, InterventionService]
})
export class PrivateModule { }
