import { Component, inject, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  selector: 'app-editar-plantilla-credencial',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
    CardModule,
    FileUploadModule
  ],
  templateUrl: './editar-plantilla-credencial.html',
  styleUrl: './editar-plantilla-credencial.css',
  providers: [MessageService]
})
export class EditarPlantillaCredencial {
  private srvMessage = inject(MessageService);
  private srvPlantillaCredencial = inject(PlantillaCredencialService);
  private srvStorage = inject(StorageService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>(); // para refrescar la tabla
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

    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvPlantillaCredencial.getById(this.id).subscribe((data: any) => {
        if (data.respuesta === true) {

          const plantilla = data.data;

          // console.log("PLANTILLA ::: ", plantilla);

          // --- Previsualizaciones ---
          this.imagenFondoPreview = plantilla.imagenFondoBase64 || null;
          this.imagenLogoPreview = plantilla.imagenLogoBase64 || null;

          // --- Formulario ---
          // En los campos de imagen guardamos el NOMBRE DE ARCHIVO existente,
          // NO el Base64, para que el backend entienda que no se cambió la imagen.
          this.miFormulario.patchValue({
            nombre: plantilla.nombre,
            appleId: plantilla.appleId,
            imagenFondo: plantilla.imagenFondo === 'Sin foto' ? null : plantilla.imagenFondo,
            extensionImagenFondo: plantilla.imagenFondo === 'Sin foto' ? null : plantilla.extensionImagenFondo,
            imagenLogo: plantilla.imagenLogo === 'Sin foto' ? null : plantilla.imagenLogo,
            extensionImagenLogo: plantilla.imagenLogo === 'Sin foto' ? null : plantilla.extensionImagenLogo,
          });
        }
      });
    }
  }

  onFileSelected(event: any, tipo: 'fondo' | 'logo') {
    const file = event.files[0];
    if (!file) return;

    // Validar tipo de imagen profesional
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

    const reader = new FileReader();
    reader.onload = () => {
      const base64WithPrefix = reader.result as string;
      const base64 = base64WithPrefix.split(',')[1];
      if (tipo === 'fondo') {
        this.miFormulario.patchValue({
          imagenFondo: base64,
          extensionImagenFondo: this.getExtension(file.name)
        });
        this.imagenFondoPreview = base64WithPrefix;
      } else {
        this.miFormulario.patchValue({
          imagenLogo: base64,
          extensionImagenLogo: this.getExtension(file.name)
        });
        this.imagenLogoPreview = base64WithPrefix;
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Imagen cargada',
        text: file.name,
        showConfirmButton: false,
        timer: 2000,
        customClass: { popup: 'swal-theme' }
      });
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
      this.miFormulario.get('imagenFondo')?.markAsTouched();
      this.miFormulario.get('extensionImagenFondo')?.markAsTouched();
      this.imagenFondoPreview = null;
    } else {
      this.miFormulario.patchValue({ imagenLogo: null, extensionImagenLogo: null });
      this.miFormulario.get('imagenLogo')?.markAsTouched();
      this.miFormulario.get('extensionImagenLogo')?.markAsTouched();
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

      // Mensaje específico si faltan imágenes
      const errors = [];
      if (this.miFormulario.get('imagenFondo')?.hasError('required')) {
        errors.push('Imagen de fondo');
      }
      if (this.miFormulario.get('imagenLogo')?.hasError('required')) {
        errors.push('Logo');
      }
      const mensaje = errors.length
        ? `Las siguientes imágenes son requeridas: ${errors.join(', ')}`
        : 'Complete todos los campos obligatorios.';

      Swal.fire({
        title: '¡Advertencia!',
        text: mensaje,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    const formValue = this.miFormulario.value;

    // Validación extra: el logo debe ser 200x200 (ya lo aseguramos al subir)
    if (formValue.imagenLogo && this.logoDimensions) {
      if (this.logoDimensions.width !== 200 || this.logoDimensions.height !== 200) {
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

    console.log("REQUEST ::: ", request);

    this.srvPlantillaCredencial.update(request, this.id).subscribe((data: any) => {
      if (data.respuesta === true) {

        this.miFormulario.reset();

        Swal.fire({
          title: '¡Éxito!',
          text: 'La plantilla ha sido actualizada correctamente.',
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
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el perfil', life: 5000 });
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
      // Rompemos la limitación de PrimeNG accediendo directamente a la propiedad nativa del input del navegador
      const inputNativo = uploader.basicFileInput?.nativeElement;

      if (inputNativo) {
        inputNativo.click(); // Dispara el explorador del S.O de forma obligatoria
      }
    }
  }
}