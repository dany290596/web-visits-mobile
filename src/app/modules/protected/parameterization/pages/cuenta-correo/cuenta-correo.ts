import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../configuration/services/configuration.service';
import { StorageService } from '../../../../auth/services/storage.service';

import { IUsuarioResponse } from '../../../authentication/interfaces/usuario.interface';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuenta-correo',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule
  ],
  templateUrl: './cuenta-correo.html',
  styleUrl: './cuenta-correo.css',
  providers: [MessageService]
})
export class CuentaCorreo {
  private srvForm = inject(FormBuilder);
  private srvConfiguracion = inject(ConfiguracionService);
  private srvStorage = inject(StorageService);

  user: IUsuarioResponse | undefined;
  userId: string = '';

  NombreRemitente: string = "55a17813-0f43-4e2b-8318-0d7c57495150";
  AsuntoCorreo: string = "0057d019-b285-44c3-8ad3-8ab314700c6a";
  ServidorSMTP: string = "6ee5652f-6fcd-4159-9799-59f27bd87804";
  Puerto: string = "4ad8fd8a-40fc-4850-a687-dbb441a9ce8d";
  CorreoRemitente: string = "80e03d8f-a17e-4f3a-8bc0-61f737a22023";
  Contrasena: string = "001425c3-3806-455e-addd-19656e354587";

  NombreRemitenteData: any;
  AsuntoCorreoData: any;
  ServidorSMTPData: any;
  PuertoData: any;
  CorreoRemitenteData: any;
  ContrasenaData: any;

