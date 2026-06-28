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
  conexionExitosa = signal(false);
  probandoConexion = signal(false);

  paises = signal<Pais[]>([]);
  estados = signal<Estado[]>([]);
  ciudades = signal<Ciudad[]>([]);

  configuraciones = signal<ConfiguracionItem[]>([]);

  tabsConfig: TabConfig[] = [];

  groupedConfigs = computed(() =>
    this.tabsConfig.map(tab => ({
      ...tab,
      items: this.configuraciones().filter(c => tab.items.includes(c.tipoConfiguracion)),
    }))
  );

  activeTab = signal<string>("");

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

    this.configuracionService.settingsGroupedType().subscribe({
      next: (n) => {
        if (n.respuesta === true) {
          this.tabsConfig = n.data.map((a: any) => {
            return {
              key: a.key,
              label: a.label,
              items: a.items.map((b: any) => b.tipoConfiguracion.toUpperCase())
            } as any;
          });

          this.activeTab.set(this.tabsConfig[0].key || "");
          this.configuracionService.settingsGrouped().subscribe({
            next: (x) => {
              if (x.respuesta === true) {
                console.log("X ::: ", x);
                this.configuraciones.set(x.data.map((m: any) => {
                  return {
                    tipoConfiguracion: m.tipoConfiguracion.toUpperCase(),
                    nombreParametro: m.nombreParametro,
                    valor1: m.valor1,
                    valor2: m.valor2,
                    valor3: m.valor3,
                    editable: m.editable,
                    lectura: m.lectura,
                    estado: m.estado
                  } as any;
                }));
              }
            }
          });
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
  // probarConexion(): void {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Complete todos los campos requeridos' });
  //     return;
  //   }

  //   const configsRaw = this.configuraciones();
  //   const testData: TestConnectionDTO = {
  //     CustomerId: configsRaw.find(c => c.tipoConfiguracion === '742CE98B-684B-4A76-BA0D-CF62621FC3E7')?.valor1 || '',
  //     ClientId: configsRaw.find(c => c.tipoConfiguracion === 'BB617929-5F49-4FDC-8C28-62435505B600')?.valor1 || '',
  //     ClientSecretOrCertificate: configsRaw.find(c => c.tipoConfiguracion === '29625587-4A45-495A-B728-203608694C44')?.valor1 || '',
  //     IdpAuthenticationUrl: configsRaw.find(c => c.tipoConfiguracion === '60ADEBFE-01B5-497A-828B-CF3801F37495')?.valor1 || '',
  //   };

  //   this.probandoConexion.set(true);

  //   this.srvEmpresa.testConnection(testData).subscribe({
  //     next: (resp) => {
  //       if (resp?.respuesta && resp.data?.id) {
  //         this.monitorearTarea(resp.data.id);
  //       } else {
  //         this.probandoConexion.set(false);
  //         this.messageService.add({
  //           severity: 'warn',
  //           summary: 'Error',
  //           detail: resp?.mensaje || 'No se pudo crear la tarea'
  //         });
  //       }
  //     },
  //     error: () => {
  //       this.probandoConexion.set(false);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Error al iniciar la prueba de conexión'
  //       });
  //     }
  //   });
  // }
  probarConexion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Complete todos los campos requeridos' });
      return;
    }

    const configsRaw = this.configuraciones();
    const testData: TestConnectionDTO = {
      CustomerId: configsRaw.find(c => c.tipoConfiguracion === '742CE98B-684B-4A76-BA0D-CF62621FC3E7')?.valor1 || '',
      ClientId: configsRaw.find(c => c.tipoConfiguracion === 'BB617929-5F49-4FDC-8C28-62435505B600')?.valor1 || '',
      ClientSecretOrCertificate: configsRaw.find(c => c.tipoConfiguracion === '29625587-4A45-495A-B728-203608694C44')?.valor1 || '',
      IdpAuthenticationUrl: configsRaw.find(c => c.tipoConfiguracion === '60ADEBFE-01B5-497A-828B-CF3801F37495')?.valor1 || '',
    };

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
          allowEscapeKey: false
        });
      } else {
        this.conexionExitosa.set(false);
        Swal.fire({
          icon: 'warning',
          title: '¡Advertencia!',
          text: resultado?.Mensaje || 'Error en la conexión',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false
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
        allowEscapeKey: false
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
        allowEscapeKey: false
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
  // ✅ NUEVO: Monitoreo SSE de la tarea
  // ------------------------------------------------------------
  private monitorearTarea(taskId: string): void {
    const sseUrl = this.srvEmpresa.getTaskUpdatesUrl(taskId);
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('progress', (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('Progreso:', data.progress, data.status);
      // Opcional: actualizar barra de progreso
    });

    eventSource.addEventListener('completed', (e: MessageEvent) => {
      eventSource.close();
      const data = JSON.parse(e.data);
      const resultado = data.result; // TestConnectionRespDTO
      console.log("monitoreo ::: ", resultado)
      this.probandoConexion.set(false);

      if (resultado?.respuesta && resultado?.codigo === 200) {
        this.conexionExitosa.set(true);
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Éxito',
        //   detail: 'Conexión HID probada exitosamente'
        // });
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Conexión HID probada exitosamente',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCloseButton: false
        });
      } else {
        this.conexionExitosa.set(false);
        this.messageService.add({
          severity: 'warn',
          summary: 'Falló',
          detail: resultado?.mensaje || 'Error en la conexión'
        });
      }
    });

    eventSource.addEventListener('error', (e: MessageEvent) => {
      console.log('[SSE] Evento error recibido:', e.data);
      eventSource.close();
      this.probandoConexion.set(false);
      const msg = e.data || 'Error en la tarea';
      // this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      Swal.fire({
        icon: 'warning',
        title: '¡Advertencia!',
        text: msg,
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false
      });
      // eventSource.close();
      // this.probandoConexion.set(false);
      // let msg = 'Error en la tarea';
      // try {
      //   const data = JSON.parse(e.data);
      //   msg = data.message || msg;
      // } catch {}
      // this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
    });

    eventSource.onerror = () => {
      eventSource.close();
      this.probandoConexion.set(false);
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Se perdió la conexión de monitoreo'
      // });
      Swal.fire({
        icon: 'error',
        title: '¡Error!',
        text: 'Se perdió la conexión de monitoreo',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false
      });
    };
  }

  // ------------------------------------------------------------
  // Guardar (mantiene lógica original, emite true al guardar)
  // ------------------------------------------------------------
  guardar(): void {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }
    // if (this.isHid() && !this.conexionExitosa()) {
    //   this.messageService.add({
    //     severity: 'warn',
    //     summary: 'Atención',
    //     detail: 'Debe probar la conexión HID antes de guardar'
    //   });
    //   return;
    // }

    // const empresa = { ...this.form.value, usaCredencialesHID: this.isHid() ? 1 : 2 };
    // const payload = { Empresa: empresa, Configuraciones: this.configuraciones() };
    // console.log('Guardando:', payload);
    // this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Empresa creada correctamente' });
    // this.closeModal.emit(true);   // ✅ notifica éxito al padre

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
        showCloseButton: false
      });
      return;
    }

    // const empresa = { ...this.form.value, usaCredencialesHID: this.isHid() ? 1 : 2 };
    // const payload = { Empresa: empresa, Configuraciones: this.configuraciones() };

    const formValue = this.form.value;

    // Construir el objeto empresa con los nombres exactos del DTO (camelCase)
    const empresa = {
      razonSocial: formValue.razonSocial,
      rfc: formValue.rfc,
      telefonoEmpresa: formValue.telefonoEmpresa,
      telefonoMovil: formValue.telefonoMovil,
      correoElectronico: formValue.correoElectronico,
      paisId: formValue.paisId || null,          // null en lugar de Guid vacío
      estadoId: formValue.estadoId || null,
      ciudadId: formValue.ciudadId || null,
      usaCredencialesHID: this.isHid() ? 1 : 2
    };

    const configuraciones = this.configuraciones().map(c => ({
      // solo los campos que el backend espera (sin campos de entidad)
      tipoConfiguracion: c.tipoConfiguracion,
      nombreParametro: c.nombreParametro,
      valor1: c.valor1,
      valor2: c.valor2,
      valor3: c.valor3,
      editable: c.editable,
      lectura: c.lectura,
      estado: c.estado
    }));

    const payload = { empresa, configuraciones };
    console.log("JSON ::: ", payload);
    this.srvEmpresa.create(payload).subscribe({
      next: (resp) => {
        if (resp?.respuesta) {
          Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: resp.mensaje,
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false
          });
          this.closeModal.emit(true);
        } else {
          // Swal.fire({
          //   icon: 'warning',
          //   title: '¡Advertencia!',
          //   text: resp?.mensaje || 'No se pudo guardar',
          //   confirmButtonText: 'Aceptar',
          //   allowOutsideClick: false,
          //   allowEscapeKey: false,
          //   showCloseButton: false
          // });
        }
      },
      error: () => {
        // Swal.fire({
        //   icon: 'error',
        //   title: '¡Error!',
        //   text: 'Error al guardar la empresa',
        //   confirmButtonText: 'Aceptar',
        //   allowOutsideClick: false,
        //   allowEscapeKey: false,
        //   showCloseButton: false
        // });
      }
    });

  }

  cerrar(): void {
    this.closeModal.emit(false);
  }

  actualizarValorConfig(tabKey: string, tipoConfiguracion: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.configuraciones.update(configs =>
      configs.map(c => c.tipoConfiguracion === tipoConfiguracion ? { ...c, valor1: input.value } : c)
    );
  }

  soloNumeros(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      let valor = control.value.replace(/\D/g, '');
      control.setValue(valor, { emitEvent: false });
    }
  }

  esCampoPassword(tipoConfiguracion: string): boolean {
    return this.CAMPOS_PASSWORD.has(tipoConfiguracion);
  }
}