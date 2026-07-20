import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';

import { StorageService } from '../../../../auth/services/storage.service';
import { CorreoConfiguracionService } from '../../services/correo-configuracion.service';

import { ICorreoConfiguracionRequest } from '../../interfaces/correo-configuracion.interface';
import { IUsuarioAutenticado } from '../../../authentication/interfaces/usuario.interface';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuenta-correo',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TabsModule,
    ToggleSwitchModule
  ],
  templateUrl: './cuenta-correo.html',
  styleUrl: './cuenta-correo.css',
  providers: [MessageService]
})
export class CuentaCorreo implements OnInit, OnDestroy {
  private srvForm = inject(FormBuilder);
  private srvStorage = inject(StorageService);

  private srvCorreoConfiguracion = inject(CorreoConfiguracionService);

  private tls1Subscription: Subscription = new Subscription();
  private tls2Subscription: Subscription = new Subscription();

  value: number = 0;

  empresaId: string = '';
  cargando: boolean = true;

  /** Indica si ya existe una configuración guardada para la empresa (GET con datos) */
  existeConfiguracion: boolean = false;

  userData!: IUsuarioAutenticado;

  emailSMTPFG: FormGroup = this.srvForm.group({
    Email: ['', [Validators.required, Validators.email]],
    ServidorSMTP: ['', [Validators.required]],
    Puerto: ['', [Validators.required]],
    Usuario: ['', [Validators.required]],
    Contrasena: ['', [Validators.required]],
    SSL: [false, [Validators.required]],
    TLS1: [false, [Validators.required]],
    TLS2: [false, [Validators.required]],
    ProtocoloEnvioCorreo: [true, [Validators.required]]
  });

  emailOAuthFG: FormGroup = this.srvForm.group({
    Tenant: ['', [Validators.required]],
    Client: ['', [Validators.required]],
    ClientSecret: ['', [Validators.required]],
    Email: ['', [Validators.required, Validators.email]],
    ProtocoloEnvioCorreo: [false, [Validators.required]]
  });

  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
        this.empresaId = data.empresaId ?? '';
        this.cargando = false;

