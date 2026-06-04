import { Component, inject, OnInit, EventEmitter, Output, Input, signal, computed } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputText } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TabsModule } from 'primeng/tabs';
import { Select } from 'primeng/select';

import { MessageService } from 'primeng/api';
import { CiudadService } from '../../../../location/services/ciudad.service';
import { PaisService } from '../../../../location/services/pais.service';
import { PaisEstadoService } from '../../../../location/services/pais-estado.service';

import { EmpresaService, TestConnectionDTO } from '../../../services/empresa.service';
import Swal from 'sweetalert2';

export interface Pais {
  id: string;
  nombre: string;
}

export interface Estado {
  id: string;
  nombre: string;
}

export interface Ciudad {
  id: string;
  nombre: string;
}

export interface ConfiguracionItem {
  tipoConfiguracion: string; // GUID
  nombreParametro: string;
  valor1: string;
  valor2: string;
  valor3: string;
  editable: number;
  lectura: number;
  estado: number;
}

export interface TabConfig {
  key: string;
  label: string;
  tipos: string[]; // lista de GUIDs
}

@Component({
  selector: 'app-editar-empresa',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ToggleSwitchModule,
    TabsModule,
    Select,
    MessageModule,
  ],
  templateUrl: './editar-empresa.html',
  styleUrl: './editar-empresa.css',
  providers: [MessageService]
})
export class EditarEmpresa implements OnInit {
  private eventSource: EventSource | null = null;
  private srvEmpresa = inject(EmpresaService);
  private fb = inject(FormBuilder);
  private ciudadService = inject(CiudadService);
  private paisService = inject(PaisService);
  private paisEstadoService = inject(PaisEstadoService);

  private readonly CAMPOS_PASSWORD = new Set([
    '29625587-4A45-495A-B728-203608694C44'
  ]);

  @Output() closeModal = new EventEmitter<boolean>();
  @Input() empresaData?: any;
  @Input() id!: string;
  @Input() nombre: string = 'Editar empresa';

  isHid = signal(false);
  conexionExitosa = signal(false);
  probandoConexion = signal(false);
  cargando = signal(true);

  paises = signal<Pais[]>([]);
  estados = signal<Estado[]>([]);
  ciudades = signal<Ciudad[]>([]);
  configuraciones = signal<ConfiguracionItem[]>([]);

  tabsConfig: TabConfig[] = [
    {
      key: 'authParams', label: 'Parámetros de autenticación',
      tipos: [
        '742CE98B-684B-4A76-BA0D-CF62621FC3E7',
        'BB617929-5F49-4FDC-8C28-62435505B600',
        '29625587-4A45-495A-B728-203608694C44'
      ]
    },
    {
      key: 'urlConfig', label: 'Configuración de URLS',
      tipos: [
        '60ADEBFE-01B5-497A-828B-CF3801F37495',
        '9B02E35B-A069-4BF5-B9CA-337A59455347',
        '82481E61-4BF5-44CE-B222-3283F7BC02F9',
        '84BA81E1-56C0-4BEE-A57F-D05C13BB544A',
        '5006A3E3-1E78-4341-9253-C2189A7C8974',
        '5F9327BE-42D6-46B9-BF0E-DB7176371A20',
        '9914DCB1-B370-4FC5-8CA3-D5ADD1605AF9',
        'A90006CA-A3E8-4576-A8B0-25B1C5438D55'
      ]
    },
    {
      key: 'apiParams', label: 'Parámetros de API',
      tipos: [
        '40E1A0B9-9144-490E-BF75-7663F3447118',
        '4B6BCEFA-20CA-48B9-92FA-5396C7C94202',
        '788F90F3-0CE3-4E96-B4BA-38DA1CFE105B',
        'FF5E7D45-FCED-4169-B4EB-BA70B43F7BB6'
      ]
    },
    {
      key: 'productKey', label: 'Clave de producto',
      tipos: ['C98EE139-92FB-4E71-94B7-AE258DD1929A']
    },
    {
      key: 'discovery', label: 'Métodos de descubrimiento',
      tipos: [
        'D539FF01-17F0-4C29-9E17-668A5591ACE5',
        '18A0E41D-960E-4F52-9604-D0C773A87F9C',
        '32DC2E87-E6A4-48D7-AF0E-B967ED2BBF49'
      ]
    },
  ];

