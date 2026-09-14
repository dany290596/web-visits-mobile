import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { UsuarioHIDService } from '../../../services/usuario-hid.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-usuario-hid',
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ChipModule
  ],
  templateUrl: './detalle-usuario-hid.html',
  styleUrl: './detalle-usuario-hid.css',
})
export class DetalleUsuarioHid {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  private srvUsuarioHID = inject(UsuarioHIDService);

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvUsuarioHID.getByPhoto(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }

  enviar() {
    if (this.data !== null && this.data !== undefined) {
      console.log("DATA ::: ", this.data);

      let request = {
        id: this.data.id,
        userId: this.data.userId,
        email: this.data.email,
        invitacionDetalle: this.data.invitacionDetalle,
        invitacionId: this.data.invitacionId
      }

      this.srvUsuarioHID.sendInvitation(request).subscribe((resp: any) => {
        if (resp.respuesta === true) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'El correo se ha enviado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: { popup: 'swal-theme' }
          }).then((result) => {
            if (result.isConfirmed) {
              // this.guardadoExitoso.emit();
              // this.closeModal.emit();
            }
          });
        } else {
        }
      });;
    }
  }
}