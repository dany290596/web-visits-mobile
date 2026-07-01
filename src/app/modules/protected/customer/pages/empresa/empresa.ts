import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs';

import { EmpresaService } from '../../services/empresa.service';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { ModalService } from '../../../../../shared/services/modal.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { PermisoService } from '../../../authentication/services/permiso.service';

import Swal from 'sweetalert2';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

import { AgregarEmpresa } from './agregar-empresa/agregar-empresa';
import { DetalleEmpresa } from './detalle-empresa/detalle-empresa';
import { EditarEmpresa } from './editar-empresa/editar-empresa';

import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';
import { IPermisoDetalle } from '../../../authentication/interfaces/permiso.interface';

@Component({
  selector: 'app-empresa',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado
  ],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class Empresa {
  idSection: string = "99CD2FB3-584A-4B3B-B876-4E96F5F16A1F";
  permission: IPermisoDetalle | undefined;

  private srvStorage = inject(StorageService);
  private srvEmpresa = inject(EmpresaService);
  private srvForm = inject(FormBuilder);
  private srvModal = inject(ModalService);
  private srvPermiso = inject(PermisoService);

  constructor() {
    effect(() => {
      this.permission = this.srvPermiso.getDetallePermiso(this.idSection);
      // console.log("SECCIÓN ::: ", this.permission);
    });
  }

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  userData!: IUsuarioAutenticado;

  buscarFG: FormGroup = this.srvForm.group({
    RazonSocial: [''],
    RFC: [''],
    CorreoElectronico: [''],
    Estado: ['']
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
    this.tablaResultados.addTitulo('Razón Social', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('RFC', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('Correo Electrónico', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Estado', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.registros = [];
  }

  buscar(pagina?: boolean) {
    this.cargando = true;
    const {
      RazonSocial,
      RFC,
      CorreoElectronico,
      Estado
    } = this.buscarFG.value;

    if (pagina) {
      this.paginaActual = 1;
    }

    let filtroBusqueda: any = {
      RazonSocial: RazonSocial,
      RFC: RFC,
      CorreoElectronico: CorreoElectronico,
      Estado: Estado,
      DatosCompletos: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvEmpresa.getAll(filtroBusqueda).subscribe((resp: any) => {
      this.cargando = false;
      if (resp.respuesta === true) {

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
          let strId: string = vst.id ? vst.id : '';
          let strRazonSocial: string = vst.razonSocial;
          let strRFC: string = vst.rfc;
          let strCorreoElectronico: string = vst.correoElectronico;
          let strEstado: string = vst.estado === 1 ? 'Activo' : vst.estado === 2 ? 'Inactivo' : '';
          let listEstado: IDTRCampoPropiedad[] = [
            { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
            { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
          ];


          let campos: IDataTableRegistroCampo[] = [];
          let campoRazonSocial: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoRFC: IDataTableRegistroCampo = new DataTableRegistroCampo();
          let campoCorreoElectronico: IDataTableRegistroCampo = new DataTableRegistroCampo();
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
          campoRazonSocial.setValores(strRazonSocial, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoRFC.setValores(strRFC, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoCorreoElectronico.setValores(strCorreoElectronico, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
          campoFechaCreacion.setValores(vst.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);

          campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

          // campos que aparecerán en línea
          campos.push(campoRazonSocial);
          campos.push(campoRFC);
          campos.push(campoCorreoElectronico);
          campos.push(campoFechaCreacion);
          campos.push(campoEstado);

          this.tablaResultados?.addRegistro(strId, vst.estado!, campos);


        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
    this.srvEmpresa.inactivate(id, this.userData.usuarioId!).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Empresa inactivada',
          text: 'La empresa se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
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
          text: 'No fue posible inactivar la empresa. Intenta nuevamente.',
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
    this.srvEmpresa.reactivate(id, this.userData.usuarioId!).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Empresa reactivada',
          text: 'La empresa se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
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
          text: 'No fue posible reactivar la empresa. Intenta nuevamente.',
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
    const ref = this.srvModal.open(DetalleEmpresa, {
      id: id,
      nombre: "Detalle de la empresa"
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
    const ref = this.srvModal.open(EditarEmpresa, {
      id: id,
      nombre: "Editar empresa"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.closeModal.subscribe((guardadoExitoso: boolean) => {
        console.log("Se cerró el modal, guardadoExitoso:", guardadoExitoso);
        if (guardadoExitoso) {
          this.buscar(true); // refresca la tabla solo si se guardó algo
        }
        // No es necesario llamar a ref.close() porque el servicio ya lo hace
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
    const ref = this.srvModal.open(AgregarEmpresa, {
      nombre: "Agregar empresa",
    }, '');

    if (ref && ref.instance) {
      ref.instance.closeModal.subscribe((guardadoExitoso: boolean) => {
        // console.log("Se cerró el modal, guardadoExitoso:", guardadoExitoso);
        if (guardadoExitoso) {
          this.buscar(true); // refresca la tabla solo si se guardó algo
        }
        // No es necesario llamar a ref.close() porque el servicio ya lo hace
      });
    }
  }
}