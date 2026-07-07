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
import { ConfiguracionService } from '../../../../configuration/services/configuration.service';

import { EmpresaService } from '../../../services/empresa.service';
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
  tipoConfiguracion: string;
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
  items: string[];
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
  selector: 'app-agregar-empresa',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    ToggleSwitchModule,
    TabsModule,
    Select,
    MessageModule,
  ],
  templateUrl: './agregar-empresa.html',
  styleUrl: './agregar-empresa.css',
  providers: [MessageService]
})
export class AgregarEmpresa implements OnInit {
  private eventSource: EventSource | null = null;

  private srvEmpresa = inject(EmpresaService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private ciudadService = inject(CiudadService);
  private paisService = inject(PaisService);
  private paisEstadoService = inject(PaisEstadoService);
  private configuracionService = inject(ConfiguracionService);

  private readonly CAMPOS_PASSWORD = new Set([
    '29625587-4A45-495A-B728-203608694C44'
  ]);

  @Output() closeModal = new EventEmitter<boolean>();
  @Input() empresaData?: any;
  @Input() nombre: string = 'Agregar empresa';

  // Señales de estado
  isHid = signal(false);
  isWallet = signal(false);
  conexionExitosa = signal(false);
  probandoConexion = signal(false);

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
      items: this.configuraciones().filter(c => tab.items.includes(c.tipoConfiguracion)),
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
    this.form.get('usaCredencialesHID')?.valueChanges.subscribe(val => {
      this.isHid.set(val);
      if (!val) this.conexionExitosa.set(false);
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

  // ------------------------------------------------------------
  // Formulario y catálogos (sin cambios relevantes)
  // ------------------------------------------------------------
  private initForm(): void {
    this.form = this.fb.group({
      razonSocial: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      rfc: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(13),
        this.validadorLongitudRFC()
      ]],
      telefonoEmpresa: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      telefonoMovil: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
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

  private cargarPaises(): void {
    this.paisService.getAll({}).subscribe({
      next: (b) => {
        if (b.respuesta === true) {
          this.paises.set(b.data);
        }
      }
    });
  }

  private cargarEstados(paisId: string): void {
    this.loadingEstados.set(true);
    this.paisEstadoService.getAll({ PaisId: paisId, PageSize: 1000, PageNumber: 1 }).subscribe({
      next: (b) => {
        if (b.respuesta === true) {
          this.estados.set(b.data);
          this.form.get('estadoId')?.enable();
        } else {
          this.estados.set([]);
        }
        this.loadingEstados.set(false);
      },
      error: () => {
        this.estados.set([]);
        this.loadingEstados.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los estados' });
      }
    });
  }

  private cargarCiudades(estadoId: string): void {
    this.loadingCiudades.set(true);
    this.ciudadService.getAll({ EstadoId: estadoId, PageSize: 1000, PageNumber: 1 }).subscribe({
      next: (b) => {
        if (b.respuesta === true) {
          this.ciudades.set(b.data);
          this.form.get('ciudadId')?.enable();
        } else {
          this.ciudades.set([]);
        }
        this.loadingCiudades.set(false);
      },
      error: () => {
        this.ciudades.set([]);
        this.loadingCiudades.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las ciudades' });
      }
    });
  }

  validadorLongitudRFC(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor: string = control.value || '';
      const longitud = valor.length;
      if (longitud === 0) return null; // se maneja con required
      if (longitud === 12 || longitud === 13) return null;
      return { longitudRFC: { actual: longitud, requerida: '12 o 13 caracteres' } };
    };
  }

  // ------------------------------------------------------------
  // ✅ NUEVO: Probar conexión real usando el servicio
  // ------------------------------------------------------------ 
  probarConexion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: `Complete todos los campos requeridos.`,
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    console.log("REQUEST ::: ", this.configHID);
    console.log("REQUEST ::: ", JSON.stringify(this.configHID));

    const obtenerValor = (tipo: string): string => {
      for (const grupo of this.configHID) {
        const item = grupo.items.find(i => i.tipoConfiguracion === tipo);
        if (item) return item.valor1;
      }
      return '';
    };

    const testData = {
      CustomerId: obtenerValor('742ce98b-684b-4a76-ba0d-cf62621fc3e7'),
      ClientId: obtenerValor('bb617929-5f49-4fdc-8c28-62435505b600'),
      ClientSecretOrCertificate: obtenerValor('29625587-4a45-495a-b728-203608694c44'),
      IdpAuthenticationUrl: obtenerValor('60adebfe-01b5-497a-828b-cf3801f37495')
    };

    const camposRequeridos: { campo: keyof typeof testData; nombreMostrar: string }[] = [
      { campo: 'CustomerId', nombreMostrar: 'Customer ID' },
      { campo: 'ClientId', nombreMostrar: 'Client ID' },
      { campo: 'ClientSecretOrCertificate', nombreMostrar: 'Client secret / Client certificate' }
    ];

    for (const { campo, nombreMostrar } of camposRequeridos) {
      const valor = testData[campo]?.trim();
      if (!valor || valor === '') {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: `El campo "${nombreMostrar}" es obligatorio para probar la conexión.`,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCloseButton: false,
          customClass: {
            popup: 'swal-theme',
          }
        });
        return;
      }
    }
    console.log('REQUEST BODY:', testData);

    this.probandoConexion.set(true);
    this.srvEmpresa.testConnection(testData).subscribe({
      next: (resp) => {
        if (resp?.respuesta && resp.data?.id) {
          // Abre el diálogo de progreso con SweetAlert2 y comienza el monitoreo
          this.iniciarDialogoProgreso(resp.data.id);
        } else {
          this.probandoConexion.set(false);
          this.messageService.add({ severity: 'warn', summary: 'Error', detail: resp?.mensaje || 'No se pudo crear la tarea' });
        }
      },
      error: () => {
        this.probandoConexion.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al iniciar la prueba de conexión' });
      }
    });
  }