  groupedConfigs = computed(() =>
    this.tabsConfig.map(tab => ({
      ...tab,
      items: this.configuraciones().filter(c =>
        tab.tipos.includes(c.tipoConfiguracion.toUpperCase())
      ),
    }))
  );

  activeTab = signal<string>(this.tabsConfig[0]?.key || '');
  form!: FormGroup;
  loadingEstados = signal(false);
  loadingCiudades = signal(false);

  // ─── Ciclo de vida ───────────────────────────────────────────
  ngOnInit(): void {
    this.initForm();
    this.cargarPaises();
    this.cargarDatosEmpresa();

    this.form.get('usaCredencialesHID')?.valueChanges.subscribe(val => {
      this.isHid.set(val);
      this.conexionExitosa.set(false);
    });
  }

  // ─── Carga datos desde la API ────────────────────────────────
  private cargarDatosEmpresa(): void {
    this.cargando.set(true);
    this.srvEmpresa.GetWithSetting(this.id).subscribe({
      next: (resp) => {
        if (resp?.respuesta && resp.data) {
          const d = resp.data;
          const usaHid = d.usaCredencialesHID === 1;

          this.form.patchValue({
            razonSocial: d.razonSocial,
            rfc: d.rfc,
            telefonoEmpresa: d.telefonoEmpresa,
            telefonoMovil: d.telefonoMovil,
            correoElectronico: d.correoElectronico,
            usaCredencialesHID: usaHid,
          });

          this.isHid.set(usaHid);
          if (
            d.pais !== undefined && d.pais !== null &&
            d.paisEstado !== undefined && d.paisEstado !== null &&
            d.ciudad !== undefined && d.ciudad !== null
          ) {
            this.form.patchValue({ paisId: d.pais.id });
            this.cargarEstados(d.pais.id, d.paisEstado.id, d.ciudad.id);
          }

          if (usaHid) {
            const configs = this.mapearConfiguraciones(d);
            this.configuraciones.set(configs);
            const tieneCustomerId = configs.find(
              c => c.tipoConfiguracion.toUpperCase() === '742CE98B-684B-4A76-BA0D-CF62621FC3E7'
            );
            setTimeout(() => {
              if (tieneCustomerId?.valor1) this.conexionExitosa.set(true);
            }, 0);
          }
        }
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la empresa' });
      }
    });
  }

