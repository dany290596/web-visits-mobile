import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
import { PlataformaService } from '../../../../../../shared/services/plataforma.service';
import { UsuarioService } from '../../../services/usuario.service';

import { AutocPerfil } from '../../../components/autoc/autoc-perfil/autoc-perfil';
import { AutocTipoUsuario } from '../../../components/autoc/autoc-tipo-usuario/autoc-tipo-usuario';

@Component({
  selector: 'app-agregar-usuario',
  standalone: true,
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
  templateUrl: './agregar-usuario.html',
  styleUrl: './agregar-usuario.css',
  providers: [MessageService]
})
export class AgregarUsuario {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<void>(); // para refrescar tabla
  @Input() id!: string;
  @Input() nombre!: string;

  private fb = inject(FormBuilder);
  private srvUsuario = inject(UsuarioService);
  private srvPlataforma = inject(PlataformaService);
  private srvMessage = inject(MessageService);

  formSubmitted = false;
  showPasswordExamples = false;
  passwordExamples: string[] = [];
  currentDate = new Date();

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]).{8,255}$/;

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(8), Validators.maxLength(150)]],
    contrasena: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern(this.passwordRegex)]],
    contrasenavalidacion: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern(this.passwordRegex)]],
    perfilId: ['', Validators.required],
    tipoUsuarioId: ['', Validators.required],
    vence: [false],
    fechaVencimiento: ['']
  }, {
    validators: [
      this.passwordsIgualesValidator,
      this.validarFechaVencimientoSiVence
    ]
  });

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvUsuario.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          console.log(s);
          this.form.controls['email'].setValue(s.data.correo);
          this.form.controls['contrasena'].setValue("*********");
          this.form.controls['contrasenavalidacion'].setValue("*********");
          this.form.controls['perfilId'].setValue(s.data.perfilId);
          this.form.controls['tipoUsuarioId'].setValue(s.data.tipoUsuarioId);
          this.form.controls['vence'].setValue(false);
        }
      });
    }
  }

  passwordsIgualesValidator(group: FormGroup) {
    const pass = group.get('contrasena')?.value;
    const confirm = group.get('contrasenavalidacion')?.value;
    return pass === confirm ? null : { noCoincide: true };
  }

  validarFechaVencimientoSiVence(group: FormGroup) {
    const vence = group.get('vence')?.value;
    const fecha = group.get('fechaVencimiento')?.value;
    if (vence && !fecha) {
      return { fechaVencimientoRequerida: true };
    }
    return null;
  }

  isInvalid(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.hasError(errorType) && (control.touched || this.formSubmitted);
  }

  onToggleVence(event: any) {
    if (!event.checked) {
      this.form.get('fechaVencimiento')?.setValue('');
    }
  }

  onPasswordFocus() {
    this.passwordExamples = this.generatePasswordExamples(5);
    this.showPasswordExamples = true;
  }

  onPasswordBlur() {
    setTimeout(() => { this.showPasswordExamples = false; }, 200);
  }

  selectPasswordExample(example: string) {
    this.form.get('contrasena')?.setValue(example);
    this.form.get('contrasenavalidacion')?.setValue(example);
    this.showPasswordExamples = false;
  }

  guardar() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    const formValue = this.form.value;
    const request = new IUsuarioRequest();
    request.correo = formValue.email;
    request.contrasena = formValue.contrasena;
    request.perfilId = formValue.perfilId;
    request.tipoUsuarioId = formValue.tipoUsuarioId;
    request.idioma = "";
    request.vence = formValue.vence ? 1 : 2;
    request.fechaVencimiento = formValue.fechaVencimiento
      ? formValue.fechaVencimiento
      : null;
    console.log("REQUEST ::: ", request);
    this.srvUsuario.create(request).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
        this.form.reset();
        this.formSubmitted = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'El usuario ha sido registrado.',
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
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear', life: 5000 });
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
}