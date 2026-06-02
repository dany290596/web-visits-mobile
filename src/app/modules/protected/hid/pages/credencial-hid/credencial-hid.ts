import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ModalService } from '../../../../../shared/services/modal.service';
import { UsuarioHIDService } from '../../services/usuario-hid.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { CredencialHIDService } from '../../services/credencial-hid.service';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';
import { AutocUsuarioHid } from '../../components/autoc/autoc-usuario-hid/autoc-usuario-hid';
import { AutocDispositivoHid } from '../../components/autoc/autoc-dispositivo-hid/autoc-dispositivo-hid';

import { CrearCredencialHid } from './crear-credencial-hid/crear-credencial-hid';
import { DetalleCredencialHid } from './detalle-credencial-hid/detalle-credencial-hid';

import Swal from 'sweetalert2';
import { filter, take } from 'rxjs';

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
    AutocUsuarioHid,
    AutocDispositivoHid
  ],
  templateUrl: './credencial-hid.html',
  styleUrl: './credencial-hid.css',
})
export class CredencialHid {
  private srvModal = inject(ModalService);
  private srvForm = inject(FormBuilder);
  private srvUsuarioHID = inject(UsuarioHIDService);
  private srvStorage = inject(StorageService);
  private srvCredencialHID = inject(CredencialHIDService);

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
    DispositivoId: [''],
    CredencialValor: [''],
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
    this.tablaResultados.setTieneAcciones(true, true, true, true);

    this.tablaResultados.addTitulo('Tipo de credencial', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Dispositivo HID', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Usuario HID', true, true, true, true, true, 3, 3, 2);
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
      EmpresaClienteId
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
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
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvCredencialHID.getAll(filtroBusqueda).subscribe((resp: any) => {
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

          let campos: IDataTableRegistroCampo[] = [];
          let campoTipoCredencial: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoDispositivoHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoUsuarioHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
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
          campos.push(campoFechaCreacion);
          campos.push(campoFechaVencimiento);

          this.tablaResultados?.addRegistro(strId, registro.estado!, campos);
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