import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { UsuarioService } from '../../services/usuario.service';
import { StorageService } from '../../../../auth/services/storage.service';

import { IUsuarioResponse } from '../../interfaces/usuario.interface';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { ModalService } from '../../../../../shared/services/modal.service';

import { AgregarUsuario } from './agregar-usuario/agregar-usuario';
import { DetalleUsuario } from './detalle-usuario/detalle-usuario';

import Swal from 'sweetalert2';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';
import { AutocPerfil } from '../../components/autoc/autoc-perfil/autoc-perfil';
import { AutocTipoUsuario } from '../../components/autoc/autoc-tipo-usuario/autoc-tipo-usuario';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TableDynamic,
    InputNumberModule,
    InputTextModule,
    AutocEstado,
    AutocPerfil,
    AutocTipoUsuario
  ],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export class Usuario {
  private srvUsuario = inject(UsuarioService);
  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);
  private srvModal = inject(ModalService);

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
    nombre: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    correo: [''],
    perfilId: [''],
    tipoUsuarioId: [''],
    idAsociado: [''],
    estado: [''],
    estadoVencimientoId: [''],
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
    this.tablaResultados.setTieneAcciones(true, true, true, true);
    // this.tablaResultados.addTitulo('Asociado', true, true, true, true, true, 4, 3, 2);
    this.tablaResultados.addTitulo('Correo', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Perfil', true, true, true, true, true, 2, 2, 2);

    this.tablaResultados.addTitulo('Tipo usuario', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Fecha de creación', true, true, true, true, true, 1, 1, 1);
    this.tablaResultados.addTitulo('Fecha de vencimiento', false, true, true, true, true, 1, 1, 1);
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
      DatosCompletos: 1,
      DataComplete: 1,
      PageNumber: this.paginaActual
    };

    this.tablaResultados!.registros = [];
    this.srvUsuario.getAll(filtroBusqueda).subscribe((resp: any) => {
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

        listado.forEach(vst => {
          this.srvUsuario.getById(vst.id).subscribe((dataById: any) => {
            if (dataById.respuesta === true) {
              let strId: string = vst.id ? vst.id : '';
              let strNombreCompleto: string = '';
              if (vst.asociado !== undefined && vst.asociado !== null && vst.asociado !== '') {
                strNombreCompleto = vst.asociado.nombre + ' ' + vst.asociado.apellidoPaterno + ' ' + vst.asociado.apellidoMaterno;
              }
              let strPerfil: string = '';
              if (vst.perfil !== undefined && vst.perfil !== null && vst.perfil !== '') {
                strPerfil = vst.perfil.nombre;
              }
              let strCorreo: string = vst.correo;
              let strTipoUsuario: string = '';
              if (vst.tipoUsuario !== undefined && vst.tipoUsuario !== null && vst.tipoUsuario !== '') {
                strTipoUsuario = vst.tipoUsuario.nombre;
              }
              let strEstado: string = vst.estado === 1 ? 'Activo' : vst.estado === 2 ? 'Inactivo' : '';
              let listEstado: IDTRCampoPropiedad[] = [
                { condicion: 'Activo', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
                { condicion: 'Inactivo', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER }
              ];
              let campos: IDataTableRegistroCampo[] = [];
              let campoNombre: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoPerfil: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoCorreo: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoTipoUsuario: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoFechaCreacion: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoFechaVencimiento: IDataTableRegistroCampo = new DataTableRegistroCampo();
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

              // // campos que aparecerán en línea
              campoNombre.setValores(strNombreCompleto, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
              campoPerfil.setValores(strPerfil, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
              campoCorreo.setValores(strCorreo, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
              campoTipoUsuario.setValores(strTipoUsuario, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
              campoFechaCreacion.setValores(vst.fechaCreacion, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 1, 1, 1);
              campoFechaVencimiento.setValores(
                (!vst.fechaVencimiento)
                  ? "N/A"
                  : (() => {
                    const fecha = new Date(vst.fechaVencimiento);
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

              // // campos que aparecerán en detalle
              // campos.push(campoNombre);
              campos.push(campoCorreo);
              campos.push(campoPerfil);
              campos.push(campoTipoUsuario);
              campos.push(campoFechaCreacion);
              campos.push(campoFechaVencimiento);
              campos.push(campoEstado);

              if (vst.id !== this.userId) {
                this.tablaResultados?.addRegistro(strId, vst.estado!, campos);
              }
            }
          });
        });
      }
    });
  }

  inactivar(id: string) {
    if (id.trim().length == 0) { return }
    this.srvUsuario.inactivate(id).subscribe((resp: any) => {
      if (resp.respuesta === true) {
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
    this.srvUsuario.reactivate(id).subscribe((resp: any) => {
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

  ver(id: string) {
    if (id.trim().length == 0) { return }
    const ref = this.srvModal.open(DetalleUsuario, {
      id: id,
      nombre: "Detalle del usuario"
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
    const ref = this.srvModal.open(AgregarUsuario, {
      id: id,
      nombre: "Editar usuario"
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
    const ref = this.srvModal.open(AgregarUsuario, {
      nombre: "Agregar usuario"
    }, 'max-w-5xl');

    if (ref && ref.instance) {
      ref.instance.guardadoExitoso.subscribe((s: any) => {
        console.log("DATA ::: ", s);
        this.buscar(true); // refresca la tabla
      });
    }
  }
}