  private mapearConfiguraciones(data: any): ConfiguracionItem[] {
    const mapaProps: { prop: string; tipo: string }[] = [
      { prop: 'customerId', tipo: '742CE98B-684B-4A76-BA0D-CF62621FC3E7' },
      { prop: 'clientId', tipo: 'BB617929-5F49-4FDC-8C28-62435505B600' },
      { prop: 'clientSecretOrCertificate', tipo: '29625587-4A45-495A-B728-203608694C44' },
      { prop: 'idpAuthenticationUrl', tipo: '60ADEBFE-01B5-497A-828B-CF3801F37495' },
      { prop: 'apiUrl', tipo: '9B02E35B-A069-4BF5-B9CA-337A59455347' },
      { prop: 'callbackAndEventUrl', tipo: '82481E61-4BF5-44CE-B222-3283F7BC02F9' },
      { prop: 'premiumReportUrl', tipo: '84BA81E1-56C0-4BEE-A57F-D05C13BB544A' },
      { prop: 'credentialManagementURL', tipo: '5006A3E3-1E78-4341-9253-C2189A7C8974' },
      { prop: 'usersURL', tipo: '5F9327BE-42D6-46B9-BF0E-DB7176371A20' },
      { prop: 'eventsURL', tipo: '9914DCB1-B370-4FC5-8CA3-D5ADD1605AF9' },
      { prop: 'transactionURL', tipo: 'A90006CA-A3E8-4576-A8B0-25B1C5438D55' },
      { prop: 'contentType', tipo: '40E1A0B9-9144-490E-BF75-7663F3447118' },
      { prop: 'acceptType', tipo: '4B6BCEFA-20CA-48B9-92FA-5396C7C94202' },
      { prop: 'applicationId', tipo: '788F90F3-0CE3-4E96-B4BA-38DA1CFE105B' },
      { prop: 'applicationVersion', tipo: 'FF5E7D45-FCED-4169-B4EB-BA70B43F7BB6' },
      { prop: 'partNumberField', tipo: 'C98EE139-92FB-4E71-94B7-AE258DD1929A' },
      { prop: 'autoDetectPartNumber', tipo: 'D539FF01-17F0-4C29-9E17-668A5591ACE5' },
      { prop: 'selectPartNumber', tipo: '18A0E41D-960E-4F52-9604-D0C773A87F9C' },
      { prop: 'manualEntryPartNumber', tipo: '32DC2E87-E6A4-48D7-AF0E-B967ED2BBF49' },
    ];

    return mapaProps
      .filter(m => data[m.prop] != null)
      .map(m => {
        const s = data[m.prop];
        return {
          id: s.id ?? '',
          tipoConfiguracion: s.tipoConfiguracion ?? m.tipo,
          nombreParametro: s.nombreParametro ?? '',
          valor1: s.valor1 ?? '',
          valor2: s.valor2 ?? '',
          valor3: s.valor3 ?? '',
          editable: s.editable ?? 1,
          lectura: s.lectura ?? 0,
          estado: s.estado ?? 1,
        };
      });
  }

