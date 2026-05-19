import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';

import Swal from 'sweetalert2';

import { IUsuarioRequest } from '../../../interfaces/usuario.interface';

import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../../services/usuario.service';

import { AutocPerfil } from '../../../components/autoc/autoc-perfil/autoc-perfil';
import { AutocTipoUsuario } from '../../../components/autoc/autoc-tipo-usuario/autoc-tipo-usuario';

@Component({
  selector: 'app-editar-usuario',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TooltipModule,
    ToggleSwitchModule,
    DatePickerModule,
    ChipModule,
    AutocPerfil,
    AutocTipoUsuario
  ],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css',
  providers: [MessageService]
})
export class EditarUsuario {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<void>(); // para refrescar tabla
  @Input() id!: string;
  @Input() nombre!: string;

  private fb = inject(FormBuilder);
  private srvUsuario = inject(UsuarioService);
  private srvMessage = inject(MessageService);

  formSubmitted = false;
  showPasswordExamples = false;
  passwordExamples: string[] = [];
  currentDate = new Date();

  passwordTouched: boolean = false;
  confirmPasswordTouched: boolean = false;

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]).{8,255}$/;

  form: FormGroup = this.fb.group({
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.minLength(8),
      Validators.maxLength(150)
    ]],
    contrasena: ['', [
      this.conditionalPasswordValidator()
    ]
    ],
    contrasenavalidacion: ['', [
      this.conditionalConfirmPasswordValidator()
    ]],
    perfilId: ['', Validators.required],
    tipoUsuarioId: ['', Validators.required],
    idAsociado: ['', Validators.required],
    vence: [false],
    fechaVencimiento: ['']
  }, {
    validators: [
      this.conditionalPasswordsIgualesValidator.bind(this),
      this.validarFechaVencimientoSiVence.bind(this)
    ]
  });

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvUsuario.getById(this.id).subscribe((data: any) => {
        if (data.respuesta === true) {


          let usuario: any = data.data;
          console.log("USUARIO ::: ", usuario);
          this.form.controls['email'].setValue(usuario.correo);
          this.form.controls['contrasena'].reset();
          this.form.controls['contrasenavalidacion'].reset();
          this.form.controls['perfilId'].setValue(usuario.perfilId);
          this.form.controls['tipoUsuarioId'].setValue(usuario.tipoUsuarioId);
          this.form.controls['idAsociado'].setValue(usuario.idAsociado);
          this.form.controls['vence'].setValue(usuario.vence === 2 ? false : true);
          this.form.controls['fechaVencimiento'].setValue(
            usuario.fechaVencimiento ? new Date(usuario.fechaVencimiento) : ''
          );
        }
      });
    }
  }



  conditionalPasswordsIgualesValidator(form: FormGroup) {
    if (!this.passwordTouched && !this.confirmPasswordTouched) {
      return null; // No validar si ningún campo de contraseña ha sido tocado
    }

    const pass = form.get('contrasena')?.value;
    const confirm = form.get('contrasenavalidacion')?.value;

    // Solo validar si al menos un campo tiene valor
    if (pass || confirm) {
      return pass === confirm ? null : { noCoincide: true };
    }

    return null;
  }

  validarFechaVencimientoSiVence(form: FormGroup): ValidationErrors | null {
    const vence = form.get('vence')?.value;
    const fechaVencimiento = form.get('fechaVencimiento')?.value;

    if (vence) {
      // Validar que la fecha no sea vacía
      if (!fechaVencimiento) {
        return { fechaVencimientoRequerida: true };
      }

      // Validar que la fecha no sea anterior a la actual
      const fechaSeleccionada = new Date(fechaVencimiento);
      const fechaActual = new Date();

      // Resetear las horas para comparar solo fechas (sin horas/minutos/segundos)
      fechaSeleccionada.setHours(0, 0, 0, 0);
      fechaActual.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < fechaActual) {
        return { fechaVencimientoAnterior: true };
      }
    }

    return null;
  }

  isInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control?.invalid && (control.touched);
  }

  onToggleVence(event: any) {
    if (!event.checked) {
      this.form.get('fechaVencimiento')?.setValue('');
    }
  }

  onPasswordFocus() {
    this.passwordTouched = true;
    this.updatePasswordValidators();
  }



  guardar() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.errors?.['fechaVencimientoAnterior']) {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'La fecha de vencimiento no puede ser anterior a la fecha actual.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal-theme',
          }
        });


      }

      if (this.form.errors?.['fechaVencimientoRequerida']) {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'Debe seleccionar una fecha de vencimiento cuando el campo "Vence" está activo.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          customClass: {
            popup: 'swal-theme',
          }
        });


      }

      return;
    }

    const formValue = this.form.value;
    const request = new IUsuarioRequest();
    request.correo = formValue.email;
    if (this.passwordTouched && formValue.contrasena) {
      request.contrasena = formValue.contrasena;
    } else {
      request.contrasena = ""; // Enviar vacío para no cambiar la contraseña
    }
    request.perfilId = formValue.perfilId;
    request.tipoUsuarioId = formValue.tipoUsuarioId;
    request.idAsociado = formValue.idAsociado;
    request.idioma = "";
    request.vence = formValue.vence ? 1 : 2;
    request.fechaVencimiento = formValue.fechaVencimiento
      ? formValue.fechaVencimiento
      : null;
    console.log("REQUEST ::: ", request);
    this.srvUsuario.update(request, this.id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
        this.form.reset();
        this.formSubmitted = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'La operación se realizó con éxito. El usuario ha sido actualizado.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          customClass: { popup: 'swal-theme' }
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardadoExitoso.emit(); // indica al padre que refresque
            this.closeModal.emit();      // cierra el modal
          }
        });
      } else {
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar', life: 5000 });
      }
    });
  }

  cerrar() {
    this.closeModal.emit();
  }

  // Métodos de generación de contraseñas (iguales que en UsuarioNuevo)
  generatePasswordExamples(count: number = 4): string[] {
    const examples = [];
    for (let i = 0; i < count; i++) {
      examples.push(this.generateRandomPassword());
    }
    return examples;
  }

  generateRandomPassword(): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+[]{};:.,?~-';
    const all = lower + upper + digits + special;
    let password = '';
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];
    const length = 8 + Math.floor(Math.random() * 5);
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  // Validador condicional para contraseña
  conditionalPasswordValidator() {
    return (control: any) => {
      if (!this.passwordTouched) {
        return null; // No validar si no se ha tocado el campo
      }

      const value = control.value || '';

      // Si el campo está vacío
      if (!value) {
        return { required: true };
      }

      // Verificar longitud mínima
      if (value.length < 8) {
        return { minlength: { requiredLength: 8, actualLength: value.length } };
      }

      // Verificar longitud máxima
      if (value.length > 255) {
        return { maxlength: { requiredLength: 255, actualLength: value.length } };
      }

      // Verificar patrón (solo si pasa las validaciones de longitud)
      if (!this.passwordRegex.test(value)) {
        return { pattern: true };
      }

      return null;
    };
  }

  // Validador condicional para confirmación de contraseña
  conditionalConfirmPasswordValidator() {
    return (control: any) => {
      if (!this.confirmPasswordTouched) {
        return null; // No validar si no se ha tocado el campo
      }

      const value = control.value || '';

      // Si el campo está vacío
      if (!value) {
        return { required: true };
      }

      // Verificar longitud mínima
      if (value.length < 8) {
        return { minlength: { requiredLength: 8, actualLength: value.length } };
      }

      // Verificar longitud máxima
      if (value.length > 255) {
        return { maxlength: { requiredLength: 255, actualLength: value.length } };
      }

      // Verificar patrón (solo si pasa las validaciones de longitud)
      if (!this.passwordRegex.test(value)) {
        return { pattern: true };
      }

      return null;
    };
  }

  updatePasswordValidators() {
    this.form.get('contrasena')?.setValidators([this.conditionalPasswordValidator()]);
    this.form.get('contrasenavalidacion')?.setValidators([this.conditionalConfirmPasswordValidator()]);

    this.form.get('contrasena')?.updateValueAndValidity();
    this.form.get('contrasenavalidacion')?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  onConfirmPasswordFocus() {
    this.confirmPasswordTouched = true;
    this.updatePasswordValidators();
  }
}