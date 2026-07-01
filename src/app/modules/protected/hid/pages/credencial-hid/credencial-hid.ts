import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { filter, take } from 'rxjs';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';
import { AutocDispositivoHid } from '../../components/autoc/autoc-dispositivo-hid/autoc-dispositivo-hid';
import { AutocQueryHid } from '../../components/autoc/autoc-query-hid/autoc-query-hid';
import { CrearCredencialHid } from './crear-credencial-hid/crear-credencial-hid';
import { DetalleCredencialHid } from './detalle-credencial-hid/detalle-credencial-hid';

import { PermisoService } from '../../../authentication/services/permiso.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { CredencialHIDService } from '../../services/credencial-hid.service';

import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';
import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';
import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

@Component({
  selector: 'app-credencial-hid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    AutocDispositivoHid,
    AutocQueryHid
  ],
  templateUrl: './credencial-hid.html',
  styleUrl: './credencial-hid.css',
})
export class CredencialHid {
  idSection: string = "3DD088CD-7183-416D-98AF-2DBE47DA2544";
  permission: IPermisoDetalle | undefined;

  private srvModal = inject(ModalService);
  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);
  private srvCredencialHID = inject(CredencialHIDService);
  private srvPermiso = inject(PermisoService);

  userData!: IUsuarioAutenticado;

  user: IUsuarioResponse | undefined;
  userId: string = '';

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  buscarFG: FormGroup = this.srvForm.group({
    UsuarioId: [''],
    UsuarioNombre: [''],
    DispositivoId: [''],
    CredencialValor: [''],
    Estado: [''],
  });

  constructor() {
    effect(() => {
      this.permission = this.srvPermiso.getDetallePermiso(this.idSection);
      // console.log("SECCIÓN ::: ", this.permission);
    });
  }

  ngOnInit(): void {
    this.buscar(true);
    this.prepararTablaResultados();

    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
      });
  }

  prepararTablaResultados() {
    this.tablaResultados = new DataTable();
    this.tablaResultados.setTieneAcciones(true, true, true, false);

    this.tablaResultados.addTitulo('Tipo de credencial', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Dispositivo HID', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Usuario HID', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Número de credencial', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Estatus', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Estado', false, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      LicenciaId,
      Nombre,
      Email,
      UserId,
      Site,
      Alert,
      LicenseCount,
      Telefono,
      InvitacionFecha,
      InvitacionExpirationDate,
      InvitacionActividad,
      InvitacionDetalle,
      Status,
      EmpresaClienteId,
      UsuarioNombre,
      CredencialValor,
      DispositivoId,
      UsuarioId,
      Estado

    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
      LicenciaId: LicenciaId,
      Nombre: Nombre,
      Email: Email,
      UserId: UserId,
      UsuarioNombre: UsuarioNombre,
      Site: Site,
      Alert: Alert,
      LicenseCount: LicenseCount,
      Telefono: Telefono,
      InvitacionFecha: InvitacionFecha,
      InvitacionExpirationDate: InvitacionExpirationDate,
      InvitacionActividad: InvitacionActividad,
      InvitacionDetalle: InvitacionDetalle,
      Status: Status,
      EmpresaClienteId: EmpresaClienteId,

      CredencialValor: CredencialValor,
      DispositivoId: DispositivoId,
      Usuarioid: UsuarioId,
      Estado: Estado,

      DatosCompletos: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvCredencialHID.getAll(filtroBusqueda).subscribe((resp: any) => {
      // console.log("RESP :: ", resp);
      if (resp.respuesta === true) {

        let listado: any[] = resp.data;

        if (listado.length === 0) {
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
          // console.log("CREDENCIAL ::: ", registro);


          let strId: string = registro.id ? registro.id : '';
          let strTipoCredencial: string = registro.tipoCredencial;
          let strDispositivoHID: string = "";
          if (registro.dipositivosHID !== null && registro.dipositivosHID !== undefined && registro.dipositivosHID !== "") {
            strDispositivoHID = registro.dipositivosHID.nombreDispositivo;
          }
          let strUsuarioHID: string = "";
          if (registro.licenciaHidUser !== null && registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== "") {
            strUsuarioHID = registro.licenciaHidUser.nombreCompleto;
          }
          let strNumeroCredencial: string = registro.credencialValor;
          let strStatus: string = registro.statusDescripcion;

          let campos: IDataTableRegistroCampo[] = [];
          let campoTipoCredencial: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoDispositivoHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoUsuarioHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoNumeroCredencial: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEstatus: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let listStatus: IDTRCampoPropiedad[] = [
            { condicion: "Creada", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            { condicion: "Pendiente", aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: "Asignada", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            { condicion: "Suspendida", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            { condicion: "Expirada", aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            { condicion: "Eliminada", aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },


            { condicion: "Desconocido", aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK },
            // { condicion: "Emitida", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            // { condicion: "Revocando", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            // { condicion: "Revocada", aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            // { condicion: "Desvinculada", aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            // { condicion: "Error de creación", aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
          ];
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

          campoTipoCredencial.setValores(strTipoCredencial, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoDispositivoHID.setValores(strDispositivoHID, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoUsuarioHID.setValores(strUsuarioHID, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoNumeroCredencial.setValores(strNumeroCredencial, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoEstatus.setValores(strStatus, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listStatus);
          let strEstado: string = registro.estado === 1 ? 'Activo' : registro.estado === 2 ? 'Inactivo' : '';
          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_SUCCESS },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];
          let campoEstado: IDataTableRegistroCampo = new DataTableRegistroCampo();
          campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, false, true, false, false, true, 0, 0, 1, listEstado);

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

          campos.push(campoTipoCredencial);
          campos.push(campoDispositivoHID);
          campos.push(campoUsuarioHID);
          campos.push(campoNumeroCredencial);
          campos.push(campoEstatus);
          campos.push(campoEstado);
          campos.push(campoFechaCreacion);
          campos.push(campoFechaVencimiento);

          // this.tablaResultados?.addRegistro(strId, registro.estado!, campos);

          this.tablaResultados?.addRegistro(strId, registro.estado!, campos, { mostrarReactivar: false });
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }

    Swal.fire({
      title: '¡Advertencia!',
      text: 'La credencial está por inactivarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-theme',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Procesando...',
          text: 'Por favor espera',
          timerProgressBar: true,
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-theme',
          },
          willOpen: () => {
            Swal.showLoading();
          }
        });

        this.srvCredencialHID.inactivate(id).subscribe((resp: any) => {
          if (resp.respuesta === true) {
            Swal.close();
            Swal.fire({
              title: 'Credencial inactivada',
              text: 'La credencial se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
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
            Swal.close();
            Swal.fire({
              title: '¡Advertencia!',
              text: 'No fue posible inactivar la credencial. Intenta nuevamente.',
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
    });
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }

    Swal.fire({
      title: '¡Advertencia!',
      text: 'La credencial está por reactivarse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-theme',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Procesando...',
          text: 'Por favor espera',
          timerProgressBar: true,
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-theme',
          },
          willOpen: () => {
            Swal.showLoading();
          }
        });

        this.srvCredencialHID.reactivate(id).subscribe((resp: any) => {
          if (resp.respuesta === true) {
            Swal.fire({
              title: 'Credencial reactivada',
              text: 'La credencial se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
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
              text: 'No fue posible reactivar la credencial. Intenta nuevamente.',
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
    });
  }

  ver(id: string) {
    if (id.trim().length == 0) { return }

    const ref = this.srvModal.open(DetalleCredencialHid, {
      id: id,
      nombre: "Detalle de la credencial"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }

  detalle(id: string) {
    if (id.trim().length == 0) { return }

    const ref = this.srvModal.open(DetalleCredencialHid, {
      id: id,
      nombre: "Detalle de la credencial"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
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
    const ref = this.srvModal.open(CrearCredencialHid, {
      nombre: "Agregar credencial",
      action: "ADD"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }
}