  // ─── Formulario ──────────────────────────────────────────────
  private initForm(): void {
    this.form = this.fb.group({
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      rfc: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(13), this.validadorLongitudRFC()]],
      telefonoEmpresa: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10), Validators.maxLength(10)]],
      telefonoMovil: ['', [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(10), Validators.maxLength(10)]],
      correoElectronico: ['', [Validators.required, Validators.email]],
      paisId: [null, Validators.required],
      estadoId: [{ value: null, disabled: true }, Validators.required],
      ciudadId: [{ value: null, disabled: true }, Validators.required],
      usaCredencialesHID: [false],
    });

    this.form.get('paisId')?.valueChanges.subscribe(id => {
      this.form.get('estadoId')?.reset({ value: null, disabled: !id });
      this.form.get('ciudadId')?.reset({ value: null, disabled: true });
      this.ciudades.set([]);
      if (id) this.cargarEstados(id);
    });

    this.form.get('estadoId')?.valueChanges.subscribe(id => {
      this.form.get('ciudadId')?.reset({ value: null, disabled: !id });
      this.ciudades.set([]);
      if (id) this.cargarCiudades(id);
    });
  }

  // ─── Catálogos ───────────────────────────────────────────────
  private cargarPaises(): void {
    this.paisService.getAll({}).subscribe({
      next: (b) => { if (b.respuesta) this.paises.set(b.data); }
    });
  }

  private cargarEstados(paisId: string, estadoId?: string, ciudadId?: string): void {
    this.loadingEstados.set(true);
    this.paisEstadoService.getAll({ PaisId: paisId, PageSize: 1000, PageNumber: 1 }).subscribe({
      next: (b) => {
        if (b.respuesta) {
          this.estados.set(b.data);
          this.form.get('estadoId')?.enable();
          if (estadoId) {
            this.form.patchValue({ estadoId });
            if (ciudadId) this.cargarCiudades(estadoId, ciudadId);
          }
        }
        this.loadingEstados.set(false);
      },
      error: () => { this.loadingEstados.set(false); }
    });
  }

  private cargarCiudades(estadoId: string, ciudadId?: string): void {
    this.loadingCiudades.set(true);
    this.ciudadService.getAll({ EstadoId: estadoId, PageSize: 1000, PageNumber: 1 }).subscribe({
      next: (b) => {
        if (b.respuesta) {
          this.ciudades.set(b.data);
          this.form.get('ciudadId')?.enable();
          if (ciudadId) this.form.patchValue({ ciudadId });
        }
        this.loadingCiudades.set(false);
      },
      error: () => { this.loadingCiudades.set(false); }
    });
  }

  // ─── Guardar ─────────────────────────────────────────────────
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isHid() && !this.conexionExitosa()) {
      Swal.fire({ icon: 'warning', title: '¡Atención!', text: 'Debe probar la conexión HID antes de guardar', confirmButtonText: 'Aceptar', allowOutsideClick: false });
      return;
    }

    const fv = this.form.value;
    const payload = {
      id: this.id,
      empresa: {
        id: this.id,
        razonSocial: fv.razonSocial,
        rfc: fv.rfc,
        telefonoEmpresa: fv.telefonoEmpresa,
        telefonoMovil: fv.telefonoMovil,
        correoElectronico: fv.correoElectronico,
        paisId: fv.paisId || null,
        estadoId: fv.estadoId || null,
        ciudadId: fv.ciudadId || null,
        usaCredencialesHID: this.isHid() ? 1 : 2
      },
      configuraciones: this.configuraciones().map((c: any) => ({
        id: c.id,
        tipoConfiguracion: c.tipoConfiguracion,
        nombreParametro: c.nombreParametro,
        valor1: c.valor1,
        valor2: c.valor2,
        valor3: c.valor3,
        editable: c.editable,
        lectura: c.lectura,
        estado: c.estado
      }))
    };

    this.srvEmpresa.update(payload, this.id,).subscribe({
      next: (resp) => {
        if (resp?.respuesta) {
          Swal.fire({ icon: 'success', title: '¡Guardado!', text: resp.mensaje, confirmButtonText: 'Aceptar', allowOutsideClick: false });
          this.closeModal.emit(true);
        } else {
          Swal.fire({ icon: 'warning', title: '¡Advertencia!', text: resp?.mensaje || 'No se pudo guardar', confirmButtonText: 'Aceptar', allowOutsideClick: false });
        }
      },
      error: () => {
        Swal.fire({ icon: 'error', title: '¡Error!', text: 'Error al actualizar la empresa', confirmButtonText: 'Aceptar', allowOutsideClick: false });
      }
    });
  }

  cerrar(): void {
    this.closeModal.emit(false);
  }

  // ─── Probar conexión HID ─────────────────────────────────────
  probarConexion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const configsRaw = this.configuraciones();
    const testData: TestConnectionDTO = {
      CustomerId: configsRaw.find(c => c.tipoConfiguracion.toUpperCase() === '742CE98B-684B-4A76-BA0D-CF62621FC3E7')?.valor1 || '',
      ClientId: configsRaw.find(c => c.tipoConfiguracion.toUpperCase() === 'BB617929-5F49-4FDC-8C28-62435505B600')?.valor1 || '',
      ClientSecretOrCertificate: configsRaw.find(c => c.tipoConfiguracion.toUpperCase() === '29625587-4A45-495A-B728-203608694C44')?.valor1 || '',
      IdpAuthenticationUrl: configsRaw.find(c => c.tipoConfiguracion.toUpperCase() === '60ADEBFE-01B5-497A-828B-CF3801F37495')?.valor1 || '',
    };

    this.probandoConexion.set(true);
    this.srvEmpresa.testConnection(testData).subscribe({
      next: (resp) => {
        if (resp?.respuesta && resp.data?.id) {
          this.iniciarDialogoProgreso(resp.data.id);
        } else {
          this.probandoConexion.set(false);
          Swal.fire({ icon: 'warning', title: 'Error', text: resp?.mensaje || 'No se pudo crear la tarea', confirmButtonText: 'Aceptar' });
        }
      },
      error: () => {
        this.probandoConexion.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al iniciar la prueba de conexión', confirmButtonText: 'Aceptar' });
      }
    });
  }

  private iniciarDialogoProgreso(taskId: string): void {
    Swal.close();
    Swal.fire({
      title: 'Probando conexión HID',
      html: `
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status"></div>
          <p id="sseStatus">Conectando con servicio de monitoreo...</p>
          <div class="progress mt-3" style="height: 10px;">
            <div class="progress-bar progress-bar-striped progress-bar-animated"
                 role="progressbar" style="width: 0%" id="sseProgress"></div>
          </div>
          <small class="text-muted mt-2 d-block"><span id="sseMessage">Estableciendo conexión...</span></small>
        </div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      willOpen: () => { this.iniciarMonitoreoSSE(taskId); }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.cerrarEventSource();
        this.probandoConexion.set(false);
      }
    });
  }

  private iniciarMonitoreoSSE(taskId: string): void {
    const sseUrl = this.srvEmpresa.getTaskUpdatesUrl(taskId);
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.addEventListener('progress', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const pb = document.getElementById('sseProgress');
      const st = document.getElementById('sseStatus');
      const mg = document.getElementById('sseMessage');
      if (pb) pb.style.width = `${data.progress}%`;
      if (st) st.textContent = data.status;
      if (mg) mg.textContent = `Progreso: ${data.progress}%`;
    });

    this.eventSource.addEventListener('completed', (e: MessageEvent) => {
      this.cerrarEventSource();
      const resultado = JSON.parse(e.data).result;
      Swal.close();
      this.probandoConexion.set(false);
      if (resultado?.Respuesta && resultado?.Codigo === 200) {
        this.conexionExitosa.set(true);
        Swal.fire({ icon: 'success', title: '¡Éxito!', text: 'La conexión HID se probó exitosamente.', confirmButtonText: 'Aceptar', allowOutsideClick: false });
      } else {
        this.conexionExitosa.set(false);
        Swal.fire({ icon: 'warning', title: '¡Advertencia!', text: resultado?.Mensaje || 'Error en la conexión', confirmButtonText: 'Aceptar', allowOutsideClick: false });
      }
    });

    this.eventSource.addEventListener('error', (e: MessageEvent) => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      Swal.fire({ icon: 'warning', title: '¡Advertencia!', text: e.data || 'Error en la tarea', confirmButtonText: 'Aceptar', allowOutsideClick: false });
    });

    this.eventSource.onerror = () => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      Swal.fire({ icon: 'error', title: '¡Error!', text: 'Se perdió la conexión de monitoreo', confirmButtonText: 'Aceptar', allowOutsideClick: false });
    };
  }

  private cerrarEventSource(): void {
    if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
  }

  // ─── Utilidades ──────────────────────────────────────────────
  actualizarValorConfig(tabKey: string, tipoConfiguracion: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.configuraciones.update(configs =>
      configs.map(c => c.tipoConfiguracion === tipoConfiguracion ? { ...c, valor1: input.value } : c)
    );
    this.conexionExitosa.set(false);
  }

  convertirAMayusculas(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) control.setValue(control.value.toUpperCase(), { emitEvent: false });
  }

  soloNumeros(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) control.setValue(control.value.replace(/\D/g, ''), { emitEvent: false });
  }

  validadorLongitudRFC(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const longitud = (control.value || '').length;
      if (longitud === 0) return null;
      return (longitud === 12 || longitud === 13) ? null : { longitudRFC: { actual: longitud } };
    };
  }

  esCampoPassword(tipoConfiguracion: string): boolean {
    return this.CAMPOS_PASSWORD.has(tipoConfiguracion);
  }
}