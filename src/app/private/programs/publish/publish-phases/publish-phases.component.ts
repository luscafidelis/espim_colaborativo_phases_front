import { Component, OnDestroy, OnInit, Query, ViewChild } from '@angular/core';
import { DAOService } from 'src/app/private/dao/dao.service';
import { Program } from 'src/app/private/models/program.model';
import { ProgramsAddService } from '../../add/programsadd.service';
import { faTrashAlt,faMinusCircle, faL, faCalendar, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { ProgramVersion } from 'src/app/private/models/program.version.model';
import { ProgramPublicade } from 'src/app/private/models/program.publicade.model';
import { PublishService } from '../publish.service';
import { NgbCalendar, NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink';
import { DateConverterService } from 'src/app/util/util.date.converter.service';

@Component({
  selector: 'app-publish-phases',
  templateUrl: './publish-phases.component.html'
})
export class PublishPhasesComponent implements OnInit, OnDestroy {
  @ViewChild('e', {static: false}) endDateComponent!: Query;
  publishService: any;

  setBeginDate(e: NgbDateStruct) {
    this.programInformationForm.value.beginDate = this.dateConverterService.toString(e);
    this.updateField('starts');
  }

  setEndDate(e: NgbDateStruct) {
    this.programInformationForm.value.endDate = this.dateConverterService.toString(e);
    this.updateField('ends');
  }
  
  program : ProgramPublicade = new ProgramPublicade();
  phasesCollapse : boolean[] = [];


  //datepicker
  calendar = faCalendar;
  arrowRight = faArrowRight;
  arrowLeft = faArrowLeft;
  //icons
  faTras = faTrashAlt;
  faMinus = faMinusCircle;
    
  subSink = new SubSink();
  
  programInformationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
    isPublic: [false],
    beginDate: ['', [Validators.required]],
    beginTime: [{ hour: 0, minute: 0, second: 0 }],
    endDate: [''],
    endTime: [{ hour: 0, minute: 0, second: 0 }],
    programPublicade : ['', [Validators.required]]
  });

  get invalidTitle() {
    const form = this.programInformationForm.get('title');
    return !form?.valid && form?.touched;
  }
  get invalidBeginDate() {
    const form = this.programInformationForm.get('beginDate');
    return !form?.valid && form?.touched;
  }

  constructor(private programAddService: PublishService, private formBuilder: FormBuilder, private dateConverterService: DateConverterService
    ,private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>) {}
  
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * Sets programInformationForm according to the passed program
   * @param program -
   */
  setProgram(program: ProgramPublicade) {
    console.log('Setou o programa ' , program);
    if (!program)
      return;

    const utcStarts = Number.parseInt(program.starts);
    const utcEnds = Number.parseInt(program.ends);

    let starts: Date = new Date();
    let ends: Date = new Date();

    if (!isNaN(utcStarts)) starts = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.starts));
    if (!isNaN(utcEnds)) ends = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.ends));


    this.programInformationForm = this.formBuilder.group({
      title: [program.title, [Validators.required]],
      description: [program.description],
      beginDate: [!isNaN(utcStarts) ? this.dateConverterService.toStrDate(starts) : null, [Validators.required]],
      beginTime: [!isNaN(utcStarts) ? this.dateConverterService.toNgbTime(starts) : null],
      endDate: [!isNaN(utcEnds) ? this.dateConverterService.toStrDate(ends) : null],
      endTime: [!isNaN(utcEnds) ? this.dateConverterService.toNgbTime(ends) : null]
    });
    console.log(this.programInformationForm);
  }


  //Atualiza os campos no banco quando são alterados
  updateField(field : string){
    let obj : any = {};
    if (field == 'starts') {
      if (this.programInformationForm.get('beginDate')!.value != null && this.programInformationForm.get('beginTime')?.value != null) {
        let date = this.dateConverterService.parse(this.programInformationForm.get('beginDate')!.value);
        obj['starts'] = this.dateConverterService.toUnixTimeStamp(date, this.programInformationForm.get('beginTime')?.value);
      } else {
        return;
      }
    } else {
      if (field == 'ends') {
        if (this.programInformationForm.get('endDate')!.value != null && this.programInformationForm.get('endTime')?.value != null) {
          let date = this.dateConverterService.parse(this.programInformationForm.get('endDate')!.value);
          obj['ends'] = this.dateConverterService.toUnixTimeStamp(date, this.programInformationForm.get('endTime')?.value);
        } else {
          return;
        }       
      } else {
        obj[field] = this.programInformationForm.get(field)?.value;
      }
    }
    this.programAddService.saveStep(obj);
  }

  submit(): void {

  }

  ngOnInit(): void {
    this.program = this.programAddService.program;
    this.programAddService.getProgramObservable().subscribe((programInstance: ProgramPublicade) => {this.program = programInstance;});
  }

  addPhases(){
    this.program.phasesPublicade.push({id: -1, title:'',starts:'',description: '' ,ends:'',programVersion: new ProgramVersion()});
    this.phasesCollapse.push(false); 
  }

  changeButtonCollapse(posButton : number){
    this.phasesCollapse[posButton] = !this.phasesCollapse[posButton];
  }

  // Apaga uma phase
  removePhase (posPhase: number){
    this.phasesCollapse.splice(posPhase,1);
    this.program.phasesPublicade.splice(posPhase,1);
  }

}
