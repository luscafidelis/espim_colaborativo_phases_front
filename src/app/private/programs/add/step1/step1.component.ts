import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramsAddService } from '../programsadd.service';
import { DateConverterService } from '../../../../util/util.date.converter.service';
import { Program } from '../../../models/program.model';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import {isNumber} from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  selector: 'esm-step1',
  templateUrl: './step1.component.html'
})
export class Step1Component implements OnInit, OnDestroy {

  subSink = new SubSink();
  
  programInformationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
    isPublic: [false],
    beginDate: ['', [Validators.required]],
    beginTime: [{ hour: 0, minute: 0, second: 0 }],
    endDate: [null],
    endTime: [{ hour: 0, minute: 0, second: 0 }]
  });

  get invalidTitle() {
    const form = this.programInformationForm.get('title');
    return !form.valid && form.touched;
  }
  get invalidBeginDate() {
    const form = this.programInformationForm.get('beginDate');
    return !form.valid && form.touched;
  }

  constructor(private programAddService: ProgramsAddService, private formBuilder: FormBuilder, private router: Router, private dateConverterService: DateConverterService) {}
  
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * Sets programInformationForm according to the passed program
   * @param program -
   */
  setProgram(program: Program) {
    console.log('Setou o programa ' , program);
    if (!program)
      return;

    const utcStarts = Number.parseInt(program.starts);
    const utcEnds = Number.parseInt(program.ends);

    let starts: Date;
    let ends: Date;

    if (!isNaN(utcStarts)) starts = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.starts));
    if (!isNaN(utcEnds)) ends = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.ends));

    this.programInformationForm = this.formBuilder.group({
      title: [program.title, [Validators.required]],
      description: [program.description],
      isPublic: [program.isPublic],
      beginDate: [starts !== undefined ? this.dateConverterService.toNgbDate(starts) : null, [Validators.required]],
      beginTime: [starts !== undefined ? this.dateConverterService.toNgbTime(starts) : null],
      endDate: [ends !== undefined ? this.dateConverterService.toNgbDate(ends) : null],
      endTime: [ends !== undefined ? this.dateConverterService.toNgbTime(ends) : null]
    });
  }

  ngOnInit() {
    /**
     * Gets program and set form
     */
    const program = this.programAddService.program;
    this.setProgram(program);

    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.subSink.sink = this.programAddService.getProgramObservable().subscribe((programInstance: Program) => this.setProgram(programInstance));
  }

  //Atualiza os campos no banco quando são alterados
  updateField(field : string){
    let obj = {};
    if (field == 'starts') {
      obj['starts'] = this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('beginDate').value, this.programInformationForm.get('beginTime').value);
    } else {
      if (field == 'ends') {
        obj['ends'] = this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('endDate').value, this.programInformationForm.get('endTime').value);        
      } else {
        obj[field] = this.programInformationForm.get(field).value;
      }
    }
    this.programAddService.saveStep(obj);
  }

  submit(): void {
    if (this.programInformationForm.valid) {
        this.router.navigate([this.router.url.substring(0, this.router.url.lastIndexOf('/')) + '/second']).then();
    } else {
      this.programInformationForm.markAllAsTouched();
    }
  }
}

export interface corpo_program{
  id: number;
  title: string;
  description: string;
  starts: string;
  ends: string;
  hasPhases: boolean;
  isPublic: boolean;
  beingEdited: boolean;
  beingDuplicated: boolean;
}


/**
 *       let hasDirtyProp = false;

      for (const prop in this.programInformationForm.controls){
        if (this.programInformationForm.get(prop).dirty) {
          hasDirtyProp = true;
        }
      }
      
      // Checks if programs is not empty
      if (hasDirtyProp)
        //Caso seja a primeira vez que está salvando o programa..
        if(this.programAddService.program.id == -1){
          this.programAddService.program.title=this.programInformationForm.get('title').value;
          this.programAddService.program.description=this.programInformationForm.get('description').value;
          this.programAddService.program.starts=this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('beginDate').value, this.programInformationForm.get('beginTime').value);
          this.programAddService.program.ends=this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('endDate').value, this.programInformationForm.get('endTime').value);
          this.programAddService.program.hasPhases=false;
          this.programAddService.program.isPublic=this.programInformationForm.get('isPublic').value;
          //Salva os dados no banco
          this.programAddService.saveStep();

        } else {
          //Foi definido como corpo por causa da possibilidade de patch
          let corpo : corpo_program = {
            id : undefined,
            title:this.programInformationForm.get('title').value,
            description:this.programInformationForm.get('description').value,
            starts:this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('beginDate').value, this.programInformationForm.get('beginTime').value),
            ends:this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('endDate').value, this.programInformationForm.get('endTime').value),
            hasPhases:false,
            isPublic:this.programInformationForm.get('isPublic').value,
            beingEdited: false,
            beingDuplicated: false
          }
          this.programAddService.saveStep(corpo);
        }  

 * 
 */