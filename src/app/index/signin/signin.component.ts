import { Component, OnInit, ViewChild } from '@angular/core';
import { ESPIM_REST_Observers } from 'src/app/app.api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DateConverterService } from 'src/app/util/util.date.converter.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ObserversService } from 'src/app/private/observers/observers.service';
import { LoginService } from 'src/app/security/login/login.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'esm-signin',
  templateUrl: './signin.component.html'
})
export class SigninComponent implements OnInit {

  urlObservers: string = ESPIM_REST_Observers;
  observerForm!: FormGroup;

  constructor(private loginService: LoginService, private observerService: ObserversService, private formBuilder: FormBuilder, private daoService: DAOService, private dateConverterService: DateConverterService, private router: Router) { }

  ngOnInit() {
    this.observerForm = this.formBuilder.group({
      name: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      phoneNumber: this.formBuilder.control('', [Validators.required]),
      role: this.formBuilder.control('', [Validators.required]),
      about: this.formBuilder.control('', [Validators.required]),
      birthDate: this.formBuilder.control('', [Validators.required]),
      schooling: this.formBuilder.control('', [Validators.required]),
      institution: this.formBuilder.control('', [Validators.required]),
      // form elements for observer's address
      address: this.formBuilder.group({
        address: this.formBuilder.control('', [Validators.required]),
        addressNumber: this.formBuilder.control('', [Validators.required]),
        addressComplement: this.formBuilder.control('', [Validators.required]),
        cep: this.formBuilder.control('', [Validators.required]),
        state: this.formBuilder.control('', [Validators.required]),
        city: this.formBuilder.control('', [Validators.required]),
        country: this.formBuilder.control('', [Validators.required])
      })
    });
  }

  save(event : any) {
    // converter data aqui senão vai dar problema de formato aceito pelo backend
    this.observerForm.value.birthDate = this.dateConverterService.toString(this.observerForm.value.birthDate);
    this.daoService.postObject(this.urlObservers, this.observerForm.value).subscribe(response => {
      Swal.fire('Observador registrado!','Observador registrado com sucesso!','success');
      this.router.navigate(['/private']);
    });
  }

}
