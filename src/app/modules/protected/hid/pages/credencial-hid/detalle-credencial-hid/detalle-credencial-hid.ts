import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { UsuarioHIDService } from '../../../services/usuario-hid.service';
import { CredencialHIDService } from '../../../services/credencial-hid.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-credencial-hid',
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ChipModule
  ],
  templateUrl: './detalle-credencial-hid.html',
  styleUrl: './detalle-credencial-hid.css',
})
export class DetalleCredencialHid {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  private srvCredencialHID = inject(CredencialHIDService);

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvCredencialHID.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          // console.log("CREDENCIAL ::: ", s.data);
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }

  suspender() {
    console.log("ID ::: ", this.id);
    Swal.fire({
      title: '¡Advertencia!',
      text: 'La credencial está por suspenderse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-theme',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Swal.fire({
        //         title: 'Procesando...',
        //         text: 'Por favor espera',
        //         timerProgressBar: true,
        //         allowOutsideClick: false,
        //         showConfirmButton: false,
        //         customClass: {
        //           popup: 'swal-theme',
        //         },
        //         willOpen: () => {
        //           Swal.showLoading();
        //         }
        //       });

        this.srvCredencialHID.suspend(this.id).subscribe((resp: any) => {
          if (resp.respuesta === true) {
            Swal.fire({
              title: 'Credencial suspendida',
              text: 'La credencial se ha suspendido correctamente. Presiona "Aceptar" para continuar.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              allowOutsideClick: false,   // evita cerrar clickeando fuera
              allowEscapeKey: false,      // evita cerrar con ESC
              allowEnterKey: true,         // permite confirmar con ENTER
              customClass: {
                popup: 'swal-theme',
              }
            }).then((result) => {
              if (result.isConfirmed) {
                // this.buscar(); // actualiza la lista SOLO al aceptar
              }
            });
          } else {
            Swal.fire({
              title: '¡Advertencia!',
              text: 'No fue posible suspender la credencial. Intenta nuevamente.',
              icon: 'warning',
              confirmButtonText: 'Aceptar',
              allowOutsideClick: false,
              customClass: {
                popup: 'swal-theme',
              }
            });
          }
        });
      }
    });
  }
}