import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';
import { AutocQueryHid } from '../../components/autoc/autoc-query-hid/autoc-query-hid';
import { DetalleDispositivoHid } from './detalle-dispositivo-hid/detalle-dispositivo-hid';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';
import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';
import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { ModalService } from '../../../../../shared/services/modal.service';
import { PermisoService } from '../../../authentication/services/permiso.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { DispositivoHIDService } from '../../services/dispositivo-hid.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-dispositivo-hid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    AutocQueryHid
  ],
  templateUrl: './dispositivo-hid.html',
  styleUrl: './dispositivo-hid.css',
})
export class DispositivoHid {
  idSection: string = "807619F8-FA90-4824-94C7-9738F30B26CD";
  permission: IPermisoDetalle | undefined;

  private readonly TIPO_USUARIO_EMPRESA = '2228D6FB-CBDD-4672-9A06-A6E054157E6D';

  private srvModal = inject(ModalService);
  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);
  private srvDispositivoHID = inject(DispositivoHIDService);
  private srvPermiso = inject(PermisoService);

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  userData!: IUsuarioAutenticado;

  buscarFG: FormGroup = this.srvForm.group({
    UsuarioId: [''],
    UsuarioNombre: [''],
    CodigoInvitacion: [''],
    NombreDispositivo: [''],
    SistemaOperativo: [''],
    SdkVersion: [''],
    Estado: [''],
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
    this.tablaResultados.setTieneAcciones(true, false, true, false);

    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Usuario HID', true, true, true, true, true, 1, 1, 1);

    this.tablaResultados.addTitulo('Código de invitación', false, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Endpoint', false, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Versión SDK', false, true, true, true, true, 3, 3, 2);

    this.tablaResultados.addTitulo('Sistema operativo', true, true, true, true, true, 3, 3, 2);

    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);

    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      UsuarioId,
      SistemaOperativo,
      NombreDispositivo,
      CodigoInvitacion,
      EndpointId,
      SdkVersion,
      DeviceInfoLastUpdated,
      DeviceDefault,
      Status,
      InvitacionExpirationDate,
      InvitacionActividad,
      InvitacionDetalle,
      EmpresaClienteId,
      UsuarioNombre,
      Estado
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
      UsuarioId: UsuarioId,
      SistemaOperativo: SistemaOperativo,
      NombreDispositivo: NombreDispositivo,
      CodigoInvitacion: CodigoInvitacion,
      EndpointId: EndpointId,
      SdkVersion: SdkVersion,
      DeviceInfoLastUpdated: DeviceInfoLastUpdated,
      DeviceDefault: DeviceDefault,
      Status: Status,
      InvitacionExpirationDate: InvitacionExpirationDate,
      InvitacionActividad: InvitacionActividad,
      InvitacionDetalle: InvitacionDetalle,
      UsuarioNombre: UsuarioNombre,
      // EmpresaClienteId: esTipoUsuarioEmpresa ? this.userData.empresaId : '',
      EmpresaClienteId: this.userData.empresaId,
      DatosCompletos: 1,
      PageNumber: this.paginaActual,
      Estado: Estado
    };

    this.tablaResultados!.registros = [];
    this.srvDispositivoHID.getAll(filtroBusqueda).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        // console.log("DATA ::: ", resp.data);
        let listado: any[] = resp.data.filter(
          (usuario: any) => usuario.id?.toUpperCase() !== this.userData.usuarioId?.toUpperCase()
        );

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

        listado.forEach(registro => {
          // console.log("REGISTRO ::: ", registro);
          let strId: string = registro.id ? registro.id : '';
          let strLicencia: string = "";
          if (registro.licenciaHID !== undefined && registro.licenciaHID !== null && registro.licenciaHID !== "") {
            strLicencia = registro.licenciaHID.nombre;
          }
          let strUserHID: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null) {
            strUserHID = registro.licenciaHidUser.nombreCompleto;
          }
          let strCodigoInvitacion: string = registro.codigoInvitacion;
          let strEndpoint: string = registro.endpointId;
          let strNombreDispositivo: string = registro.nombreDispositivo;

          let strEstadoInvitacion: string = registro.descripcionEstadoInvitacion;

          let strVersion: string = registro.sdkVersion;
          let strSO: string = registro.sistemaOperativo;

          let listEstadoInvitacion: IDTRCampoPropiedad[] = [
            { condicion: 'Pendiente', aplicar: DataTableRegistroCampo.COLOR_BADGE_WARNING },
            { condicion: 'Cancelado', aplicar: DataTableRegistroCampo.COLOR_BADGE_SECONDARY },
            { condicion: 'Reconocido', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Eliminado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            { condicion: 'Sin estado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK }
          ];

          let campos: IDataTableRegistroCampo[] = [];
          let campoUserHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoCodigoInvitacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEndpoint: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoNombreDispositivo: IDataTableRegistroCampo = new DataTableRegistroCampo();

          let campoVersion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoSO: IDataTableRegistroCampo = new DataTableRegistroCampo();

          let strEstado: string = registro.estado === 1 ? 'Activo' : registro.estado === 2 ? 'Inactivo' : '';

          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_SUCCESS },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];

          let campoEstadoInvitacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoFechaCreacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoFechaVencimiento: IDataTableRegistroCampo = new DataTableRegistroCampo();

          if (registro.fechaCreacion) {
            const fecha = new Date(registro.fechaCreacion);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const año = fecha.getFullYear();
            const horas = String(fecha.getHours()).padStart(2, '0');
            const minutos = String(fecha.getMinutes()).padStart(2, '0');

            registro.fechaCreacion = `${dia}/${mes}/${año} ${horas}:${minutos}`;
          }

          campoUserHID.setValores(strUserHID, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoCodigoInvitacion.setValores(strCodigoInvitacion, DataTableRegistroCampo.CAMPO_TEXTO, false, true, true, true, true, 4, 3, 2);
          campoEndpoint.setValores(strEndpoint, DataTableRegistroCampo.CAMPO_TEXTO, false, true, true, true, true, 2, 2, 2);
          campoVersion.setValores(strVersion, DataTableRegistroCampo.CAMPO_TEXTO, false, true, true, true, true, 3, 3, 2);

          campoNombreDispositivo.setValores(strNombreDispositivo, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoSO.setValores(strSO, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);

          campoEstadoInvitacion.setValores(strEstadoInvitacion, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstadoInvitacion);
          campoFechaCreacion.setValores(registro.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);
          campoFechaVencimiento.setValores(
            (!registro.fechaVencimiento)
              ? "N/A"
              : (() => {
                const fecha = new Date(registro.fechaVencimiento);
                if (isNaN(fecha.getTime())) return "NA"; // Validar fecha
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const anio = fecha.getFullYear();
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');
                const segundos = String(fecha.getSeconds()).padStart(2, '0');
                return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`; // <-- string
              })(),
            DataTableRegistroCampo.CAMPO_TEXTO,
            false, true, true, true, true, 1, 1, 1
          );

          let campoEstado: IDataTableRegistroCampo = new DataTableRegistroCampo();

          campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

          campos.push(campoNombreDispositivo);
          campos.push(campoUserHID);
          campos.push(campoCodigoInvitacion);
          campos.push(campoEndpoint);
          campos.push(campoVersion);

          campos.push(campoSO);

          campos.push(campoEstado);

          campos.push(campoFechaCreacion);
          campos.push(campoFechaVencimiento);

          if (registro.id !== this.userData.usuarioId) {
            this.tablaResultados?.addRegistro(strId, registro.estado!, campos);
          }
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }
  }

  ver(id: string) {
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(DetalleDispositivoHid, {
      id: id,
      nombre: "Detalle del dispositivo HID"
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
}