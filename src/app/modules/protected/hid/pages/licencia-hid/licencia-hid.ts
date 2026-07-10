import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';
import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { ModalService } from '../../../../../shared/services/modal.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { LicenciaHIDService } from '../../services/licencia-hid.service';
import { PermisoService } from '../../../authentication/services/permiso.service';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';
import { DetalleLicenciaHid } from './detalle-licencia-hid/detalle-licencia-hid';
import { filter, take } from 'rxjs';

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
  idSection: string = "00592364-A1F1-4518-AF56-3F1C936CA80D";
  permission: IPermisoDetalle | undefined;

  private readonly TIPO_USUARIO_EMPRESA = '2228D6FB-CBDD-4672-9A06-A6E054157E6D';

  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);
  private srvLicenciaHID = inject(LicenciaHIDService);
  private srvModal = inject(ModalService);
  private srvPermiso = inject(PermisoService);

  // user: IUsuarioResponse | undefined;
  // userId: string = '';

  userData!: IUsuarioAutenticado;

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
        this.prepararTablaResultados();
        this.buscar(true);
      });
  }

  prepararTablaResultados() {
    this.tablaResultados = new DataTable();
    this.tablaResultados.setTieneAcciones(true, false, true, false);

    this.tablaResultados.addTitulo('Número de pieza', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 2, 2, 2);
    this.tablaResultados.addTitulo('Fecha inicio', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Fecha fin', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de vencimiento', false, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);
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
      MensajeEstado,
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
      NumeroParte: NumeroParte,
      Nombre: Nombre,
      CantidadDisponible: CantidadDisponible,
      CantidadConsumida: CantidadConsumida,
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,
      EstadoLicencia: EstadoLicencia,
      EstadoPeriodo: EstadoPeriodo,
      MensajeEstado: MensajeEstado,
      EmpresaClienteId: esTipoUsuarioEmpresa ? this.userData.empresaId : '',
      DatosCompletos: 1,
      PageNumber: this.paginaActual,
      Estado: Estado
    };

    this.tablaResultados!.registros = [];
    // console.log("FILTROS ::: ", filtroBusqueda);
    this.srvLicenciaHID.getAll(filtroBusqueda).subscribe((resp: any) => {
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
          let strEstado: string = registro.estado === 1 ? 'Activo' : registro.estado === 2 ? 'Inactivo' : '';
          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];

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

          let campoEstado: IDataTableRegistroCampo = new DataTableRegistroCampo();

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
          campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

          campos.push(campoNumeroPieza);
          campos.push(campoNombre);
          campos.push(campoFechaInicio);
          campos.push(campoFechaFin);
          campos.push(campoFechaCreacion);
          campos.push(campoFechaVencimiento);
          campos.push(campoEstado);

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
    const ref = this.srvModal.open(DetalleLicenciaHid, {
      id: id,
      nombre: "Detalle de la licencia"
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