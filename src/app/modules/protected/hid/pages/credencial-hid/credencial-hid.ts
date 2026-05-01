import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ModalService } from '../../../../../shared/services/modal.service';
import { UsuarioHIDService } from '../../services/usuario-hid.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { CredencialHIDService } from '../../services/credencial-hid.service';

import { DataTable, DataTableRegistroCampo } from '../../../../../shared/clases/table-dynamic.clase';

import { IDataTable, IDataTableRegistroCampo, IDTRCampoPropiedad } from '../../../../../shared/interfaces/table-dynamic.interface';

import { TableDynamic } from '../../../../../shared/components/table-dynamic/table-dynamic';

import { IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

import { AutocEstado } from '../../../../../shared/components/autoc-estado/autoc-estado';

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
    AutocEstado
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
    this.tablaResultados.setTieneAcciones(true, true, true, true);
    
    this.tablaResultados.addTitulo('Tipo de credencial', true, true, true, true, true, 3, 3, 2);
    this.tablaResultados.addTitulo('Dispositivo HID', true, true, true, true, true, 3, 3, 2);
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
          this.srvUsuarioHID.getById(registro.id).subscribe((dataById: any) => {
            if (dataById.respuesta === true) {
              let strId: string = registro.id ? registro.id : '';
              let strLicencia: string = "";
              if (registro.licenciaHID !== undefined && registro.licenciaHID !== null && registro.licenciaHID !== "") {
                strLicencia = registro.licenciaHID.nombre;
              }
              let strTipoCredencial: string = registro.tipoCredencial;
              let strDispositivoHID: string = "";
              if(registro.dipositivosHID !== null && registro.dipositivosHID !== undefined && registro.dipositivosHID !== ""){
strDispositivoHID = registro.dipositivosHID.nombreDispositivo;
              }
              let strEstadoHID: string = registro.statusDescripcion;
              let strEstadoInvitacion: string = registro.descripcionEstadoInvitacion;
              console.log("wWE ", strEstadoInvitacion);
              let listEstadoInvitacion: IDTRCampoPropiedad[] = [
                { condicion: 'Pendiente', aplicar: DataTableRegistroCampo.COLOR_BADGE_WARNING },
                { condicion: 'Cancelado', aplicar: DataTableRegistroCampo.COLOR_BADGE_SECONDARY },
                { condicion: 'Reconocido', aplicar: DataTableRegistroCampo.COLOR_BADGE_PRIMARY },
                { condicion: 'Eliminado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DANGER },
                { condicion: 'Sin estado', aplicar: DataTableRegistroCampo.COLOR_BADGE_DARK }
              ];

              let campos: IDataTableRegistroCampo[] = [];
              let campoTipoCredencial: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoDispositivoHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoEmail: IDataTableRegistroCampo = new DataTableRegistroCampo();
              let campoEstadoHID: IDataTableRegistroCampo = new DataTableRegistroCampo();
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

              campoTipoCredencial.setValores(strTipoCredencial, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 4, 3, 2);
              // campoNombre.setValores(strNombre, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 2, 2, 2);
              campoDispositivoHID.setValores(strDispositivoHID, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
              campoEstadoHID.setValores(strEstadoHID, DataTableRegistroCampo.CAMPO_TEXTO, true, true, true, true, true, 3, 3, 2);
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

              // // campos que aparecerán en línea
              // campos.push(campoNombre);
              // campos.push(campoCorreo);
              // campos.push(campoCorreoSecundario);

              // // campos que aparecerán en detalle
              // 
              campos.push(campoTipoCredencial);
              campos.push(campoDispositivoHID);
              campos.push(campoEmail);
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
  }

  reactivar(id: string) {
    if (id.trim().length == 0) { return }
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