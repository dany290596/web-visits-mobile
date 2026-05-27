import { Component, inject, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { MessageService } from 'primeng/api';

import { CredencialHIDService } from '../../../services/credencial-hid.service';

import { ICredencialHIDRequest } from '../../../interfaces/credencial-hid.interface';

import { AutocUsuarioHid } from '../../../components/autoc/autoc-usuario-hid/autoc-usuario-hid';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-credencial-hid',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
    AutocUsuarioHid
  ],
  templateUrl: './crear-credencial-hid.html',
  styleUrl: './crear-credencial-hid.css',
  providers: [MessageService]
})
export class CrearCredencialHid {
  private srvMessage = inject(MessageService);
  private srvCredencialHID = inject(CredencialHIDService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>(); // para refrescar la tabla
  @Input() id!: string;
  @Input() nombre!: string;
  @Input() action!: string;

  private fb = inject(FormBuilder);

  miFormulario: FormGroup = this.fb.group({
    usuarioid: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    tipoCredencial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    externalId: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    credencialValor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    status: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
  });

  ngOnInit(): void {
  }

  guardar(): void {
    if (this.action === "ADD") {
      if (this.miFormulario.invalid) {
        this.miFormulario.markAllAsTouched();
        Swal.fire({
          title: '¡Advertencia!',
          text: 'Complete los campos obligatorios.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563EB',
          customClass: { popup: 'swal-theme' }
        });
        return;
      }

      const form = this.miFormulario.value;
      const request = new ICredencialHIDRequest();

      request.usuarioid = form.usuarioid;
      request.tipoCredencial = form.tipoCredencial;
      request.externalId = form.externalId;
      request.credencialValor = form.credencialValor;
      request.status = form.status;

      this.srvCredencialHID.createWallet(request).subscribe((data: any) => {
        if (data.respuesta === true) {
          this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Credencial creada', life: 3000 });
          this.miFormulario.reset();
          Swal.fire({
            title: '¡Éxito!',
            text: 'La credencial ha sido registrada correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: { popup: 'swal-theme' }
          }).then((result) => {
            if (result.isConfirmed) {
              this.guardadoExitoso.emit({ creado: true });
              this.closeModal.emit();
            }
          });
        } else {
          this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la credencial.', life: 5000 });
        }
      });
    }
  }

  cerrar(): void {
    this.closeModal.emit();
  }
}