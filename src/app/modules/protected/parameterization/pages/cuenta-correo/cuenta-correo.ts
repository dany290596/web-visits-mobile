import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { filter, forkJoin, Subscription, take } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../configuration/services/configuration.service';
import { StorageService } from '../../../../auth/services/storage.service';

import { IUsuarioAutenticado, IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

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
  private srvConfiguracion = inject(ConfiguracionService);
  private srvStorage = inject(StorageService);

  private tls1Subscription: Subscription = new Subscription();
  private tls2Subscription: Subscription = new Subscription();

  user: IUsuarioResponse | undefined;
  userId: string = '';

  value: number = 0;

  tenant: string = '0555A333-7F4A-4BD1-8605-20DB85AB8F9C';
  client: string = 'EEB83114-7C90-43B9-B4CF-16DF7EAA1B6C';
  clientSecret: string = '42220665-C2D5-48AD-9D05-E245C4784650';
  email: string = 'FE05BC78-00F5-4EA2-B58E-5FF7C3D60AD8';

  emailSMTPId: string = '444B364E-D04A-453D-A2CD-ABD3AF06547E';
  servidorSMTPId: string = '88454A1C-51A1-4F6D-9F61-8D4ED2F5446E';
  puertoSMTPId: string = 'B0B0B87F-1D4D-41F5-AC65-A9C241E532BC';
  usuarioSMTPId: string = '0D0DEF18-E291-4888-9885-5B48DC4035EE';
  contrasenaSMTPId: string = '99022259-4E63-4189-8F80-D65994F6FEB3';
  sslSMTPId: string = '0058117E-2B86-4122-80DC-228DCE6A9C46';
  tls1SMTPId: string = '7171F864-8663-45A1-BAB5-AB226B458BB1';
  tls2SMTPId: string = '0E1119B3-0397-48E5-B0A5-A5E77C73C017';

  protocoloEnvioCorreoId: string = '5FFF0424-DAC1-4DD9-9E5C-9CA4225BBD55';

  tenantData: any;
  clientData: any;
  clientSecretData: any;
  emailData: any;
  emailSMTPData: any;
  servidorSMTPData: any;
  puertoSMTPData: any;
  usuarioSMTPData: any;
  contrasenaSMTPData: any;
  sslSMTPData: any;
  tls1SMTPData: any;
  tls2SMTPData: any;
  protocoloEnvioCorreoData: any;

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
    ProtocoloEnvioCorreo: [false, [Validators.required]]
  });

  emailOAuthFG: FormGroup = this.srvForm.group({
    Tenant: ['', [Validators.required]],
    Client: ['', [Validators.required]],
    ClientSecret: ['', [Validators.required]],
    Email: ['', [Validators.required, Validators.email]],
    ProtocoloEnvioCorreo: [false, [Validators.required]]
  });

  constructor() {
    effect(() => {
    });
  }

  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
      });

    forkJoin({
      tenant: this.srvConfiguracion.getById(this.tenant),
      client: this.srvConfiguracion.getById(this.client),
      clientSecret: this.srvConfiguracion.getById(this.clientSecret),
      emailOAuth: this.srvConfiguracion.getById(this.email),
      emailSMTP: this.srvConfiguracion.getById(this.emailSMTPId),
      servidor: this.srvConfiguracion.getById(this.servidorSMTPId),
      puerto: this.srvConfiguracion.getById(this.puertoSMTPId),
      usuario: this.srvConfiguracion.getById(this.usuarioSMTPId),
      contrasena: this.srvConfiguracion.getById(this.contrasenaSMTPId),
      ssl: this.srvConfiguracion.getById(this.sslSMTPId),
      tls1: this.srvConfiguracion.getById(this.tls1SMTPId),
      tls2: this.srvConfiguracion.getById(this.tls2SMTPId),
      protocoloEnvioCorreo: this.srvConfiguracion.getById(this.protocoloEnvioCorreoId),
    }).subscribe({
      next: (responses) => {
        // console.log("RESPONSE ", responses);

        this.validarTlsInicial();
        this.setupTlsValidation();

        this.tenantData = responses.tenant.data;
        this.clientData = responses.client.data;
        this.clientSecretData = responses.clientSecret.data;
        this.emailData = responses.emailOAuth.data;
        this.emailSMTPData = responses.emailSMTP.data;
        this.servidorSMTPData = responses.servidor.data;
        this.puertoSMTPData = responses.puerto.data;
        this.usuarioSMTPData = responses.usuario.data;
        this.contrasenaSMTPData = responses.contrasena.data;
        this.sslSMTPData = responses.ssl.data;
        this.tls1SMTPData = responses.tls1.data;
        this.tls2SMTPData = responses.tls2.data;
        this.protocoloEnvioCorreoData = responses.protocoloEnvioCorreo.data;

        // Cargar valores en los formularios
        if (responses.tenant.respuesta === true) {
          this.emailOAuthFG.patchValue({ Tenant: responses.tenant.data.valor1 });
        }
        if (responses.client.respuesta === true) {
          this.emailOAuthFG.patchValue({ Client: responses.client.data.valor1 });
        }
        if (responses.clientSecret.respuesta === true) {
          this.emailOAuthFG.patchValue({ ClientSecret: responses.clientSecret.data.valor1 });
        }
        if (responses.emailOAuth.respuesta === true) {
          this.emailOAuthFG.patchValue({ Email: responses.emailOAuth.data.valor1 });
        }
        if (responses.emailSMTP.respuesta) {
          this.emailSMTPFG.patchValue({ Email: responses.emailSMTP.data.valor1 });
        }
        if (responses.servidor.respuesta) {
          this.emailSMTPFG.patchValue({ ServidorSMTP: responses.servidor.data.valor1 });
        }
        if (responses.puerto.respuesta) {
          this.emailSMTPFG.patchValue({ Puerto: responses.puerto.data.valor1 });
        }
        if (responses.usuario.respuesta) {
          this.emailSMTPFG.patchValue({ Usuario: responses.usuario.data.valor1 });
        }
        if (responses.contrasena.respuesta) {
          this.emailSMTPFG.patchValue({ Contrasena: responses.contrasena.data.valor1 });
        }
        if (responses.ssl.respuesta) {
          const valor = responses.ssl.data.valor1;
          const sslValue = valor !== null && valor !== undefined && valor !== ''
            ? Number(valor) === 1
            : false;
          this.emailSMTPFG.patchValue({ SSL: sslValue });
        }
        if (responses.tls1.respuesta) {
          const valor = responses.tls1.data.valor1;
          const tls1Value = valor !== null && valor !== undefined && valor !== ''
            ? Number(valor) === 1
            : false;
          this.emailSMTPFG.patchValue({ TLS1: tls1Value });
        }
        if (responses.tls2.respuesta) {
          const valor = responses.tls2.data.valor1;
          const tls2Value = valor !== null && valor !== undefined && valor !== ''
            ? Number(valor) === 1
            : false;
          this.emailSMTPFG.patchValue({ TLS2: tls2Value });
        }

        // Inicializar protocolo de envío
        this.inicializarProtocolo();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  private inicializarProtocolo(): void {
    if (this.protocoloEnvioCorreoData && this.protocoloEnvioCorreoData.valor1) {
      const isOAuth = this.protocoloEnvioCorreoData.valor1 === 'PROTOCOLO DE CORREO OAUTH HABILITADO';
      this.emailSMTPFG.patchValue({ ProtocoloEnvioCorreo: !isOAuth }, { emitEvent: false });
      this.emailOAuthFG.patchValue({ ProtocoloEnvioCorreo: isOAuth }, { emitEvent: false });
    } else {
      // Por defecto, habilitar SMTP
      this.emailSMTPFG.patchValue({ ProtocoloEnvioCorreo: true }, { emitEvent: false });
      this.emailOAuthFG.patchValue({ ProtocoloEnvioCorreo: false }, { emitEvent: false });
    }
    this.updateFormDisabledStates();
  }

  private updateFormDisabledStates(): void {
    const smtpEnabled = this.emailSMTPFG.get('ProtocoloEnvioCorreo')?.value;

    const setFormState = (form: FormGroup, enabled: boolean) => {
      Object.keys(form.controls).forEach(key => {
        if (key === 'ProtocoloEnvioCorreo') {
          // El toggle siempre habilitado
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
    if (this.userData.usuarioId === undefined || this.userData.usuarioId === null || this.userData.usuarioId === "") {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'El Id del usuario es requerido para continuar.',
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

    let form = this.emailOAuthFG.getRawValue();;

    const tenantRequest: any = {
      id: this.tenantData.id,
      aplicacionId: this.tenantData.aplicacionId,
      nombreParametro: this.tenantData.nombreParametro,
      valorGuid: this.tenantData.valorGuid,
      valor1: form.Tenant,
      valor2: this.tenantData.valor2,
      valor3: this.tenantData.valor3,
      editable: this.tenantData.editable,
      lectura: this.tenantData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const clientRequest: any = {
      id: this.clientData.id,
      aplicacionId: this.clientData.aplicacionId,
      nombreParametro: this.clientData.nombreParametro,
      valorGuid: this.clientData.valorGuid,
      valor1: form.Client,
      valor2: this.clientData.valor2,
      valor3: this.clientData.valor3,
      editable: this.clientData.editable,
      lectura: this.clientData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const clientSecretRequest: any = {
      id: this.clientSecretData.id,
      aplicacionId: this.clientSecretData.aplicacionId,
      nombreParametro: this.clientSecretData.nombreParametro,
      valorGuid: this.clientSecretData.valorGuid,
      valor1: form.ClientSecret,
      valor2: this.clientSecretData.valor2,
      valor3: this.clientSecretData.valor3,
      editable: this.clientSecretData.editable,
      lectura: this.clientSecretData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const emailRequest: any = {
      id: this.emailData.id,
      aplicacionId: this.emailData.aplicacionId,
      nombreParametro: this.emailData.nombreParametro,
      valorGuid: this.emailData.valorGuid,
      valor1: form.Email,
      valor2: this.emailData.valor2,
      valor3: this.emailData.valor3,
      editable: this.emailData.editable,
      lectura: this.emailData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const protocolRequest: any = {
      id: this.protocoloEnvioCorreoData.id,
      aplicacionId: this.protocoloEnvioCorreoData.aplicacionId,
      nombreParametro: this.protocoloEnvioCorreoData.nombreParametro,
      valorGuid: this.protocoloEnvioCorreoData.valorGuid,
      valor1: this.protocoloActivoTexto,
      valor2: this.protocoloEnvioCorreoData.valor2,
      valor3: this.protocoloEnvioCorreoData.valor3,
      editable: this.protocoloEnvioCorreoData.editable,
      lectura: this.protocoloEnvioCorreoData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    // console.log(tenantRequest);
    // console.log(clientRequest);
    // console.log(clientSecretRequest);
    // console.log(emailRequest);
    // console.log(protocolRequest);

    forkJoin({
      tenant: this.srvConfiguracion.update(this.tenantData.id, tenantRequest),
      client: this.srvConfiguracion.update(this.clientData.id, clientRequest),
      clientSecret: this.srvConfiguracion.update(this.clientSecretData.id, clientSecretRequest),
      email: this.srvConfiguracion.update(this.emailData.id, emailRequest),
      protocolo: this.srvConfiguracion.update(this.protocoloEnvioCorreoData.id, protocolRequest)
    }).subscribe({
      next: (responses) => {
        if (responses.tenant.respuesta === true &&
          responses.client.respuesta === true &&
          responses.clientSecret.respuesta === true &&
          responses.email.respuesta === true &&
          responses.protocolo.respuesta === true) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Configuraciones guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            timerProgressBar: true,
            customClass: {
              popup: 'swal-theme',
            }
          });
        } else {
          Swal.fire({
            title: '¡Advertencia!',
            text: 'Algunas configuraciones no se pudieron guardar',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            customClass: {
              popup: 'swal-theme',
            }
          });
        }
      },
      error: (error) => {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No se pudieron guardar las configuraciones',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563EB',
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });
  }

  showEmailSMTP(): void {
    if (this.userData.usuarioId === undefined || this.userData.usuarioId === null || this.userData.usuarioId === "") {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'El Id del usuario es requerido para continuar.',
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

    let form = this.emailSMTPFG.getRawValue();

    const emailRequest: any = {
      id: this.emailSMTPData.id,
      aplicacionId: this.emailSMTPData.aplicacionId,
      nombreParametro: this.emailSMTPData.nombreParametro,
      valorGuid: this.emailSMTPData.valorGuid,
      valor1: form.Email,
      valor2: this.emailSMTPData.valor2,
      valor3: this.emailSMTPData.valor3,
      editable: this.emailSMTPData.editable,
      lectura: this.emailSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const servidorRequest: any = {
      id: this.servidorSMTPData.id,
      aplicacionId: this.servidorSMTPData.aplicacionId,
      nombreParametro: this.servidorSMTPData.nombreParametro,
      valorGuid: this.servidorSMTPData.valorGuid,
      valor1: form.ServidorSMTP,
      valor2: this.servidorSMTPData.valor2,
      valor3: this.servidorSMTPData.valor3,
      editable: this.servidorSMTPData.editable,
      lectura: this.servidorSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const puertoRequest: any = {
      id: this.puertoSMTPData.id,
      aplicacionId: this.puertoSMTPData.aplicacionId,
      nombreParametro: this.puertoSMTPData.nombreParametro,
      valorGuid: this.puertoSMTPData.valorGuid,
      valor1: form.Puerto.toString(),
      valor2: this.puertoSMTPData.valor2,
      valor3: this.puertoSMTPData.valor3,
      editable: this.puertoSMTPData.editable,
      lectura: this.puertoSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const usuarioRequest: any = {
      id: this.usuarioSMTPData.id,
      aplicacionId: this.usuarioSMTPData.aplicacionId,
      nombreParametro: this.usuarioSMTPData.nombreParametro,
      valorGuid: this.usuarioSMTPData.valorGuid,
      valor1: form.Usuario,
      valor2: this.usuarioSMTPData.valor2,
      valor3: this.usuarioSMTPData.valor3,
      editable: this.usuarioSMTPData.editable,
      lectura: this.usuarioSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const contrasenaRequest: any = {
      id: this.contrasenaSMTPData.id,
      aplicacionId: this.contrasenaSMTPData.aplicacionId,
      nombreParametro: this.contrasenaSMTPData.nombreParametro,
      valorGuid: this.contrasenaSMTPData.valorGuid,
      valor1: form.Contrasena,
      valor2: this.contrasenaSMTPData.valor2,
      valor3: this.contrasenaSMTPData.valor3,
      editable: this.contrasenaSMTPData.editable,
      lectura: this.contrasenaSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const sslRequest: any = {
      id: this.sslSMTPData.id,
      aplicacionId: this.sslSMTPData.aplicacionId,
      nombreParametro: this.sslSMTPData.nombreParametro,
      valorGuid: this.sslSMTPData.valorGuid,
      valor1: form.SSL ? '1' : '2',
      valor2: this.sslSMTPData.valor2,
      valor3: this.sslSMTPData.valor3,
      editable: this.sslSMTPData.editable,
      lectura: this.sslSMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const tls1Request: any = {
      id: this.tls1SMTPData.id,
      aplicacionId: this.tls1SMTPData.aplicacionId,
      nombreParametro: this.tls1SMTPData.nombreParametro,
      valorGuid: this.tls1SMTPData.valorGuid,
      valor1: form.TLS1 ? '1' : '2',
      valor2: this.tls1SMTPData.valor2,
      valor3: this.tls1SMTPData.valor3,
      editable: this.tls1SMTPData.editable,
      lectura: this.tls1SMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const tls2Request: any = {
      id: this.tls2SMTPData.id,
      aplicacionId: this.tls2SMTPData.aplicacionId,
      nombreParametro: this.tls2SMTPData.nombreParametro,
      valorGuid: this.tls2SMTPData.valorGuid,
      valor1: form.TLS2 ? '1' : '2',
      valor2: this.tls2SMTPData.valor2,
      valor3: this.tls2SMTPData.valor3,
      editable: this.tls2SMTPData.editable,
      lectura: this.tls2SMTPData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    const protocolRequest: any = {
      id: this.protocoloEnvioCorreoData.id,
      aplicacionId: this.protocoloEnvioCorreoData.aplicacionId,
      nombreParametro: this.protocoloEnvioCorreoData.nombreParametro,
      valorGuid: this.protocoloEnvioCorreoData.valorGuid,
      valor1: this.protocoloActivoTexto,
      valor2: this.protocoloEnvioCorreoData.valor2,
      valor3: this.protocoloEnvioCorreoData.valor3,
      editable: this.protocoloEnvioCorreoData.editable,
      lectura: this.protocoloEnvioCorreoData.lectura,
      usuarioCreadorId: this.userData.usuarioId
    };

    // console.log(emailRequest);
    // console.log(servidorRequest);
    // console.log(puertoRequest);
    // console.log(usuarioRequest);
    // console.log(contrasenaRequest);
    // console.log(sslRequest);
    // console.log(tls1Request);
    // console.log(tls2Request);
    // console.log(protocolRequest);

    forkJoin({
      email: this.srvConfiguracion.update(this.emailSMTPData.id, emailRequest),
      servidor: this.srvConfiguracion.update(this.servidorSMTPData.id, servidorRequest),
      puerto: this.srvConfiguracion.update(this.puertoSMTPData.id, puertoRequest),
      usuario: this.srvConfiguracion.update(this.usuarioSMTPData.id, usuarioRequest),
      contrasena: this.srvConfiguracion.update(this.contrasenaSMTPData.id, contrasenaRequest),
      ssl: this.srvConfiguracion.update(this.sslSMTPData.id, sslRequest),
      tls1: this.srvConfiguracion.update(this.tls1SMTPData.id, tls1Request),
      tls2: this.srvConfiguracion.update(this.tls2SMTPData.id, tls2Request),
      protocolo: this.srvConfiguracion.update(this.protocoloEnvioCorreoData.id, protocolRequest)
    }).subscribe({
      next: (responses) => {
        if (responses.email.respuesta === true &&
          responses.servidor.respuesta === true &&
          responses.puerto.respuesta === true &&
          responses.usuario.respuesta === true &&
          responses.contrasena.respuesta === true &&
          responses.ssl.respuesta === true &&
          responses.tls1.respuesta === true &&
          responses.tls2.respuesta === true &&
          responses.protocolo.respuesta === true) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Configuraciones SMTP guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            timerProgressBar: true,
            customClass: {
              popup: 'swal-theme',
            }
          });
        } else {
          Swal.fire({
            title: '¡Advertencia!',
            text: 'Algunas configuraciones SMTP no se pudieron guardar',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            customClass: {
              popup: 'swal-theme',
            }
          });
        }
      },
      error: (error) => {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No se pudieron guardar las configuraciones SMTP',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563EB',
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });
  }

  private validarTlsInicial(): void {
    const tls1 = this.emailSMTPFG.get('TLS1')?.value;
    const tls2 = this.emailSMTPFG.get('TLS2')?.value;
    if (tls1 && tls2) {
      this.emailSMTPFG.patchValue({ TLS2: false }, { emitEvent: false });
    }
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

  // Nuevo método para manejar el cambio con confirmación
  onProtocolToggleChange(event: any, protocolo: string): void {
    const smtpControl = this.emailSMTPFG.get('ProtocoloEnvioCorreo');
    const oauthControl = this.emailOAuthFG.get('ProtocoloEnvioCorreo');
    const nuevoValor = event.checked; // Lo que el usuario intentó (true/false)

    // Determinar el control que se tocó y el opuesto
    const controlTocado = protocolo === 'SMTP' ? smtpControl : oauthControl;
    const controlOpuesto = protocolo === 'SMTP' ? oauthControl : smtpControl;
    const nombreProtocolo = protocolo;
    const nombreOpuesto = protocolo === 'SMTP' ? 'OAuth' : 'SMTP';

    // Revertir el cambio inmediatamente (el toggle vuelve a su estado anterior)
    controlTocado!.patchValue(!nuevoValor, { emitEvent: false });

    // Construir mensaje según si intenta activar o desactivar
    // let mensaje: string;
    // if (nuevoValor) { // Intentó activar este protocolo
    //   mensaje = `Si habilita la configuración ${nombreProtocolo}, se deshabilitará la configuración ${nombreOpuesto}. ¿Desea continuar?`;
    // } else { // Intentó desactivar este protocolo (el activo)
    //   mensaje = `Si deshabilita la configuración ${nombreProtocolo}, se habilitará la configuración ${nombreOpuesto}. ¿Desea continuar?`;
    // }
    // mensaje += ' Recuerde que para volver a habilitar esta configuración, debe deshabilitar la otra configuración.';

    let mensaje: string;
    if (nuevoValor) { // Intentó activar este protocolo
      mensaje = `¿Desea activar el protocolo: ${nombreProtocolo}? Esto desactivará el protocolo: ${nombreOpuesto} y sus campos quedarán bloqueados. Puede volver a cambiar en cualquier momento.`;
    } else { // Intentó desactivar este protocolo (el activo)
      mensaje = `¿Desactivar ${nombreProtocolo}? Esto activará ${nombreOpuesto} y podrá configurarlo. Puede volver a cambiar en cualquier momento.`;
    }

    // Mostrar confirmación
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
        // Aplicar el cambio: el control tocado al nuevo valor, el opuesto al contrario
        controlTocado!.patchValue(nuevoValor, { emitEvent: true });
        controlOpuesto!.patchValue(!nuevoValor, { emitEvent: true });
        this.updateFormDisabledStates();
      }
      // Si cancela, no hacemos nada (ya revertimos el cambio)
    });
  }

  get protocoloActivoTexto(): string {
    return this.emailSMTPFG.get('ProtocoloEnvioCorreo')?.value
      ? 'PROTOCOLO DE CORREO SMTP HABILITADO'
      : 'PROTOCOLO DE CORREO OAUTH HABILITADO';
  }

  ngOnDestroy(): void {
    this.tls1Subscription.unsubscribe();
    this.tls2Subscription.unsubscribe();
  }
}