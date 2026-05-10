import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PerfilService } from '../../services/perfil.service';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { ModalService } from '../../../../../shared/services/modal.service';

import { AgregarPerfil } from './agregar-perfil/agregar-perfil';
import { DetallePerfil } from './detalle-perfil/detalle-perfil';

import Swal from 'sweetalert2';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

@Component({
  selector: 'app-perfil',
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
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private srvPerfil = inject(PerfilService);
  private srvForm = inject(FormBuilder);
  private srvModal = inject(ModalService);

  paginaActual: number = 1;
  totalPaginas: number = 0;
  totalRegistros: number = 0;

  cargando: boolean = false;
  sinDatos: boolean = false;
  mostrarTabla: boolean = false;
  tablaResultados: IDataTable = new DataTable();

  buscarFG: FormGroup = this.srvForm.group({
    nombre: [''],
    estado: [''],
  });

  ngOnInit(): void {
    this.buscar(true);
    this.prepararTablaResultados();
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
    this.srvPerfil.getAll(filtroBusqueda).subscribe((resp: any) => {
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
          this.srvPerfil.getById(vst.id).subscribe((dataById: any) => {
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
    this.srvPerfil.inactivate(id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Perfil inactivado',
          text: 'El perfil se ha inactivado correctamente. Presiona "Aceptar" para continuar.',
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
    this.srvPerfil.reactivate(id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        Swal.fire({
          title: 'Perfil reactivado',
          text: 'El perfil se ha reactivado correctamente. Presiona "Aceptar" para continuar.',
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
    const ref = this.srvModal.open(DetallePerfil, {
      id: id,
      nombre: "Detalle del perfil"
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
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(AgregarPerfil, {
      id: id,
      nombre: "Editar perfil"
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
    const ref = this.srvModal.open(AgregarPerfil, {
      nombre: "Agregar perfil"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }
}