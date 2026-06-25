import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AgregarUsuarioHid } from './agregar-usuario-hid/agregar-usuario-hid';

import { ModalService } from '../../../../../shared/services/modal.service';

import { StorageService } from '../../../../auth/services/storage.service';
import { UsuarioHidTipoCredencialService } from '../../services/usuario-hid-tipo-credencial.service';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { AutocTipoCredencialHid } from '../../components/autoc/autoc-tipo-credencial-hid/autoc-tipo-credencial-hid';
import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

import { DetalleUsuarioHid } from './detalle-usuario-hid/detalle-usuario-hid';
import { EditarUsuarioHid } from './editar-usuario-hid/editar-usuario-hid';

import Swal from 'sweetalert2';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-usuario-hid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    AutocTipoCredencialHid
  ],
  templateUrl: './usuario-hid.html',
  styleUrl: './usuario-hid.css',
})
export class UsuarioHid {
  private srvModal = inject(ModalService);
  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);
  private srvUsuarioHidTipoCredencial = inject(UsuarioHidTipoCredencialService);

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
    TipoCredencialId: [''],
    LicenciaId: [''],
    Nombre: [''],
    Email: [''],
    UserId: [''],
    Site: [''],
    Alert: [''],
    LicenseCount: [''],
    Telefono: [''],
    InvitacionFecha: [''],
    InvitacionExpirationDate: [''],
    InvitacionActividad: [''],
    InvitacionDetalle: [''],
    Status: [''],
    EmpresaClienteId: [''],
    Estado: [''],
  });

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

    // this.tablaResultados.addTitulo('Licencia', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Usuario', true, true, true, true, true, 2, 2, 2);
    this.tablaResultados.addTitulo('Correo electrónico', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estatus', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Código', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Credencial', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estado WVM', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      TipoCredencialId,
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
      Estado
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
      TipoCredencialId: TipoCredencialId,
      LicenciaId: LicenciaId,
      Nombre: Nombre,
      Email: Email,
      UserId: UserId,
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

      DatosCompletos: 1,
      PageNumber: this.paginaActual,
      Estado: Estado
    };

    this.tablaResultados!.registros = [];
    this.srvUsuarioHidTipoCredencial.getAll(filtroBusqueda).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        // console.log("DATA ::: ", resp.data);
        let listado: any[] = resp.data.filter(
          (usuario: any) => usuario.id?.toUpperCase() !== this.userId?.toUpperCase()
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
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            if (registro.licenciaHidUser.licenciaHID !== undefined && registro.licenciaHidUser.licenciaHID !== null && registro.licenciaHidUser.licenciaHID !== "") {
              strLicencia = registro.licenciaHidUser.licenciaHID.nombre;
            }
          }
          let strNombre: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            strNombre = registro.licenciaHidUser.nombreCompleto
          }
          let strEmail: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            strEmail = registro.licenciaHidUser.email;
          }
          let strStatus: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            strStatus = registro.licenciaHidUser.statusDescripcion;
          }
          let strEstadoInvitacion: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            strEstadoInvitacion = registro.licenciaHidUser.descripcionEstadoInvitacion;
          }
          let strCodigoInvitacion: string = "";
          if (registro.licenciaHidUser !== undefined && registro.licenciaHidUser !== null && registro.licenciaHidUser !== "") {
            strCodigoInvitacion = registro.licenciaHidUser.invitacionDetalle;
          }
          let strTipoCredencial: string = "";
          if (registro.tipoCredencial !== undefined && registro.tipoCredencial !== null && registro.tipoCredencial !== "") {
            strTipoCredencial = registro.tipoCredencial.nombre;
          }
          let listEstadoInvitacion: IDTRCampoPropiedad[] = [
            { condicion: 'Pendiente', aplicar: DataTableRegistroCampo.COLOR_BADGE_WARNING },
            { condicion: 'Cancelado', aplicar: DataTableRegistroCampo.COLOR_BADGE_SECONDARY },
            { condicion: 'Reconocido', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Eliminado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            { condicion: 'Sin estado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK }
          ];
          let listStatus: IDTRCampoPropiedad[] = [
            { condicion: 'Pendiente', aplicar: DataTableRegistroCampo.COLOR_BADGE_WARNING },
            { condicion: 'En proceso', aplicar: DataTableRegistroCampo.COLOR_BADGE_INFO },
            { condicion: 'Completado', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
            { condicion: 'Sin estado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK },
            { condicion: 'Estado desconocido', aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK }
          ];
          let strEstado: string = registro.estado === 1 ? 'Activo' : registro.estado === 2 ? 'Inactivo' : '';
          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_SUCCESS },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];

          let campos: IDataTableRegistroCampo[] = [];
          let campoLicencia: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEmail: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEstatus: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoEstadoInvitacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoCodigoInvitacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoTipoCredencial: IDataTableRegistroCampo = new DataTableRegistroCampo();
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

          campoLicencia.setValores(strLicencia, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoNombre.setValores(strNombre, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
          campoEmail.setValores(strEmail, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoEstatus.setValores(strStatus, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listStatus);
          campoEstadoInvitacion.setValores(strEstadoInvitacion, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstadoInvitacion);
          campoCodigoInvitacion.setValores(strCodigoInvitacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
          campoTipoCredencial.setValores(strTipoCredencial, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
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

          // campos.push(campoLicencia);
          campos.push(campoNombre);
          campos.push(campoEmail);
          campos.push(campoEstatus);
          campos.push(campoEstadoInvitacion);
          campos.push(campoCodigoInvitacion);
          campos.push(campoTipoCredencial);
          campos.push(campoFechaCreacion);
          campos.push(campoEstado);

          // console.log("REGISTRO ::: ", registro);
          if (registro.id !== this.userId) {
            this.tablaResultados?.addRegistro(strId, registro.estado!, campos, { mostrarReactivar: false });
          }
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }

    Swal.fire({
      title: '¡Advertencia!',
      text: 'El usuario está por inactivarse.',
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

        this.srvUsuarioHidTipoCredencial.inactivateCredentialUser(id, this.userData.usuarioId!).subscribe((resp: any) => {
          if (resp.respuesta === true) {
            Swal.close();
            Swal.fire({
              title: 'Usuario inactivado',
              text: 'El usuario se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
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
    });
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }

    Swal.fire({
      title: '¡Advertencia!',
      text: 'El usuario está por reactivarse.',
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

        this.srvUsuarioHidTipoCredencial.reactivateCredentialUser(id, this.userData.usuarioId!).subscribe((resp: any) => {
          if (resp.respuesta === true) {
            Swal.fire({
              title: 'Usuario reactivado',
              text: 'El usuario se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
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
    });
  }

  ver(id: string) {
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(DetalleUsuarioHid, {
      id: id,
      nombre: "Detalle del usuario HID"
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
    const ref = this.srvModal.open(EditarUsuarioHid, {
      id: id,
      nombre: "Editar usuario HID"
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
    const ref = this.srvModal.open(AgregarUsuarioHid, {
      // puedes pasar inputs si los necesitas
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        // console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }
}