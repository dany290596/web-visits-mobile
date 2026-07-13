import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';
import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';

import { PermisoService } from '../../../authentication/services/permiso.service';
import { PlantillaNotificacionService } from '../../services/plantilla-notificacion.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { StorageService } from '../../../../auth/services/storage.service';

import { AgregarPlantillaNotificacion } from './agregar-plantilla-notificacion/agregar-plantilla-notificacion';
import { DetallePlantillaNotificacion } from './detalle-plantilla-notificacion/detalle-plantilla-notificacion';
import { EditarPlantillaNotificacion } from './editar-plantilla-notificacion/editar-plantilla-notificacion';
import { AutocTipoPlantillaNotificacion } from '../../components/autoc/autoc-tipo-plantilla-notificacion/autoc-tipo-plantilla-notificacion';

import Swal from 'sweetalert2';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-plantilla-notificacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    SelectButtonModule,
    AutocTipoPlantillaNotificacion
  ],
  templateUrl: './plantilla-notificacion.html',
  styleUrl: './plantilla-notificacion.css',
})
export class PlantillaNotificacion {
  idSection: string = "88E9733E-1D92-4B7A-8368-2380B3EC463C";
  permission: IPermisoDetalle | undefined;

  private readonly TIPO_USUARIO_EMPRESA = '2228D6FB-CBDD-4672-9A06-A6E054157E6D';

  private srvPermiso = inject(PermisoService);
  private srvPlantillaNotificacion = inject(PlantillaNotificacionService);
  private srvForm = inject(FormBuilder);
  private srvModal = inject(ModalService);
  private srvStorage = inject(StorageService);

  userData!: IUsuarioAutenticado;

  notificarOptions = [
    { name: 'Todos', value: null },
    { name: 'Sí', value: 1 },
    { name: 'No', value: 2 }
  ];

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  buscarFG: FormGroup = this.srvForm.group({
    Nombre: [''],
    CuerpoPlantilla: [''],
    NotificarEmail: [null],
    NotificarTeams: [null],
    Identificador: [''],
    TipoPlantillaNotificacionId: [''],
    EmpresaClienteId: [''],
    Estado: ['']
  });

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
        this.buscar(true);
        this.prepararTablaResultados();
      });
  }

  prepararTablaResultados() {
    this.tablaResultados = new DataTable();
    this.tablaResultados.setTieneAcciones(true, true, true, true);
    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('Tipo de plantilla', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Cuerpo', true, true, true, true, true, 2, 2, 2);
    this.tablaResultados.addTitulo('Enviar por correo', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Enviar por Teams', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de creación', false, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      estado,
      perfilId,
      tipoUsuarioId,
      idAsociado,
      correo,
      estadoVencimientoId
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    const esTipoUsuarioEmpresa: boolean =
      this.userData !== null &&
      this.userData !== undefined &&
      this.userData.tipoUsuarioId !== null &&
      this.userData.tipoUsuarioId !== undefined &&
      this.userData.tipoUsuarioId !== '' &&
      this.userData.tipoUsuarioId.toUpperCase() === this.TIPO_USUARIO_EMPRESA;

    let filtroBusqueda: any = {
      Nombre: nombre,
      ApellidoPaterno: apellidoPaterno,
      ApellidoMaterno: apellidoMaterno,
      Correo: correo,
      Estado: estado,
      PerfilId: perfilId,
      TipoUsuarioId: tipoUsuarioId,
      IdAsociado: idAsociado,
      Vence: estadoVencimientoId,
      EmpresaClienteId: esTipoUsuarioEmpresa ? this.userData.empresaId : '',
      DatosCompletos: 1,
      DataComplete: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvPlantillaNotificacion.getAll(filtroBusqueda).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        // console.log("DATA ::: ", resp.data);
        let listado: any[] = resp.data;

        if (!listado || listado.length === 0) {
          this.totalPaginas = resp.meta?.totalPages || 0;
          this.totalRegistros = 0;
          this.paginaActual = resp.meta?.currentPage || 1;

          this.sinDatos = true;
          this.mostrarTabla = true;
          this.cargando = false;
          return;
        }

        this.totalPaginas = resp.meta.totalPages;
        this.totalRegistros = resp.meta.totalCount;
        this.paginaActual = resp.meta.currentPage;
        this.cargando = false;
        this.mostrarTabla = true;
        this.sinDatos = false;

        listado.forEach(vst => {
          // console.log("ITEM ::: ", vst);
          let strId: string = vst.id ? vst.id : '';
          let strNombreCompleto: string = vst.nombre;
          let strCuerpo: string = vst.cuerpoPlantilla;
          let strPlantillaNotificacionNombre: string = vst.tipoPlantillaNotificacion;
          if (vst.tipoPlantillaNotificacion !== undefined && vst.tipoPlantillaNotificacion !== null && vst.tipoPlantillaNotificacion !== '') {
            strPlantillaNotificacionNombre = vst.tipoPlantillaNotificacion.nombre;
          }
          let strEmail: string = '';
          let strTeems: string = '';

          if (vst.notificarEmail == 1) {
            strEmail = "Activado";
          } else {
            strEmail = "Inactivado";
          }

          if (vst.notificarTeams == 1) {
            strTeems = "Activado";
          } else {
            strTeems = "Inactivado";
          }
          let strEstado: string = vst.estado === 1 ? 'Activo' : vst.estado === 2 ? 'Inactivo' : '';
          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];
          let campos: IDataTableRegistroCampo[] = [];
          let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoPlantillaNotificacionNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoCuerpo: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEmail: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoTeems: IDataTableRegistroCampo = new DataTableRegistroCampo();
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

          // // // campos que aparecerán en línea
          campoNombre.setValores(strNombreCompleto, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoPlantillaNotificacionNombre.setValores(strPlantillaNotificacionNombre, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
          campoCuerpo.setValores(strCuerpo, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
          campoEmail.setValores(strEmail, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoTeems.setValores(strTeems, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoFechaCreacion.setValores(vst.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);

          campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

          campos.push(campoNombre);
          campos.push(campoPlantillaNotificacionNombre);
          campos.push(campoCuerpo);
          campos.push(campoEmail);
          campos.push(campoTeems);
          campos.push(campoEstado);

          this.tablaResultados?.addRegistro(strId, vst.estado!, campos);
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
    this.srvPlantillaNotificacion.inactivate(id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Plantilla de notificación inactivada',
          text: 'La plantilla de notificación se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
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
          text: 'No fue posible inactivar el usuario. Intenta nuevamente.',
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
    this.srvPlantillaNotificacion.reactivate(id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Plantilla de notificación reactivada',
          text: 'La plantilla de notificación se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
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
          text: 'No fue posible reactivar el usuario. Intenta nuevamente.',
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
    const ref = this.srvModal.open(DetallePlantillaNotificacion, {
      id: id,
      nombre: "Detalle de plantilla de notificación"
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
    const ref = this.srvModal.open(EditarPlantillaNotificacion, {
      id: id,
      nombre: "Editar plantilla de notificación"
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
    const ref = this.srvModal.open(AgregarPlantillaNotificacion, {
      nombre: "Agregar plantilla de notificación"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        // console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }

  onNotificarEmailChange(event: any) {
    // console.log('Cambio en NotificarEmail:', event.value);
  }

  onNotificarTeamsChange(event: any) {
    // console.log('Cambio en NotificarTeams:', event.value);
  }
}