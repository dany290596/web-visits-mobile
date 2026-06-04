import { Component, EventEmitter, OnDestroy, OnInit, Output, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

import { MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../configuration/services/configuration.service';

import { IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import { environment } from '../../../../../../environments/environment';

import { EmailWalletConfig, PREVIEW_DATA_DEFAULT, EmailWalletPreviewData } from '../../interfaces/email-wallet-config.interface';
import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';

import { EmailWalletConfigService } from '../../../../protected/parameterization/services/email-wallet-config.service';
import { StorageService } from '../../../../auth/services/storage.service';
import { EmailTemplateService } from '../../services/email-template.service';

import { filter, take } from 'rxjs';

import Swal from 'sweetalert2';

export type PreviewClient = 'gmail' | 'outlook' | 'apple';

@Component({
  selector: 'app-plantilla-correo-hid',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TabsModule,
    ButtonModule,
    InputMaskModule,
    InputNumberModule,
    ToggleSwitchModule,
    CardModule,
    ToastModule,
    SkeletonModule,
    DividerModule,
    TagModule,
  ],
  providers: [MessageService],
  templateUrl: './plantilla-correo-hid.html',
  styleUrl: './plantilla-correo-hid.css',
})
export class PlantillaCorreoHid implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(EmailWalletConfigService);
  private readonly toast = inject(MessageService);

  private srvStorage = inject(StorageService);
  private srvEmailTemplate = inject(EmailTemplateService);

  userData!: IUsuarioAutenticado;

  // ── Estado ─────────────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly isDirty = signal(false);              // indicador "cambios sin guardar"
  readonly activeClient = signal<PreviewClient>('gmail');

  // Indica si estamos en modo dummy (para mostrar badge informativo en la UI)
  readonly isDummy = environment.useDummyData;

  // Datos de muestra del preview (no van a BD)
  readonly previewData = signal<EmailWalletPreviewData>(PREVIEW_DATA_DEFAULT);

  readonly currentYear = new Date().getFullYear();

  readonly previewClients: { key: PreviewClient; label: string; icon: string }[] = [
    { key: 'gmail', label: 'Gmail', icon: 'pi pi-google' },
    { key: 'outlook', label: 'Outlook', icon: 'pi pi-microsoft' },
    { key: 'apple', label: 'Apple Mail', icon: 'pi pi-apple' },
  ];

  /** true mientras se espera el preview de la API */
  readonly loadingPreview = signal(false);

  form!: FormGroup;

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
      });

    this.buildForm();
    this.loadConfig();
    // Marca dirty cuando el usuario toca cualquier campo
    this.form.valueChanges.subscribe(() => {
      if (this.form.dirty) this.isDirty.set(true);
    });
  }

  // ── Público ────────────────────────────────────────────────────────────────
  setClient(client: PreviewClient): void {
    this.activeClient.set(client);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const config = this.form.getRawValue() as EmailWalletConfig;
    const companyId = this.userData?.empresaId;
    const usuarioId = this.userData?.usuarioId;

    if (usuarioId === undefined || usuarioId === null || usuarioId === null) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'El usuario es requerido.',
        icon: 'warning',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: { popup: 'swal-theme' }
      }).then(() => {
      });
      return;
    }

    if (companyId === undefined || companyId === null || companyId === null) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'La empresa es requerida.',
        icon: 'warning',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: { popup: 'swal-theme' }
      }).then(() => {
      });
      return;
    }

    this.saving.set(true);

    // ── Paso 1: construir el HTML con los valores actuales del form ──────────
    const templateHtml = this.srvEmailTemplate.buildTemplateHtml(config);

    console.log("HTML ::: ", templateHtml);

    // ── Paso 2: ejecutar ambas llamadas en paralelo ──────────────────────────
    forkJoin({
      // Guarda los campos individuales (lógica original, ej: asunto, remitente, etc.)
      // campos: this.svc.saveConfig(config, usuarioId),
      // Guarda el HTML completo en Valor1 del registro EMAIL_TEMPLATE_HID
      plantilla: this.srvEmailTemplate.saveTemplate(companyId, usuarioId, templateHtml),
    }).subscribe({
      next: ({ plantilla }) => {
        this.saving.set(false);

        // const errorCampos = campos.some(ok => !ok);
        const errorPlantilla = !plantilla.respuesta;

        // if (errorCampos || errorPlantilla) {
        //   // Guardado parcial
        //   const detalle = [
        //     errorCampos ? 'campos del formulario' : null,
        //     errorPlantilla ? 'plantilla HTML' : null,
        //   ]
        //     .filter(Boolean)
        //     .join(' y ');

        //   this.toast.add({
        //     severity: 'warn',
        //     summary: 'Guardado parcial',
        //     detail: `No se pudo guardar: ${detalle}. Intenta de nuevo.`,
        //     life: 5000,
        //   });
        //   return;
        // }

        if (errorPlantilla) {
          // Guardado parcial
          const detalle = [
            errorPlantilla ? 'plantilla HTML' : null,
          ]
            .filter(Boolean)
            .join(' y ');

          this.toast.add({
            severity: 'warn',
            summary: 'Guardado parcial',
            detail: `No se pudo guardar: ${detalle}. Intenta de nuevo.`,
            life: 5000,
          });
          return;
        }

        // Todo OK
        this.isDirty.set(false);
        this.form.markAsPristine();

        Swal.fire({
          title: '¡Éxito!',
          text: 'La plantilla se actualizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: 'swal-theme' },
        });
      },
      error: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error', summary: 'Error',
          detail: 'No se pudo guardar. Intenta de nuevo.', life: 4000,
        });
      },
    });

    // this.svc.saveConfig(config, this.userData!.usuarioId!).subscribe({
    //   next: (results) => {
    //     this.saving.set(false);

    //     // Verificar si algún campo falló
    //     const algúnError = results.some(ok => !ok);

    //     if (algúnError) {
    //       this.toast.add({
    //         severity: 'warn',
    //         summary: 'Guardado parcial',
    //         detail: 'Algunos campos no se actualizaron. Verifica e intenta de nuevo.',
    //         life: 5000,
    //       });
    //     } else {
    //       this.isDirty.set(false);
    //       this.form.markAsPristine();
    //       // this.toast.add({
    //       //   severity: 'success',
    //       //   summary: 'Guardado',
    //       //   detail: 'La plantilla se actualizó correctamente.',
    //       //   life: 3500,
    //       // });

    //       Swal.fire({
    //         title: '¡Éxito!',
    //         text: 'La plantilla se actualizó correctamente.',
    //         icon: 'success',
    //         confirmButtonText: 'Aceptar',
    //         allowOutsideClick: false,
    //         allowEscapeKey: false,
    //         customClass: { popup: 'swal-theme' }
    //       }).then((result) => {
    //         if (result.isConfirmed) {
    //         }
    //       });
    //     }
    //   },
    //   error: () => {
    //     this.saving.set(false);
    //     this.toast.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'No se pudo guardar. Intenta de nuevo.',
    //       life: 4000,
    //     });
    //   },
    // });
  }

  cancel(): void {
    this.isDirty.set(false);
    this.loading.set(true);
    this.loadConfig();
  }

  // Helpers template
  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ── Privado ────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.form = this.fb.group({
      asunto: ['', [Validators.required, Validators.maxLength(150)]],
      nombreRemitente: ['', [Validators.required, Validators.maxLength(100)]],
      emailRemitente: ['', [Validators.required, Validators.email]],
      telefonoContacto: ['', Validators.required],
      emailContacto: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      tituloPaso1: ['', Validators.required],
      textoPaso1: ['', Validators.required],
      tituloPaso2: ['', Validators.required],
      textoPaso2: ['', Validators.required],
      tituloPaso3: ['', Validators.required],
      textoPaso3: ['', Validators.required],
      nombreEmpresa: ['', Validators.required],
    });
  }

  private loadConfig(): void {
    this.svc.getConfig().subscribe({
      next: config => {
        this.form.patchValue(config);
        this.form.markAsPristine();
        this.isDirty.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[PlantillaCorreoWallet] Error al cargar configuraciones:', err);
        this.loading.set(false);
        this.toast.add({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'No se pudieron cargar las configuraciones. Se muestran valores predeterminados.',
          life: 5000,
        });
      },
    });
  }



  // ── NUEVO: Probar plantilla ────────────────────────────────────────────────
  /**
   * Llama a GET /api/EmailTemplate/{companyId}/preview
   * y abre el HTML renderizado en una nueva pestaña del navegador.
   *
   * Si la plantilla aún no existe en BD se avisa al usuario con un toast.
   */
  probarPlantilla(): void {
    if (this.userData === undefined || this.userData === null || this.userData === null) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'La empresa es requerida.',
        icon: 'warning',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: { popup: 'swal-theme' }
      }).then(() => {
      });
      return;
    }

    const companyId = this.userData.empresaId;
    if (companyId === undefined || companyId === null || companyId === null) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'La empresa es requerida.',
        icon: 'warning',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        allowOutsideClick: false,
        customClass: { popup: 'swal-theme' }
      }).then(() => {
      });

      return;
    }

    this.loadingPreview.set(true);

    // openPreviewTab usa fetch internamente (no necesita Observable)
    // Usamos un pequeño "truquito" para saber si terminó: hacemos el fetch
    // en el servicio pero controlamos el spinner aquí con un timeout corto.
    this.srvEmailTemplate.openPreviewTab(companyId);

    // Apagamos el spinner tras 1.5 s (tiempo suficiente para iniciar la pestaña)
    setTimeout(() => this.loadingPreview.set(false), 1500);
  }
}