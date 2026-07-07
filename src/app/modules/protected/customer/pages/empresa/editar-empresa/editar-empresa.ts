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
import { ConfiguracionService } from '../../../../configuration/services/configuration.service';

import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

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
  tipos: string[];
}

export interface ConfigItem {
  tipoConfiguracion: string;
  nombre: string;
  valor1: string;
}

export interface Config {
  key: string;
  label: string;
  items: ConfigItem[];
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
  private configuracionService = inject(ConfiguracionService);

  private readonly CAMPOS_PASSWORD = new Set([
    '29625587-4A45-495A-B728-203608694C44'
  ]);

  @Output() closeModal = new EventEmitter<boolean>();
  @Input() empresaData?: any;
  @Input() id!: string;
  @Input() nombre: string = 'Editar empresa';

  // Señales de estado
  isHid = signal(false);
  isWallet = signal(false);

  conexionExitosa = signal(false);
  probandoConexion = signal(false);
  cargando = signal(true);

  paises = signal<Pais[]>([]);
  estados = signal<Estado[]>([]);
  ciudades = signal<Ciudad[]>([]);
  configuraciones = signal<ConfiguracionItem[]>([]);

  tabsConfig: TabConfig[] = [];

  configHID: Config[] = [];
  configWallet: Config[] = [];

  groupedConfigs = computed(() =>
    this.tabsConfig.map(tab => ({
      ...tab,
      items: this.configuraciones().filter(c =>
        tab.tipos.includes(c.tipoConfiguracion.toUpperCase())
      ),
    }))
  );

  activeTabHID = signal<string>("");
  activeTabWallet = signal<string>("");

  form!: FormGroup;
  loadingEstados = signal(false);
  loadingCiudades = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.cargarPaises();
    this.cargarDatosEmpresa();

    this.form.get('usaCredencialesHID')?.valueChanges.subscribe(val => {
      this.isHid.set(val);
      this.conexionExitosa.set(false);
    });

    this.form.get('usaCredencialesWallet')?.valueChanges.subscribe(val => {
      this.isWallet.set(val);
    });

    this.configuracionService.settingsHIDGrouped().subscribe({
      next: (n) => {
        if (n.respuesta === true) {
          // console.log("HID ::: ", n.data);
          this.configHID = n.data;
          this.activeTabHID.set(this.configHID[0].key || "");
          // console.log("HID ::: ", JSON.stringify(this.configHID));
        }
      }
    });

