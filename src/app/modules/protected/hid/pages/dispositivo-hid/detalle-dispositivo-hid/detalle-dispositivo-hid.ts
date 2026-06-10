import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { UsuarioHIDService } from '../../../services/usuario-hid.service';
import { DispositivoHIDService } from '../../../services/dispositivo-hid.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-dispositivo-hid',
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ChipModule
  ],
  templateUrl: './detalle-dispositivo-hid.html',
  styleUrl: './detalle-dispositivo-hid.css',
})
export class DetalleDispositivoHid {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  private srvDispositivoHID = inject(DispositivoHIDService);

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvDispositivoHID.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          console.log("CREDENCIAL ::: ", s.data);
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }
}