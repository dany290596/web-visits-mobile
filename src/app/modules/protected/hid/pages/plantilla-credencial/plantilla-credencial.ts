import { Component, effect, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';

import { AgregarPlantillaCredencial } from './agregar-plantilla-credencial/agregar-plantilla-credencial';
import { DetallePlantillaCredencial } from './detalle-plantilla-credencial/detalle-plantilla-credencial';
import { EditarPlantillaCredencial } from './editar-plantilla-credencial/editar-plantilla-credencial';
import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

import { StorageService } from '../../../../auth/services/storage.service';
import { PermisoService } from '../../../authentication/services/permiso.service';
import { PlantillaCredencialService } from '../../services/plantilla-credencial.service';
import { ModalService } from '../../../../../shared/services/modal.service';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';
import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';
import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';

import { IPlantillaCredencialRequest } from '../../interfaces/plantilla-credencial.interface';

import Swal from 'sweetalert2';

// Librería para redimensionar imágenes
import pica from 'pica';

const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

@Component({
  selector: 'app-plantilla-credencial',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    MessageModule,
    FileUploadModule
  ],
  templateUrl: './plantilla-credencial.html',
  styleUrl: './plantilla-credencial.css',
  providers: [MessageService]
})
export class PlantillaCredencial implements OnInit {
  idSection: string = "5EB4575C-4588-4CD4-A6A3-3F15978A4F93";
  permission: IPermisoDetalle | undefined;

  private srvPlantillaCredencial = inject(PlantillaCredencialService);
  private srvForm = inject(FormBuilder);
  private srvModal = inject(ModalService);
  private srvStorage = inject(StorageService);
  private srvPermiso = inject(PermisoService);

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  userData!: IUsuarioAutenticado;
  template!: any;

  buscarFG: FormGroup = this.srvForm.group({
    nombre: [''],
    estado: [''],
  });

  /** ACTUALIZAR PLANTILLA - TIPO USUARIO - USUARIO FINAL HID */
  @ViewChild('fondoUpload') fondoUpload!: FileUpload;
  @ViewChild('logoUpload') logoUpload!: FileUpload;
  @ViewChild('fileFondo') fileFondo!: ElementRef<HTMLInputElement>;

  abrirFondo() {
    this.fileFondo.nativeElement.click();
  }

  imagenFondoPreview: string | ArrayBuffer | null = null;
  imagenLogoPreview: string | ArrayBuffer | null = null;
  logoDimensions: { width: number; height: number } | null = null;