  form: FormGroup = this.srvForm.group({
    NombreRemitente: ['', Validators.required],
    AsuntoCorreo: ['', Validators.required],
    ServidorSMTP: ['', Validators.required],
    Puerto: ['', Validators.required],
    CorreoRemitente: ['', Validators.required],
    Contrasena: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.srvStorage.getUserDetailData() !== undefined && this.srvStorage.getUserDetailData() !== null) {
      this.user = this.srvStorage.getUserDetailData()!;
      this.userId = this.user.id!;
    }

    forkJoin({
      NombreRemitente: this.srvConfiguracion.getById(this.NombreRemitente),
      AsuntoCorreo: this.srvConfiguracion.getById(this.AsuntoCorreo),
      ServidorSMTP: this.srvConfiguracion.getById(this.ServidorSMTP),
      Puerto: this.srvConfiguracion.getById(this.Puerto),
      CorreoRemitente: this.srvConfiguracion.getById(this.CorreoRemitente),
      Contrasena: this.srvConfiguracion.getById(this.Contrasena)
    }).subscribe({
      next: (responses) => {
        this.NombreRemitenteData = responses.NombreRemitente.data;
        this.AsuntoCorreoData = responses.AsuntoCorreo.data;
        this.ServidorSMTPData = responses.ServidorSMTP.data;
        this.PuertoData = responses.Puerto.data;
        this.CorreoRemitenteData = responses.CorreoRemitente.data;
        this.ContrasenaData = responses.Contrasena.data;

        if (responses.NombreRemitente.respuesta === true) {
          this.form.patchValue({ NombreRemitente: responses.NombreRemitente.data.valor1 });
        }
        if (responses.AsuntoCorreo.respuesta === true) {
          this.form.patchValue({ AsuntoCorreo: responses.AsuntoCorreo.data.valor1 });
        }
        if (responses.ServidorSMTP.respuesta === true) {
          this.form.patchValue({ ServidorSMTP: responses.ServidorSMTP.data.valor1 });
        }
        if (responses.Puerto.respuesta === true) {
          this.form.patchValue({ Puerto: responses.Puerto.data.valor1 });
        }
        if (responses.CorreoRemitente.respuesta) {
          this.form.patchValue({ CorreoRemitente: responses.CorreoRemitente.data.valor1 });
        }
        if (responses.Contrasena.respuesta) {
          this.form.patchValue({ Contrasena: responses.Contrasena.data.valor1 });
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  showGuardar(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });

      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    let form = this.form.getRawValue();

    console.log(this.NombreRemitenteData);
    console.log(this.AsuntoCorreoData);
    console.log(this.ServidorSMTPData);
    console.log(this.PuertoData);
    console.log(this.CorreoRemitenteData);
    console.log(this.ContrasenaData);

    const NombreRemitenteRequest: any = {
      id: this.NombreRemitenteData.id,
      aplicacionId: this.NombreRemitenteData.aplicacionId,
      nombreParametro: this.NombreRemitenteData.nombreParametro,
      valorGuid: this.NombreRemitenteData.valorGuid,
      valor1: form.NombreRemitente,
      valor2: this.NombreRemitenteData.valor2,
      valor3: this.NombreRemitenteData.valor3,
      editable: this.NombreRemitenteData.editable,
      lectura: this.NombreRemitenteData.lectura,
      usuarioCreadorId: this.userId
    };

    const AsuntoCorreoRequest: any = {
      id: this.AsuntoCorreoData.id,
      aplicacionId: this.AsuntoCorreoData.aplicacionId,
      nombreParametro: this.AsuntoCorreoData.nombreParametro,
      valorGuid: this.AsuntoCorreoData.valorGuid,
      valor1: form.AsuntoCorreo,
      valor2: this.AsuntoCorreoData.valor2,
      valor3: this.AsuntoCorreoData.valor3,
      editable: this.AsuntoCorreoData.editable,
      lectura: this.AsuntoCorreoData.lectura,
      usuarioCreadorId: this.userId
    };

    const ServidorSMTPRequest: any = {
      id: this.ServidorSMTPData.id,
      aplicacionId: this.ServidorSMTPData.aplicacionId,
      nombreParametro: this.ServidorSMTPData.nombreParametro,
      valorGuid: this.ServidorSMTPData.valorGuid,
      valor1: form.ServidorSMTP,
      valor2: this.ServidorSMTPData.valor2,
      valor3: this.ServidorSMTPData.valor3,
      editable: this.ServidorSMTPData.editable,
      lectura: this.ServidorSMTPData.lectura,
      usuarioCreadorId: this.userId
    };

    const PuertoRequest: any = {
      id: this.PuertoData.id,
      aplicacionId: this.PuertoData.aplicacionId,
      nombreParametro: this.PuertoData.nombreParametro,
      valorGuid: this.PuertoData.valorGuid,
      valor1: form.Puerto,
      valor2: this.PuertoData.valor2,
      valor3: this.PuertoData.valor3,
      editable: this.PuertoData.editable,
      lectura: this.PuertoData.lectura,
      usuarioCreadorId: this.userId
    };

    const CorreoRemitenteRequest: any = {
      id: this.CorreoRemitenteData.id,
      aplicacionId: this.CorreoRemitenteData.aplicacionId,
      nombreParametro: this.CorreoRemitenteData.nombreParametro,
      valorGuid: this.CorreoRemitenteData.valorGuid,
      valor1: form.CorreoRemitente,
      valor2: this.CorreoRemitenteData.valor2,
      valor3: this.CorreoRemitenteData.valor3,
      editable: this.CorreoRemitenteData.editable,
      lectura: this.CorreoRemitenteData.lectura,
      usuarioCreadorId: this.userId
    };

    const ContrasenaRequest: any = {
      id: this.ContrasenaData.id,
      aplicacionId: this.ContrasenaData.aplicacionId,
      nombreParametro: this.ContrasenaData.nombreParametro,
      valorGuid: this.ContrasenaData.valorGuid,
      valor1: form.Contrasena,
      valor2: this.ContrasenaData.valor2,
      valor3: this.ContrasenaData.valor3,
      editable: this.ContrasenaData.editable,
      lectura: this.ContrasenaData.lectura,
      usuarioCreadorId: this.userId
    };

    console.log(NombreRemitenteRequest);
    console.log(AsuntoCorreoRequest);
    console.log(ServidorSMTPRequest);
    console.log(PuertoRequest);
    console.log(CorreoRemitenteRequest);
    console.log(ContrasenaRequest);

    forkJoin({
      NombreRemitente: this.srvConfiguracion.update(this.NombreRemitenteData.id, NombreRemitenteRequest),
      AsuntoCorreo: this.srvConfiguracion.update(this.AsuntoCorreoData.id, AsuntoCorreoRequest),
      ServidorSMTP: this.srvConfiguracion.update(this.ServidorSMTPData.id, ServidorSMTPRequest),
      Puerto: this.srvConfiguracion.update(this.PuertoData.id, PuertoRequest),
      CorreoRemitente: this.srvConfiguracion.update(this.CorreoRemitenteData.id, CorreoRemitenteRequest),
      Contrasena: this.srvConfiguracion.update(this.ContrasenaData.id, ContrasenaRequest)
    }).subscribe({
      next: (responses) => {
        if (responses.NombreRemitente.respuesta === true &&
          responses.AsuntoCorreo.respuesta === true &&
          responses.ServidorSMTP.respuesta === true &&
          responses.Puerto.respuesta === true &&
          responses.CorreoRemitente.respuesta === true &&
          responses.Contrasena.respuesta === true) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Configuraciones guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            timerProgressBar: true
          });
        } else {
          Swal.fire({
            title: '¡Advertencia!',
            text: 'Algunas configuraciones no se pudieron guardar',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB'
          });
        }
      },
      error: (error) => {
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No se pudieron guardar las configuraciones',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563EB'
        });
      }
    });
  }
}