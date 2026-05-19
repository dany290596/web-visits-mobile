import { Component, EventEmitter, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';

import Swal from 'sweetalert2';

import { MessageService } from 'primeng/api';
import { UsuarioHIDService } from '../../../services/usuario-hid.service';

import { IUsuarioHIDRequest } from '../../../interfaces/usuario-hid.interface';

import { AutocLicenciaHid } from '../../../components/autoc/autoc-licencia-hid/autoc-licencia-hid';
import { StorageService } from '../../../../../auth/services/storage.service';
import { IUsuarioResponse } from '../../../../authentication/interfaces/usuario.interface';

import { MselectTipoCredencialHid } from '../../../components/mselect/mselect-tipo-credencial-hid/mselect-tipo-credencial-hid';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';

interface LicenciaOption {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-agregar-usuario-hid',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
    DatePickerModule,
    AutocLicenciaHid,
    MselectTipoCredencialHid,
    FileUploadModule
  ],
  templateUrl: './agregar-usuario-hid.html',
  styleUrl: './agregar-usuario-hid.css',
  providers: [MessageService]
})
export class AgregarUsuarioHid implements OnInit {
  user: IUsuarioResponse | undefined;
  userId: string = '';

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<void>();

  imagenPreview: string | ArrayBuffer | null = null;

  @ViewChild('fondoUpload') fondoUpload!: FileUpload;

  private fb = inject(FormBuilder);
  private srvUsuarioHid = inject(UsuarioHIDService);
  private srvMessage = inject(MessageService);
  private srvStorage = inject(StorageService);

  currentDate = new Date();
  licencias: LicenciaOption[] = [];
  formSubmitted = false;

  form: FormGroup = this.fb.group({
    licenciaId: ['', Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apellidos: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    usuarioHidTipoCredencial: ['', Validators.required],
    imagen: [null],
    extensionImagen: [null],
  });

  ngOnInit(): void {
    if (this.srvStorage.getUserDetailData() !== undefined && this.srvStorage.getUserDetailData() !== null) {
      this.user = this.srvStorage.getUserDetailData()!;
      this.userId = this.user.id!;
    }
  }

  onClearImage(tipo: 'fondo' | 'logo') {
    if (tipo === 'fondo') {
      this.form.patchValue({ imagen: null, extensionImagen: null });
      this.imagenPreview = null;
    }
  }

  forzarCargaPrimeNG(uploader: FileUpload): void {
    if (uploader) {
      // Rompemos la limitación de PrimeNG accediendo directamente a la propiedad nativa del input del navegador
      const inputNativo = uploader.basicFileInput?.nativeElement;

      if (inputNativo) {
        inputNativo.click(); // Dispara el explorador del S.O de forma obligatoria
      }
    }
  }

  onFileSelected(event: any, tipo: 'foto') {
    const file = event.files[0];
    if (!file) return;

    // Validar tipo de imagen profesional
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Formato inválido',
        text: 'Solo se permiten JPEG, PNG, WEBP o SVG',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const base64 = base64WithPrefix.split(',')[1];
      if (tipo === 'foto') {
        this.form.patchValue({
          imagen: base64,
          extensionImagen: this.getExtension(file.name)
        });
        this.imagenPreview = base64WithPrefix;
      } else {
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Imagen cargada',
        text: file.name,
        showConfirmButton: false,
        timer: 2000,
        customClass: {
          popup: 'swal-theme',
        }
      });
    };
    reader.readAsDataURL(file);
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  isInvalid(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.hasError(errorType) && (control.touched || this.formSubmitted);
  }

  filtrarTelefono(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); // solo números
    if (valor.length > 10) {
      valor = valor.substring(0, 10);
    }
    input.value = valor;
    this.form.get('telefono')?.setValue(valor, { emitEvent: true });
  }

  guardar(): void {
    this.formSubmitted = true;
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios correctamente.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    const formValue = this.form.value;
    const request = new IUsuarioHIDRequest();

    request.licenciaId = formValue.licenciaId;
    request.nombre = formValue.nombre;
    request.apellidos = formValue.apellidos;
    request.email = formValue.email;
    request.telefono = formValue.telefono;
    request.fechaInicio = formValue.fechaInicio;
    request.fechaFin = formValue.fechaFin;

    request.imagen = formValue.imagen;
    request.extensionImagen = formValue.extensionImagen;

    request.usuarioCreadorId = this.userId;

    if (formValue.usuarioHidTipoCredencial !== null) {
      if (
        Array.isArray(formValue.usuarioHidTipoCredencial) &&
        formValue.usuarioHidTipoCredencial.every((x: any) => typeof x === 'string')
      ) {
        request.usuarioHidTipoCredencial =
          formValue.usuarioHidTipoCredencial.map((id: string) => ({
            tipoCredencialId: id
          }));
      }
    }

    console.log("REQUEST ::: ", request);

    this.srvUsuarioHid.create(request).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario HID creado', life: 3000 });
        this.form.reset();
        this.formSubmitted = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'El usuario HID ha sido registrado.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: 'swal-theme' }
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardadoExitoso.emit();
            this.closeModal.emit();
          }
        });
      } else {
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear', life: 5000 });
      }
    });
  }

  cerrar(): void {
    this.closeModal.emit();
  }
}