import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'esm-program-historic',
  templateUrl: './program-historic.component.html'
})
export class ProgramHistoricComponent implements OnInit {

  status: boolean = true;
 /**
  * https://therichpost.com/how-to-make-simple-sidebar-template-with-bootstrap-4-and-angular-9/
  */
  
  clickEvent(){
      this.status = !this.status;       
  }

  constructor() { }

  ngOnInit(): void {
  }

}