    this.configuracionService.settingsWalletGrouped().subscribe({
      next: (n) => {
        if (n.respuesta === true) {
          // console.log("WALLET ::: ", n.data);
          this.configWallet = n.data;
          this.activeTabWallet.set(this.configWallet[0].key || "");
          // console.log("WALLET ::: ", JSON.stringify(this.configWallet));
        }
      }
    });
  }

  // ─── Carga datos desde la API ────────────────────────────────
  private cargarDatosEmpresa(): void {
    this.cargando.set(true);

    forkJoin({
      empresa: this.srvEmpresa.GetWithSettingEncrypted(this.id),
      hid: this.configuracionService.settingsHIDGrouped(),
      wallet: this.configuracionService.settingsWalletGrouped()
    }).subscribe({
      next: ({ empresa: resp, hid, wallet }) => {
        if (hid.respuesta === true) {
          this.configHID = hid.data;
        }
        if (wallet.respuesta === true) {
          this.configWallet = wallet.data;
        }

        if (resp?.respuesta && resp.data) {
          const d = resp.data;
          const usaHid = d.usaCredencialesHID === 1;
          const usaWallet = d.usaCredencialesWallet === 1;

          this.form.patchValue({
            razonSocial: d.razonSocial,
            rfc: d.rfc,
            telefonoEmpresa: d.telefonoEmpresa,
            telefonoMovil: d.telefonoMovil,
            correoElectronico: d.correoElectronico,
            usaCredencialesHID: usaHid,
            usaCredencialesWallet: usaWallet
          });

          this.isHid.set(usaHid);

          this.configHID = this.mergearValores(this.configHID, d.credencialesHID);
          this.configWallet = this.mergearValores(this.configWallet, d.credencialesWallet);

          if (
            d.pais !== undefined && d.pais !== null &&
            d.paisEstado !== undefined && d.paisEstado !== null &&
            d.ciudad !== undefined && d.ciudad !== null
          ) {
            this.form.patchValue({ paisId: d.pais.id });
            this.cargarEstados(d.pais.id, d.paisEstado.id, d.ciudad.id);
          }
        }

        this.activeTabHID.set(this.configHID[0]?.key || "");
        this.activeTabWallet.set(this.configWallet[0]?.key || "");

        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la empresa' });
      }
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
      usaCredencialesWallet: [false],
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
    const hidFueModificado = this.form.get('usaCredencialesHID')?.dirty;
    if (this.isHid() && hidFueModificado && !this.conexionExitosa()) {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Debe probar la conexión HID antes de guardar',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    const formValue = this.form.value;
    const empresa = {
      id: this.id,
      razonSocial: formValue.razonSocial,
      rfc: formValue.rfc,
      telefonoEmpresa: formValue.telefonoEmpresa,
      telefonoMovil: formValue.telefonoMovil,
      correoElectronico: formValue.correoElectronico,
      paisId: formValue.paisId || null,
      estadoId: formValue.estadoId || null,
      ciudadId: formValue.ciudadId || null,
      usaCredencialesHID: this.isHid() ? 1 : 2,
      usaCredencialesWallet: this.isWallet() ? 1 : 2
    };

    const settingEncryptedHID = this.configHID;
    const settingEncryptedWallet = this.configWallet;

    const payload = {
      id: this.id || null,
      empresa: empresa,
      settingEncryptedHID: settingEncryptedHID,
      settingEncryptedWallet: settingEncryptedWallet
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal-theme',
      }
    });
    this.srvEmpresa.update(payload).subscribe({
      next: (resp) => {
        if (resp?.respuesta) {
          Swal.fire({
            icon: 'success', title: '¡Actualizado!', text: resp.mensaje, confirmButtonText: 'Aceptar', allowOutsideClick: false, customClass: {
              popup: 'swal-theme',
            }
          });
          this.closeModal.emit(true);
        } else {
          Swal.close();
          // Swal.fire({ icon: 'warning', title: '¡Advertencia!', text: resp?.mensaje || 'No se pudo guardar', confirmButtonText: 'Aceptar', allowOutsideClick: false });
        }
      },
      error: () => {
        Swal.close();
        // Swal.fire({ icon: 'error', title: '¡Error!', text: 'Error al actualizar la empresa', confirmButtonText: 'Aceptar', allowOutsideClick: false });
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
          Swal.fire({
            icon: 'warning', title: 'Error', text: resp?.mensaje || 'No se pudo crear la tarea', confirmButtonText: 'Aceptar', customClass: {
              popup: 'swal-theme',
            }
          });
        }
      },
      error: () => {
        this.probandoConexion.set(false);
        Swal.fire({
          icon: 'error', title: 'Error', text: 'Error al iniciar la prueba de conexión', confirmButtonText: 'Aceptar', customClass: {
            popup: 'swal-theme',
          }
        });
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
        Swal.fire({
          icon: 'success', title: '¡Éxito!', text: 'La conexión HID se probó exitosamente.', confirmButtonText: 'Aceptar', allowOutsideClick: false, customClass: {
            popup: 'swal-theme',
          }
        });
      } else {
        this.conexionExitosa.set(false);
        Swal.fire({
          icon: 'warning', title: '¡Advertencia!', text: resultado?.Mensaje || 'Error en la conexión', confirmButtonText: 'Aceptar', allowOutsideClick: false, customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });

    this.eventSource.addEventListener('error', (e: MessageEvent) => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      Swal.fire({
        icon: 'warning', title: '¡Advertencia!', text: e.data || 'Error en la tarea', confirmButtonText: 'Aceptar', allowOutsideClick: false, customClass: {
          popup: 'swal-theme',
        }
      });
    });

    this.eventSource.onerror = () => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      Swal.fire({
        icon: 'error', title: '¡Error!', text: 'Se perdió la conexión de monitoreo', confirmButtonText: 'Aceptar', allowOutsideClick: false, customClass: {
          popup: 'swal-theme',
        }
      });
    };
  }

  private cerrarEventSource(): void {
    if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
  }

  // ─── Utilidades ──────────────────────────────────────────────
  actualizarValorConfig(
    tipo: 'HID' | 'WALLET',
    tabKey: string,
    tipoConfiguracion: string,
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;
    const nuevoValor = input.value;

    if (tipo === 'HID') {
      this.form.get('usaCredencialesHID')?.markAsDirty();
      // Crear nuevo array de tabs actualizando solo el item que coincide
      const nuevosTabs = this.configHID.map(tab => {
        if (tab.key === tabKey) {
          return {
            ...tab,
            items: tab.items.map(item =>
              item.tipoConfiguracion === tipoConfiguracion
                ? { ...item, valor1: nuevoValor }
                : item
            )
          };
        }
        return tab;
      });
      this.configHID = nuevosTabs; // Reasignar para detección de cambios
    } else {
      const nuevosTabs = this.configWallet.map(tab => {
        if (tab.key === tabKey) {
          return {
            ...tab,
            items: tab.items.map(item =>
              item.tipoConfiguracion === tipoConfiguracion
                ? { ...item, valor1: nuevoValor }
                : item
            )
          };
        }
        return tab;
      });
      this.configWallet = nuevosTabs;
    }
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
    return this.CAMPOS_PASSWORD.has(tipoConfiguracion.toLocaleUpperCase());
  }

  private mergearValores(template: Config[], valores?: Config[]): Config[] {
    if (!valores || valores.length === 0) return template;
    return template.map(tab => {
      const tabValores = valores.find(v => v.key === tab.key);
      if (!tabValores) return tab;
      return {
        ...tab,
        items: tab.items.map(item => {
          const valorItem = tabValores.items.find(
            vi => vi.tipoConfiguracion.toUpperCase() === item.tipoConfiguracion.toUpperCase()
          );
          return valorItem ? { ...item, valor1: valorItem.valor1 } : item;
        })
      };
    });
  }
}