  miFormulario: FormGroup = this.srvForm.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    appleId: ['', [Validators.required, Validators.pattern(UUID_PATTERN)]],
    imagenFondo: [null, Validators.required],
    extensionImagenFondo: [null],
    imagenLogo: [null, Validators.required],
    extensionImagenLogo: [null]
  });
  /** ACTUALIZAR PLANTILLA - TIPO USUARIO - USUARIO FINAL HID */

  constructor() {
    effect(() => {
      this.permission = this.srvPermiso.getDetallePermiso(this.idSection);
      // console.log("SECCIÓN ::: ", this.permission);
    });
  }

  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
        // console.log("USER ::: ", this.userData);
        this.buscar(true);
        this.prepararTablaResultados();

        if (this.userData.empresaId !== undefined && this.userData.empresaId !== null && this.userData.empresaId !== "") {
          this.srvPlantillaCredencial.getByCompany(this.userData.empresaId).subscribe((data: any) => {
            if (data.respuesta === true) {

              this.template = data.data;

              // console.log("PLANTILLA ::: ", plantilla);

              // --- Previsualizaciones ---
              this.imagenFondoPreview = this.template.imagenFondoBase64 || null;
              this.imagenLogoPreview = this.template.imagenLogoBase64 || null;

              // --- Formulario ---
              // En los campos de imagen guardamos el NOMBRE DE ARCHIVO existente,
              // NO el Base64, para que el backend entienda que no se cambió la imagen.
              this.miFormulario.patchValue({
                nombre: this.template.nombre,
                appleId: this.template.appleId,
                imagenFondo: this.template.imagenFondo === 'Sin foto' ? null : this.template.imagenFondo,
                extensionImagenFondo: this.template.imagenFondo === 'Sin foto' ? null : this.template.extensionImagenFondo,
                imagenLogo: this.template.imagenLogo === 'Sin foto' ? null : this.template.imagenLogo,
                extensionImagenLogo: this.template.imagenLogo === 'Sin foto' ? null : this.template.extensionImagenLogo,
              });
            }
          });
        }
      });
  }

  prepararTablaResultados() {
    this.tablaResultados = new DataTable();
    this.tablaResultados.setTieneAcciones(true, true, true, true);
    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('Empresa', true, true, true, true, true, 2, 2, 2);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      nombre,
      estado
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
      Nombre: nombre,
      Estado: estado,

      EmpresaClienteId: this.userData?.empresaId || "",
      DatosCompletos: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvPlantillaCredencial.getAll(filtroBusqueda).subscribe((resp: any) => {
      this.cargando = false;
      if (resp.respuesta === true) {
        // console.log("RESP ::: ", resp.data);
        this.totalPaginas = resp.meta.totalPages;
        this.totalRegistros = resp.meta.totalCount;
        this.paginaActual = resp.meta.currentPage;
        this.mostrarTabla = true;

        let listado: any[] = resp.data;

        if (listado.length === 0) {
          this.sinDatos = true;
          return;
        }
        this.sinDatos = false;
        listado.forEach(vst => {
          this.srvPlantillaCredencial.getById(vst.id).subscribe((dataById: any) => {
            if (dataById.respuesta === true) {
              let strId: string = vst.id ? vst.id : '';
              let strNombre: string = vst.nombre;
              let strEmpresa: string = "";
              if (vst.empresaCliente !== undefined && vst.empresaCliente !== "" && vst.empresaCliente !== null) {
                strEmpresa = vst.empresaCliente.razonSocial;
              }
              let strEstado: string = vst.estado === 1 ? 'Activo' : vst.estado === 2 ? 'Inactivo' : '';
              let listEstado: IDTRCampoPropiedad[] = [
                { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
                { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
              ];


              let campos: IDataTableRegistroCampo[] = [];
              let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoEmpresa: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoFechaCreacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoEstado: IDataTableRegistroCampo = new DataTableRegistroCampo();


              if (vst.fechaCreacion) {
                const fecha = new Date(vst.fechaCreacion);
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const año = fecha.getFullYear();
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');

                vst.fechaCreacion = `${dia}/${mes}/${año} ${horas}:${minutos}`;
              }

              // campos que aparecerán en línea
              campoNombre.setValores(strNombre, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
              campoEmpresa.setValores(strEmpresa, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
              campoFechaCreacion.setValores(vst.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);

              campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

              // campos que aparecerán en línea
              campos.push(campoNombre);
              campos.push(campoEmpresa);
              campos.push(campoFechaCreacion);
              campos.push(campoEstado);

              this.tablaResultados?.addRegistro(strId, vst.estado!, campos);
            }
          });
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
    this.srvPlantillaCredencial.inactivate(id, this.userData.usuarioId!).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Plantilla inactivada',
          text: 'La plantilla se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,   // evita cerrar clickeando fuera
          allowEscapeKey: false,      // evita cerrar con ESC
          allowEnterKey: true,         // permite confirmar con ENTER
          customClass: {
            popup: 'swal-theme',
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.buscar(); // actualiza la lista SOLO al aceptar
          }
        });
      } else {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No fue posible inactivar el perfil. Intenta nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }
    this.srvPlantillaCredencial.reactivate(id, this.userData.usuarioId!).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Plantilla reactivada',
          text: 'La plantilla se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,   // evita cerrar clickeando fuera
          allowEscapeKey: false,      // evita cerrar con ESC
          allowEnterKey: true,         // permite confirmar con ENTER
          customClass: {
            popup: 'swal-theme',
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.buscar(); // actualiza la lista SOLO al aceptar
          }
        });
      } else {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No fue posible reactivar el perfil. Intenta nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });
  }

  ver(id: string) {
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(DetallePlantillaCredencial, {
      id: id,
      nombre: "Detalle de la plantilla"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        // console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }

  detalle(id: string) {
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(EditarPlantillaCredencial, {
      id: id,
      nombre: "Editar plantilla",
      action: "UPDATE"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        this.buscar(true);
      });
    }
  }

  cambiar(numero: number) {
    this.mostrarTabla = false;
    this.prepararTablaResultados();
    this.paginaActual = numero;
    this.buscar();
  }

  showBuscar(pagina?: boolean): void {
    this.buscar(true);
  }

  showLimpiar(): void {
    this.buscarFG.reset();
    this.buscar(true);
  }

  showAgregar(): void {
    const ref = this.srvModal.open(AgregarPlantillaCredencial, {
      nombre: "Agregar plantilla de credencial",
      action: "ADD"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        // console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }



  /** ACTUALIZAR PLANTILLA - TIPO USUARIO - USUARIO FINAL HID */
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
    if (this.template === null || this.template === undefined) {
      Swal.fire({
        title: '¡Advertencia!',
        text: "El identificador de la plantilla es requerido.",
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    if (this.template.id === null || this.template.id === undefined || this.template.id === "") {
      Swal.fire({
        title: '¡Advertencia!',
        text: "El identificador de la plantilla es requerido.",
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    if (this.userData === null || this.userData === undefined) {
      Swal.fire({
        title: '¡Advertencia!',
        text: "El identificador de la empresa es requerido.",
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

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

    this.srvPlantillaCredencial.update(request, this.template.id).subscribe((data: any) => {
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

          }
        });
      } else {
      }
    });
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
  /** ACTUALIZAR PLANTILLA - TIPO USUARIO - USUARIO FINAL HID */
}