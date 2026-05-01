import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';
import { ILicenciaHIDFilter } from '../../interfaces/licencia-hid.interface';

import { ModalService } from '../../../../../shared/services/modal.service';
import { UsuarioHIDService } from '../../services/usuario-hid.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { LicenciaHIDService } from '../../services/licencia-hid.service';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

@Component({
  selector: 'app-licencia-hid',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado
  ],
  templateUrl: './licencia-hid.html',
  styleUrl: './licencia-hid.css',
})
export class LicenciaHid {
  private srvModal = inject(ModalService);
  private srvForm = inject(FormBuilder);
  private srvUsuarioHID = inject(UsuarioHIDService);
  private srvStorage = inject(StorageService);
  private srvLicenciaHID = inject(LicenciaHIDService);

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
    NumeroParte: [''],
    Nombre: [''],
    EmpresaClienteId: [''],
    CantidadDisponible: [''],
    CantidadConsumida: [''],
    FechaInicio: [''],
    FechaFin: [''],
    EstadoLicencia: [''],
    EstadoPeriodo: [''],
    MensajeEstado: [''],
    Estado: [''],
  });

  ngOnInit(): void {
    this.buscar(true);
    this.prepararTablaResultados();

    if (this.srvStorage.getUserDetailData() !== undefined && this.srvStorage.getUserDetailData() !== null) {
      this.user = this.srvStorage.getUserDetailData()!;
      this.userId = this.user.id!;
    }
  }

  prepararTablaResultados() {
    this.tablaResultados = new DataTable();
    this.tablaResultados.setTieneAcciones(true, false, false, false);

    this.tablaResultados.addTitulo('Número de pieza', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 2, 2, 2);
    this.tablaResultados.addTitulo('Fecha inicio', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Fecha fin', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de vencimiento', false, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      NumeroParte,
      Nombre,
      EmpresaClienteId,
      CantidadDisponible,
      CantidadConsumida,
      FechaInicio,
      FechaFin,
      EstadoLicencia,
      EstadoPeriodo,
      MensajeEstado
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
      NumeroParte: NumeroParte,
      Nombre: Nombre,
      EmpresaClienteId: EmpresaClienteId,
      CantidadDisponible: CantidadDisponible,
      CantidadConsumida: CantidadConsumida,
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,
      EstadoLicencia: EstadoLicencia,
      EstadoPeriodo: EstadoPeriodo,
      MensajeEstado: MensajeEstado,

      DatosCompletos: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvLicenciaHID.getAll(filtroBusqueda).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        console.log("DATA ::: ", resp.data);
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
          this.srvLicenciaHID.getById(registro.id).subscribe((dataById: any) => {
            console.log("WWW ::: ", dataById);
            if (dataById.respuesta === true) {
              let strId: string = registro.id ? registro.id : '';
              let strNumeroPieza: string = registro.numeroParte;
              let strNombre: string = registro.nombre;
              let strFechaInicio: string = "";
              if (registro.fechaInicio !== undefined && registro.fechaInicio !== null && registro.fechaInicio !== "") {
                const fecha = new Date(registro.fechaInicio);
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const año = fecha.getFullYear();
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');

                strFechaInicio = `${dia}/${mes}/${año} ${horas}:${minutos}`;
              }
              let strFechaFin: string = "";
              if (registro.fechaFin !== undefined && registro.fechaFin !== null && registro.fechaFin !== "") {
                const fecha = new Date(registro.fechaFin);
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const año = fecha.getFullYear();
                const horas = String(fecha.getHours()).padStart(2, '0');
                const minutos = String(fecha.getMinutes()).padStart(2, '0');

                strFechaFin = `${dia}/${mes}/${año} ${horas}:${minutos}`;
              }

              let campos: IDataTableRegistroCampo[] = [];
              let campoNumeroPieza: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoFechaInicio: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoFechaFin: IDataTableRegistroCampo = new DataTableRegistroCampo();

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

              campoNumeroPieza.setValores(strNumeroPieza, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
              campoNombre.setValores(strNombre, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
              campoFechaInicio.setValores(strFechaInicio, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
              campoFechaFin.setValores(strFechaFin, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
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

              // // campos que aparecerán en línea
              // campos.push(campoNombre);
              // campos.push(campoCorreo);
              // campos.push(campoCorreoSecundario);

              // // campos que aparecerán en detalle
              // 
              campos.push(campoNumeroPieza);
              campos.push(campoNombre);
              campos.push(campoFechaInicio);
              campos.push(campoFechaFin);
              campos.push(campoFechaCreacion);
              campos.push(campoFechaVencimiento);

              if (registro.id !== this.userId) {
                this.tablaResultados?.addRegistro(strId, registro.estado!, campos);
              }
            }
          });
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
    // this.srvUsuario.inactivate(id).subscribe((resp: any) => {
    //   if (resp.respuesta === true) {
    //     Swal.fire({
    //       title: 'Usuario inactivado',
    //       text: 'El usuario se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
    //       icon: 'success',
    //       confirmButtonText: 'Aceptar',
    //       allowOutsideClick: false,   // evita cerrar clickeando fuera
    //       allowEscapeKey: false,      // evita cerrar con ESC
    //       allowEnterKey: true,         // permite confirmar con ENTER
    //       customClass: {
    //         popup: 'swal-theme',
    //       }
    //     }).then((result) => {
    //       if (result.isConfirmed) {
    //         this.buscar(); // actualiza la lista SOLO al aceptar
    //       }
    //     });
    //   } else {
    //     Swal.fire({
    //       title: '¡Advertencia!',
    //       text: 'No fue posible inactivar el usuario. Intenta nuevamente.',
    //       icon: 'warning',
    //       confirmButtonText: 'Aceptar',
    //       allowOutsideClick: false,
    //       customClass: {
    //         popup: 'swal-theme',
    //       }
    //     });
    //   }
    // });
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }
    // this.srvUsuario.reactivate(id).subscribe((resp: any) => {
    //   if (resp.respuesta === true) {
    //     Swal.fire({
    //       title: 'Usuario reactivado',
    //       text: 'El usuario se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
    //       icon: 'success',
    //       confirmButtonText: 'Aceptar',
    //       allowOutsideClick: false,   // evita cerrar clickeando fuera
    //       allowEscapeKey: false,      // evita cerrar con ESC
    //       allowEnterKey: true,         // permite confirmar con ENTER
    //       customClass: {
    //         popup: 'swal-theme',
    //       }
    //     }).then((result) => {
    //       if (result.isConfirmed) {
    //         this.buscar(); // actualiza la lista SOLO al aceptar
    //       }
    //     });
    //   } else {
    //     Swal.fire({
    //       title: '¡Advertencia!',
    //       text: 'No fue posible reactivar el usuario. Intenta nuevamente.',
    //       icon: 'warning',
    //       confirmButtonText: 'Aceptar',
    //       allowOutsideClick: false,
    //       customClass: {
    //         popup: 'swal-theme',
    //       }
    //     });
    //   }
    // });
  }

  ver(id: string) {
    if (id.trim().length == 0) { return }

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
    // this.buscar(true);
  }

  showLimpiar(): void {
    this.buscarFG.reset();
    this.buscar(true);
  }
}