        this.setupTlsValidation();
        this.updateFormDisabledStates();
        this.cargarConfiguracion();
      });
  }

  get tieneEmpresa(): boolean {
    return !!this.empresaId && this.empresaId.trim() !== '';
  }

  private cargarConfiguracion(): void {
    if (!this.empresaId) {
      this.existeConfiguracion = false;
      return;
    }
    this.srvCorreoConfiguracion.getByEmpresaId(this.empresaId).subscribe({
      next: (response) => {
        // console.log("RESPONSE ::: ", response);
        if (response.respuesta === true && response.data) {
          this.existeConfiguracion = true;

          const data = response.data;

          if (data.smtp) {
            this.emailSMTPFG.patchValue({
              Email: data.smtp.correo,
              ServidorSMTP: data.smtp.servidor,
              Puerto: data.smtp.puerto,
              Usuario: data.smtp.usuario,
              Contrasena: data.smtp.password,
              SSL: !!data.smtp.ssl,
              TLS1: !!data.smtp.tls12,
              TLS2: !!data.smtp.tls13
            }, { emitEvent: false });
          }

          if (data.oAuth) {
            this.emailOAuthFG.patchValue({
              Tenant: data.oAuth.tenant,
              Client: data.oAuth.client,
              ClientSecret: data.oAuth.clientSecret,
              Email: data.oAuth.correo
            }, { emitEvent: false });
          }

          const isOAuth = data.tipoAutenticacion === 'OAuth';
          this.emailSMTPFG.patchValue({ ProtocoloEnvioCorreo: !isOAuth }, { emitEvent: false });
          this.emailOAuthFG.patchValue({ ProtocoloEnvioCorreo: isOAuth }, { emitEvent: false });
        } else {
          this.existeConfiguracion = false;
          this.emailSMTPFG.patchValue({ ProtocoloEnvioCorreo: true }, { emitEvent: false });
          this.emailOAuthFG.patchValue({ ProtocoloEnvioCorreo: false }, { emitEvent: false });
        }

        this.updateFormDisabledStates();
      },
      error: (error) => {
        console.error(error);
        this.existeConfiguracion = false;
      }
    });
  }

  private updateFormDisabledStates(): void {
    const smtpEnabled = this.emailSMTPFG.get('ProtocoloEnvioCorreo')?.value;

    const setFormState = (form: FormGroup, enabled: boolean) => {
      Object.keys(form.controls).forEach(key => {
        if (key === 'ProtocoloEnvioCorreo') {
          form.get(key)?.enable({ emitEvent: false });
        } else {
          if (enabled) {
            form.get(key)?.enable({ emitEvent: false });
          } else {
            form.get(key)?.disable({ emitEvent: false });
          }
        }
      });
    };

    setFormState(this.emailSMTPFG, smtpEnabled);
    setFormState(this.emailOAuthFG, !smtpEnabled);
  }

  showEmailOAuth(): void {
    if (!this.empresaId) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'El Id de la empresa es requerido para continuar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    if (this.emailOAuthFG.invalid) {
      Object.keys(this.emailOAuthFG.controls).forEach(key => {
        const control = this.emailOAuthFG.get(key);
        control?.markAsTouched();
      });

      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    const form = this.emailOAuthFG.getRawValue();
    const request: ICorreoConfiguracionRequest = {
      empresaId: this.empresaId,
      tipoAutenticacion: 'OAuth',
      oauth: {
        tenant: form.Tenant,
        client: form.Client,
        clientSecret: form.ClientSecret,
        correo: form.Email
      }
    };

    this.guardarConfiguracion(request);
  }

  showEmailSMTP(): void {
    if (!this.empresaId) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'El Id de la empresa es requerido para continuar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    if (this.emailSMTPFG.invalid) {
      Object.keys(this.emailSMTPFG.controls).forEach(key => {
        const control = this.emailSMTPFG.get(key);
        control?.markAsTouched();
      });

      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: {
          popup: 'swal-theme',
        }
      });
      return;
    }

    const form = this.emailSMTPFG.getRawValue();

    const request: ICorreoConfiguracionRequest = {
      empresaId: this.empresaId,
      tipoAutenticacion: 'SMTP',
      smtp: {
        correo: form.Email,
        servidor: form.ServidorSMTP,
        puerto: Number(form.Puerto),
        usuario: form.Usuario,
        password: form.Contrasena,
        ssl: !!form.SSL,
        tls12: !!form.TLS1,
        tls13: !!form.TLS2
      }
    };

    this.guardarConfiguracion(request);
  }

  private guardarConfiguracion(request: ICorreoConfiguracionRequest): void {
    // console.log("REQUEST ::: ", request);
    const peticion = this.existeConfiguracion
      ? this.srvCorreoConfiguracion.update(request)
      : this.srvCorreoConfiguracion.create(request);

    peticion.subscribe({
      next: (response) => {
        if (response.respuesta === true) {
          this.existeConfiguracion = true;
          Swal.fire({
            title: '¡Éxito!',
            text: response.mensaje || 'Configuraciones guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            timerProgressBar: true,
            customClass: {
              popup: 'swal-theme',
            }
          });
        } else {
          // Swal.fire({
          //   title: '¡Advertencia!',
          //   text: response.mensaje || 'No se pudieron guardar las configuraciones',
          //   icon: 'warning',
          //   confirmButtonText: 'Aceptar',
          //   confirmButtonColor: '#2563EB',
          //   customClass: {
          //     popup: 'swal-theme',
          //   }
          // });
        }
      },
      error: (error) => {
        // Swal.fire({
        //   title: '¡Advertencia!',
        //   text: 'No se pudieron guardar las configuraciones',
        //   icon: 'warning',
        //   confirmButtonText: 'Aceptar',
        //   confirmButtonColor: '#2563EB',
        //   customClass: {
        //     popup: 'swal-theme',
        //   }
        // });
      }
    });
  }

  private setupTlsValidation(): void {
    const tls1Control = this.emailSMTPFG.get('TLS1');
    const tls2Control = this.emailSMTPFG.get('TLS2');

    if (tls1Control && tls2Control) {
      this.tls1Subscription = tls1Control.valueChanges.subscribe(value => {
        if (value === true) {
          tls2Control.patchValue(false, { emitEvent: false });
        }
      });

      this.tls2Subscription = tls2Control.valueChanges.subscribe(value => {
        if (value === true) {
          tls1Control.patchValue(false, { emitEvent: false });
        }
      });
    }
  }

  onProtocolToggleChange(event: any, protocolo: string): void {
    const smtpControl = this.emailSMTPFG.get('ProtocoloEnvioCorreo');
    const oauthControl = this.emailOAuthFG.get('ProtocoloEnvioCorreo');
    const nuevoValor = event.checked;

    const controlTocado = protocolo === 'SMTP' ? smtpControl : oauthControl;
    const controlOpuesto = protocolo === 'SMTP' ? oauthControl : smtpControl;
    const nombreProtocolo = protocolo;
    const nombreOpuesto = protocolo === 'SMTP' ? 'OAuth' : 'SMTP';

    controlTocado!.patchValue(!nuevoValor, { emitEvent: false });

    let mensaje: string;
    if (nuevoValor) {
      mensaje = `¿Desea activar el protocolo: ${nombreProtocolo}? Esto desactivará el protocolo: ${nombreOpuesto} y sus campos quedarán bloqueados. Puede volver a cambiar en cualquier momento.`;
    } else {
      mensaje = `¿Desactivar ${nombreProtocolo}? Esto activará ${nombreOpuesto} y podrá configurarlo. Puede volver a cambiar en cualquier momento.`;
    }

    Swal.fire({
      title: '¿Cambiar protocolo de envío?',
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563EB',
      cancelButtonColor: '#d33',
      customClass: {
        popup: 'swal-theme',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        controlTocado!.patchValue(nuevoValor, { emitEvent: true });
        controlOpuesto!.patchValue(!nuevoValor, { emitEvent: true });
        this.updateFormDisabledStates();
      }
    });
  }

  ngOnDestroy(): void {
    this.tls1Subscription.unsubscribe();
    this.tls2Subscription.unsubscribe();
  }
}