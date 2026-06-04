import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MessageService } from 'primeng/api';

// PrimeNG 20
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

import { environment } from '../../../../../../environments/environment';

import { EmailWalletConfigService } from '../../../../protected/parameterization/services/email-wallet-config.service';
import { EmailWalletConfig, PREVIEW_DATA_DEFAULT, EmailWalletPreviewData } from '../../interfaces/email-wallet-config.interface';
import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';
import { StorageService } from '../../../../auth/services/storage.service';
import { filter, take } from 'rxjs';

import Swal from 'sweetalert2';

export type PreviewClient = 'gmail' | 'outlook' | 'apple';

@Component({
  selector: 'app-plantilla-correo-wallet',
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
  templateUrl: './plantilla-correo-wallet.html',
  styleUrl: './plantilla-correo-wallet.css',
})
export class PlantillaCorreoWallet implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(EmailWalletConfigService);
  private readonly toast = inject(MessageService);
  private srvStorage = inject(StorageService);

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

  // save(): void {
  //   console.log("sxxssssssssssssssssss");
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }

  //   this.saving.set(true);
  //   const config = this.form.getRawValue() as EmailWalletConfig;
  //   console.log("REQUEST ::: ", config);
  //   console.log("REQUEST ::: ", JSON.stringify(config));
  //   this.svc.saveConfig(config).subscribe({
  //     next: () => {
  //       this.saving.set(false);
  //       this.isDirty.set(false);
  //       this.form.markAsPristine();
  //       this.toast.add({
  //         severity: 'success',
  //         summary: 'Guardado',
  //         detail: this.isDummy
  //           ? 'Simulación exitosa. (Modo dummy — sin API real)'
  //           : 'La plantilla se actualizó correctamente.',
  //         life: 3500,
  //       });
  //     },
  //     error: () => {
  //       this.saving.set(false);
  //       this.toast.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'No se pudo guardar. Intenta de nuevo.',
  //         life: 4000,
  //       });
  //     },
  //   });
  // }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const config = this.form.getRawValue() as EmailWalletConfig;

    this.svc.saveConfig(config, this.userData!.usuarioId!).subscribe({
      next: (results) => {
        this.saving.set(false);

        // Verificar si algún campo falló
        const algúnError = results.some(ok => !ok);

        if (algúnError) {
          this.toast.add({
            severity: 'warn',
            summary: 'Guardado parcial',
            detail: 'Algunos campos no se actualizaron. Verifica e intenta de nuevo.',
            life: 5000,
          });
        } else {
          this.isDirty.set(false);
          this.form.markAsPristine();
          // this.toast.add({
          //   severity: 'success',
          //   summary: 'Guardado',
          //   detail: 'La plantilla se actualizó correctamente.',
          //   life: 3500,
          // });

          Swal.fire({
            title: '¡Éxito!',
            text: 'La plantilla se actualizó correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: { popup: 'swal-theme' }
          }).then((result) => {
            if (result.isConfirmed) {

            }
          });

        }
      },
      error: () => {
        this.saving.set(false);
        this.toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar. Intenta de nuevo.',
          life: 4000,
        });
      },
    });
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
}