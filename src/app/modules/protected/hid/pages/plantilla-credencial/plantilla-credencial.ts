import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import Swal from 'sweetalert2';

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

@Component({
  selector: 'app-plantilla-credencial',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado
  ],
  templateUrl: './plantilla-credencial.html',
  styleUrl: './plantilla-credencial.css',
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

  buscarFG: FormGroup = this.srvForm.group({
    nombre: [''],
    estado: [''],
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
    this.tablaResultados.setTieneAcciones(true, true, true, true);
    this.tablaResultados.addTitulo('Nombre', true, true, true, true, true, 4, 3, 2);
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
      DatosCompletos: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvPlantillaCredencial.getAll(filtroBusqueda).subscribe((resp: any) => {
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
          this.srvPlantillaCredencial.getById(vst.id).subscribe((dataById: any) => {
            if (dataById.respuesta === true) {
              let strId: string = vst.id ? vst.id : '';
              let strNombre: string = vst.nombre;
              let strEstado: string = vst.estado === 1 ? 'Activo' : vst.estado === 2 ? 'Inactivo' : '';
              let listEstado: IDTRCampoPropiedad[] = [
                { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
                { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
              ];


              let campos: IDataTableRegistroCampo[] = [];
              let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
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
              campoFechaCreacion.setValores(vst.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);

              campoEstado.setValores(strEstado, DataTableRegistroCampo.CAMPO_BADGE, true, true, false, false, true, 0, 0, 1, listEstado);

              // campos que aparecerán en línea
              campos.push(campoNombre);
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
        console.log("DATA ::: ", s);
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
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }
}