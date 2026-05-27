import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { UsuarioHIDService } from '../../../services/usuario-hid.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

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
          console.log(s);
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }
}