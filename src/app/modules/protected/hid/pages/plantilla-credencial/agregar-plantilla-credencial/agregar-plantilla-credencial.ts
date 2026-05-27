import { Component, inject, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { IPlantillaCredencialRequest } from '../../../interfaces/plantilla-credencial.interface';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';

import { MessageService } from 'primeng/api';
import { PlantillaCredencialService } from '../../../services/plantilla-credencial.service';

import Swal from 'sweetalert2';
import { StorageService } from '../../../../../auth/services/storage.service';
import { filter, take } from 'rxjs';
import { IUsuarioAutenticado } from '../../../../../../modules/protected/authentication/interfaces/usuario.interface';

// Librería para redimensionar imágenes
import pica from 'pica';

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Component({
  selector: 'app-agregar-plantilla-credencial',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
    CardModule,
    FileUploadModule
  ],
  templateUrl: './agregar-plantilla-credencial.html',
  styleUrl: './agregar-plantilla-credencial.css',
  providers: [MessageService]
})
export class AgregarPlantillaCredencial {
  private srvMessage = inject(MessageService);
  private srvPlantillaCredencial = inject(PlantillaCredencialService);
  private srvStorage = inject(StorageService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;
  @Input() action!: string;

  @ViewChild('fondoUpload') fondoUpload!: FileUpload;
  @ViewChild('logoUpload') logoUpload!: FileUpload;

  @ViewChild('fileFondo') fileFondo!: ElementRef<HTMLInputElement>;

  abrirFondo() {
    this.fileFondo.nativeElement.click();
  }

  userData!: IUsuarioAutenticado;
  private fb = inject(FormBuilder);

  imagenFondoPreview: string | ArrayBuffer | null = null;
  imagenLogoPreview: string | ArrayBuffer | null = null;
  logoDimensions: { width: number; height: number } | null = null;

  miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    appleId: ['', [Validators.required, Validators.pattern(UUID_PATTERN)]],
    imagenFondo: [null, Validators.required],
    extensionImagenFondo: [null],
    imagenLogo: [null, Validators.required],
    extensionImagenLogo: [null]
  });

  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
      });
  }

  onFileSelected(event: any, tipo: 'fondo' | 'logo') {
    Swal.close();
    const file = event.files[0];
    if (!file) return;

    const validTypes = ['image/png'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Formato inválido',
        text: 'Solo se permiten PNG.',
        showConfirmButton: false,
        timer: 3000,
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    if (tipo === 'logo') {
      this.procesarLogo(file);
      return;
    }

    // Lógica para fondo (sin cambios)
    const reader = new FileReader();
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const maxWidth = 1456;
        const maxHeight = 928;

        // Validar que no exceda las dimensiones máximas
        if (w > maxWidth || h > maxHeight) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Dimensiones no permitidas',
            text: `La imagen de fondo no puede exceder ${maxWidth}×${maxHeight} píxeles. La tuya mide ${w}×${h} px.`,
            showConfirmButton: false,
            showCloseButton: true,
            allowOutsideClick: true,
            backdrop: false,
            timer: 5000,
            customClass: { popup: 'swal-theme' }
          });
          this.fondoUpload.clear();           // Limpia el componente de subida
          this.imagenFondoPreview = null;     // Quita la vista previa
          return;
        }

        // Procesamiento normal
        const base64 = base64WithPrefix.split(',')[1];
        this.miFormulario.patchValue({
          imagenFondo: base64,
          extensionImagenFondo: this.getExtension(file.name)
        });
        this.imagenFondoPreview = base64WithPrefix;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Imagen de fondo cargada',
          text: file.name,
          showConfirmButton: false,
          showCloseButton: true,
          allowOutsideClick: true,
          backdrop: false,
          timer: 5000,
          customClass: { popup: 'swal-theme' }
        });
      };
      img.onerror = () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Imagen de fondo es inválida',
          text: 'El archivo no es una imagen de fondo válida.',
          showConfirmButton: false,
          timer: 4000,
          customClass: { popup: 'swal-theme' }
        });
        this.fondoUpload.clear();
      };
      img.src = base64WithPrefix;
    };
    reader.readAsDataURL(file);
  }

  private procesarLogo(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        // Validar que sea cuadrada (relación de aspecto 1:1)
        if (w !== h) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Formato incorrecto',
            text: 'La imagen debe ser cuadrada (mismo ancho y alto).',
            showConfirmButton: false,
            timer: 3000,
            customClass: { popup: 'swal-theme' }
          });
          this.logoUpload.clear();
          return;
        }

        // Redimensionar a 200x200 usando pica
        const canvasOrigen = document.createElement('canvas');
        canvasOrigen.width = w;
        canvasOrigen.height = h;
        const ctx = canvasOrigen.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const canvasDestino = document.createElement('canvas');
        canvasDestino.width = 200;
        canvasDestino.height = 200;

        const picaInstance = pica();
        picaInstance.resize(canvasOrigen, canvasDestino)
          .then(() => {
            const resizedDataUrl = canvasDestino.toDataURL('image/png');
            const base64 = resizedDataUrl.split(',')[1];
            this.miFormulario.patchValue({
              imagenLogo: base64,
              extensionImagenLogo: 'png'
            });
            this.imagenLogoPreview = resizedDataUrl;
            this.logoDimensions = { width: 200, height: 200 };
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Logo redimensionado',
              text: 'Imagen redimensionada a 200×200 px.',
              showConfirmButton: false,
              timer: 2000
            });
          })
          .catch(() => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: 'Error al redimensionar',
              text: 'No se pudo procesar la imagen.',
              showConfirmButton: false,
              timer: 3000,
              customClass: { popup: 'swal-theme' }
            });
            this.logoUpload.clear();
          });
      };
      img.onerror = () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Imagen inválida',
          text: 'El archivo no es una imagen válida.',
          showConfirmButton: false,
          timer: 3000,
          customClass: { popup: 'swal-theme' }
        });
        this.logoUpload.clear();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  onClearImage(tipo: 'fondo' | 'logo') {
    if (tipo === 'fondo') {
      this.miFormulario.patchValue({ imagenFondo: null, extensionImagenFondo: null });
      this.imagenFondoPreview = null;
    } else {
      this.miFormulario.patchValue({ imagenLogo: null, extensionImagenLogo: null });
      this.imagenLogoPreview = null;
      this.logoDimensions = null;
    }

    this.miFormulario.get(tipo === 'fondo' ? 'imagenFondo' : 'imagenLogo')?.markAsTouched();
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  guardar(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Complete los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    const formValue = this.miFormulario.value;

    // Validación extra: el logo debe ser 200x200 (ya lo aseguramos al subir)
    if (formValue.imagenLogo) {
      if (!this.logoDimensions || this.logoDimensions.width !== 200 || this.logoDimensions.height !== 200) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Logo inválido',
          text: 'El logo debe medir exactamente 200×200 píxeles.',
          showConfirmButton: false,
          timer: 3000,
          customClass: { popup: 'swal-theme' }
        });
        return;
      }
    }

    const request = new IPlantillaCredencialRequest();
    request.nombre = formValue.nombre;
    request.imagenFondo = formValue.imagenFondo;
    request.extensionImagenFondo = formValue.extensionImagenFondo;
    request.imagenLogo = formValue.imagenLogo;
    request.extensionImagenLogo = formValue.extensionImagenLogo;
    request.usuarioCreadorId = this.userData.usuarioId;
    request.appleId = formValue.appleId;

    console.log('REQUEST ::: ', request);

    this.srvPlantillaCredencial.create(request).subscribe((data: any) => {
      if (data.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Plantilla creada', life: 3000 });
        this.miFormulario.reset();
        Swal.fire({
          title: '¡Éxito!',
          text: 'La plantilla ha sido registrada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: 'swal-theme' }
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardadoExitoso.emit({ creado: true });
            this.closeModal.emit();
          }
        });
      } else {
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la plantilla', life: 5000 });
      }
    });
  }

  cerrar(): void {
    this.closeModal.emit();
  }

  seleccionarFondo() {
    if (this.fondoUpload) {
      this.fondoUpload.choose();
    }
  }

  seleccionarLogo() {
    if (this.logoUpload) {
      this.logoUpload.choose();
    }
  }

  forzarCargaPrimeNG(uploader: FileUpload): void {
    if (uploader) {
      const inputNativo = uploader.basicFileInput?.nativeElement;
      if (inputNativo) {
        inputNativo.click();
      }
    }
  }
}