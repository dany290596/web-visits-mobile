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
  selector: 'app-configuracion-correo',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule
  ],
  templateUrl: './configuracion-correo.html',
  styleUrl: './configuracion-correo.css',
  providers: [MessageService]
})
export class ConfiguracionCorreo {
  private srvForm = inject(FormBuilder);
  private srvConfiguracion = inject(ConfiguracionService);
  private srvStorage = inject(StorageService);

  user: IUsuarioResponse | undefined;
  userId: string = '';

  CorreoAdministracion: string = "0BBB9E2B-C0BB-42DC-AC64-372D03040566"

  CorreoAdministracionData: any;

  form: FormGroup = this.srvForm.group({
    CorreoAdministracion: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.srvStorage.getUserDetailData() !== undefined && this.srvStorage.getUserDetailData() !== null) {
      this.user = this.srvStorage.getUserDetailData()!;
      this.userId = this.user.id!;
    }

    forkJoin({
      CorreoAdministracion: this.srvConfiguracion.getById(this.CorreoAdministracion)
    }).subscribe({
      next: (responses) => {
        this.CorreoAdministracionData = responses.CorreoAdministracion.data;

        if (responses.CorreoAdministracion.respuesta === true) {
          this.form.patchValue({ CorreoAdministracion: responses.CorreoAdministracion.data.valor1 });
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

    console.log(this.CorreoAdministracionData);

    const CorreoAdministracionRequest: any = {
      id: this.CorreoAdministracionData.id,
      aplicacionId: this.CorreoAdministracionData.aplicacionId,
      nombreParametro: this.CorreoAdministracionData.nombreParametro,
      valorGuid: this.CorreoAdministracionData.valorGuid,
      valor1: form.CorreoAdministracion,
      valor2: this.CorreoAdministracionData.valor2,
      valor3: this.CorreoAdministracionData.valor3,
      editable: this.CorreoAdministracionData.editable,
      lectura: this.CorreoAdministracionData.lectura,
      usuarioCreadorId: this.userId
    };

    console.log(CorreoAdministracionRequest);

    forkJoin({
      CorreoAdministracion: this.srvConfiguracion.update(this.CorreoAdministracionData.id, CorreoAdministracionRequest)
    }).subscribe({
      next: (responses) => {
        if (responses.CorreoAdministracion.respuesta === true) {
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