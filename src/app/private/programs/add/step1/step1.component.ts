import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProgramsAddService } from '../programsadd.service';
import { DateConverterService } from '../../../../util/util.date.converter.service';
import { Program } from '../../../models/program.model';
import { Router } from '@angular/router';
import {isNumber} from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  selector: 'esm-step1',
  templateUrl: './step1.component.html'
})
export class Step1Component implements OnInit {

  programInformationForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    description: [''],
    isPublic: [false],
    beginDate: ['', [Validators.required]],
    beginTime: [{ hour: 10, minute: 0, second: 0 }],
    endDate: [null],
    endTime: [null]
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

  /**
   * Sets programInformationForm according to the passed program
   * @param program -
   */
  setProgram(program: Program) {
    if (!program || program.getId() === -1)
      return;

    const utcStarts = Number.parseInt(program.getStarts());
    const utcEnds = Number.parseInt(program.getEnds());

    let starts: Date;
    let ends: Date;

    if (!isNaN(utcStarts)) starts = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.getStarts()));
    if (!isNaN(utcEnds)) ends = this.dateConverterService.fromUnixTimeStamp(Number.parseInt(program.getEnds()));

    this.programInformationForm = this.formBuilder.group({
      title: [program.getTitle(), [Validators.required]],
      description: [program.getDescription()],
      isPublic: [program.getIsPublic()],
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
    this.programAddService.getProgramObservable().subscribe((programInstance: Program) => this.setProgram(programInstance));
  }

  submit(): void {
    if (this.programInformationForm.valid) {
      const dirtyProps: any = {};
      let hasDirtyProp = false;

      for (const prop in this.programInformationForm.controls)
        if (this.programInformationForm.get(prop).dirty) {
          if (prop === 'beginDate' || prop === 'beginTime') dirtyProps.starts = this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('beginDate').value, this.programInformationForm.get('beginTime').value);
          else if (prop === 'endDate' || prop === 'endTime') dirtyProps.ends = this.dateConverterService.toUnixTimeStamp(this.programInformationForm.get('endDate').value, this.programInformationForm.get('endTime').value);
          else dirtyProps[prop] = this.programInformationForm.get(prop).value;

          hasDirtyProp = true;
        }

      // Checks if programs is not empty
      if (hasDirtyProp)
        this.programAddService.saveStep(dirtyProps);
      this.router.navigate([this.router.url.substring(0, this.router.url.lastIndexOf('/')) + '/second']).then();
    } else this.programInformationForm.markAllAsTouched();
  }
}