  private iniciarDialogoProgreso(taskId: string): void {
    // Cerrar cualquier diálogo previo
    Swal.close();

    Swal.fire({
      title: 'Probando conexión HID',
      html: `
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p id="sseStatus">Conectando con servicio de monitoreo...</p>
        <div class="progress mt-3" style="height: 10px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated"
               role="progressbar"
               style="width: 0%"
               id="sseProgress">
          </div>
        </div>
        <small class="text-muted mt-2 d-block">
          <span id="sseMessage">Estableciendo conexión en tiempo real...</span>
        </small>
      </div>
    `,
      allowOutsideClick: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      willOpen: () => {
        this.iniciarMonitoreoSSE(taskId);
      }
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
      const progressBar = document.getElementById('sseProgress');
      const statusEl = document.getElementById('sseStatus');
      const messageEl = document.getElementById('sseMessage');
      if (progressBar) progressBar.style.width = `${data.progress}%`;
      if (statusEl) statusEl.textContent = data.status;
      if (messageEl) messageEl.textContent = `Progreso: ${data.progress}%`;
    });

    this.eventSource.addEventListener('completed', (e: MessageEvent) => {
      this.cerrarEventSource();
      const data = JSON.parse(e.data);
      const resultado = data.result;

      Swal.close();
      this.probandoConexion.set(false);

      if (resultado?.Respuesta && resultado?.Codigo === 200) {
        this.conexionExitosa.set(true);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La conexión HID se probó exitosamente.',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: 'swal-theme',
          }
        });
      } else {
        this.conexionExitosa.set(false);
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: resultado?.Mensaje || 'Error en la conexión',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });

    this.eventSource.addEventListener('error', (e: MessageEvent) => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      const msg = e.data || 'Error en la tarea';
      Swal.fire({
        icon: 'warning',
        title: '¡Advertencia!',
        text: msg,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
    });

    this.eventSource.onerror = () => {
      this.cerrarEventSource();
      Swal.close();
      this.probandoConexion.set(false);
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Se perdió la conexión de monitoreo',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
    };
  }

  private cerrarEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  convertirAMayusculas(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      const valor = control.value.toUpperCase();
      control.setValue(valor, { emitEvent: false });
    }
  }

  // ------------------------------------------------------------
  // Guardar (mantiene lógica original, emite true al guardar)
  // ------------------------------------------------------------
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.isHid() && !this.conexionExitosa()) {
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

    const configuraciones = this.configuraciones().map(c => ({
      tipoConfiguracion: c.tipoConfiguracion,
      nombreParametro: c.nombreParametro,
      valor1: c.valor1,
      valor2: c.valor2,
      valor3: c.valor3,
      editable: c.editable,
      lectura: c.lectura,
      estado: c.estado
    }));

    const settingEncryptedHID = JSON.stringify(this.configHID);
    const settingEncryptedWallet = JSON.stringify(this.configWallet);

    const payload = {
      id: this.empresaData?.id || null,
      empresa: empresa,
      settingEncryptedHID: settingEncryptedHID,
      settingEncryptedWallet: settingEncryptedWallet
    };
    // console.log("JSON ::: ", payload);
    // console.log("JSON ::: ", JSON.stringify(payload));

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

    this.srvEmpresa.withSettingEncrypted(payload).subscribe({
      next: (resp: any) => {
        // console.log("REQUEST ::: ", resp);
        Swal.close(); // cierra el loading
        if (resp?.respuesta) {
          Swal.fire({ icon: 'success', title: '¡Guardado!', text: resp.mensaje, confirmButtonText: 'Aceptar', allowOutsideClick: false });
          this.closeModal.emit(true);
        } else {
          Swal.close();
        }
      },
      error: (err: any) => {
        Swal.close();
      }
    });
  }

  cerrar(): void {
    this.closeModal.emit(false);
  }

  actualizarValorConfig(
    tipo: 'HID' | 'WALLET',
    tabKey: string,
    tipoConfiguracion: string,
    event: Event
  ): void {
    const input = event.target as HTMLInputElement;
    const nuevoValor = input.value;

    if (tipo === 'HID') {
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

  soloNumeros(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      let valor = control.value.replace(/\D/g, '');
      control.setValue(valor, { emitEvent: false });
    }
  }

  esCampoPassword(tipoConfiguracion: string): boolean {
    return this.CAMPOS_PASSWORD.has(tipoConfiguracion.toLocaleUpperCase());
  }

  onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const lowerValue = input.value.toLowerCase();

    if (input.value !== lowerValue) {
      input.value = lowerValue;

      // sincroniza con el FormControl
      this.form.get('correoElectronico')?.setValue(lowerValue, { emitEvent: false });
    }
  }
}