import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {
  AnalyzedIntervention,
  Intervention,
  MediaIntervention,
  QuestionIntervention,
  TaskIntervention
} from '../../../models/intervention.model';
import {HTMLInterventionElement, InterventionService} from '../intervention.service';
import Swal from 'sweetalert2';
import { faComment, faAlignLeft, faDotCircle, faCheckSquare, faRulerCombined, faPencilRuler, faBalanceScale, faVideo, faMobile, faFileCode } from '@fortawesome/free-solid-svg-icons';

export const NAVBAR_HEIGHT = 60;


@Component({
  selector: 'esm-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  @Output() closeEditor = new EventEmitter()
  over1200px!: boolean;
  mobileToggleActivated!: boolean;
  addInterventionPopUp = false;

  _faComment = faComment;
  _faAlignLeft = faAlignLeft; 
  _faDotCircle = faDotCircle; 
  _faCheckSquare = faCheckSquare; 
  _faRulerCombined = faRulerCombined; 
  _faPencilRuler = faPencilRuler; 
  _faBalanceScale = faBalanceScale; 
  _faVideo = faVideo; 
  _faMobile = faMobile; 
  _faFileCode = faFileCode;
  


  constructor(private interventionService: InterventionService) { }

  get navbar_height() { return NAVBAR_HEIGHT; }

  ngOnInit(): void {
    this.over1200px = window.innerWidth > 950;
    if (this.over1200px) this.mobileToggleActivated = false;
  }

  addIntervention(type: string, subtype?: number) {
    let intervention!: Intervention;
    if (type === 'empty') intervention = new Intervention();
    else if (type === 'media') intervention = new MediaIntervention();
    else if (type === 'question') intervention = new QuestionIntervention({ questionType: subtype });
    else if (type === 'task') intervention = new TaskIntervention();
    else if (type === 'analyzed') intervention = new AnalyzedIntervention();

    this.interventionService.addIntervention(new HTMLInterventionElement(intervention));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.over1200px = window.innerWidth > 950;
    if (this.over1200px) this.mobileToggleActivated = false;
  }

  zoomPopUp() {
    Swal.fire({
      title: 'Zoom',
      text: 'Utilize o zoom do navegador para controlar o zoom.\nNormalmente isso pode ser feito segurando a tecla "CTRL" e pressionando as teclas "+" ou "-"'
    });
  }

  finish() {
    this.interventionService.finish();
    this.closeEditor.emit('nada');
  }

  debug() {
    console.log('interventionElementsGraph', this.interventionService.interventionElementsGraph);
  }
}
