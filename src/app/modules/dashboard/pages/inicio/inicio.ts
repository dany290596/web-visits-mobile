import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { filter, take } from 'rxjs';

import { SesionService } from '../../../protected/authentication/services/sesion.service';
import { StorageService } from '../../../auth/services/storage.service';
import { UsuarioService } from '../../../protected/authentication/services/usuario.service';

import { IUsuarioAutenticado } from '../../../protected/authentication/interfaces/usuario.interface';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-inicio',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TooltipModule,
    ToggleSwitchModule,
    DatePickerModule,
    ChipModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
  providers: [MessageService]
})
export class Inicio {
  private srvSesion = inject(SesionService);
  private srvStorage = inject(StorageService);
  private srvForm = inject(FormBuilder);
  private srvUsuario = inject(UsuarioService);

  userData!: IUsuarioAutenticado;

  PrimeraConexion: boolean = false;
  CambiarContrasena: boolean = false;
  errorCorreo: boolean = false;

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]).{8,255}$/;

  FormularioContrasena: FormGroup = this.srvForm.group({
    contrasena: ['',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(255),
        Validators.pattern(this.passwordRegex)
      ],
    ],
    contrasenavalidacion: ['',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(255),
        Validators.pattern(this.passwordRegex)
      ],
    ]
  }, {
    validators: [
      this.passwordsIgualesValidator
    ]
  });

  ngOnInit() {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
        this.srvSesion.getVerifyFirstConnection(this.userData.usuarioId!).subscribe((s: any) => {
          if (s.respuesta === true) {
            this.PrimeraConexion = s.data;
          }
        }
        );
      });
  }

  passwordsIgualesValidator(form: FormGroup) {
    const pass = form.get('contrasena')?.value;
    const confirm = form.get('contrasenavalidacion')?.value;
    return pass === confirm ? null : { noCoincide: true };
  }

  isPasswordValid(): boolean {
    const pass = this.FormularioContrasena.get('contrasena')?.value;
    const confirm = this.FormularioContrasena.get('contrasenavalidacion')?.value;
    return this.hasMinLength() && this.hasUpperCase() && this.hasLowerCase() && this.hasNumber() && pass === confirm;
  }

  hasMinLength(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return value.length >= 8;
  }

  hasUpperCase(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[A-Z]/.test(value);
  }

  hasLowerCase(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[a-z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[0-9]/.test(value);
  }

  cambiarContraForm() {
    if (!this.FormularioContrasena.valid || !this.isPasswordValid()) {
      // Swal.fire('¡Advertencia!', 'Por favor completa todos los campos correctamente.', 'warning');
      return;
    }

    let nuevaContrasena = {
      contrasena: this.FormularioContrasena.value.contrasena
    };
    this.srvUsuario.CambiarContrasena(nuevaContrasena).subscribe(async (res: any) => {
      if (res) {
        this.PrimeraConexion = false;
        var alert = (await
          Swal.fire({
            title: 'Exito',
            text: 'Se cambió la contraseña del usuario correctamente.',
            icon: 'success',
            customClass: {
              popup: 'swal-theme',
            }
          })).isConfirmed;
        if (alert) {
        }
      } else {
        this.errorCorreo = false;
      }
    });
  }
}