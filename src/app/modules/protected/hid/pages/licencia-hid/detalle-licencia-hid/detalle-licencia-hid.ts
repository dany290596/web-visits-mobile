import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LicenciaHIDService } from '../../../services/licencia-hid.service';

import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-detalle-licencia-hid',
  imports: [
    CommonModule,
    TagModule,
  ],
  templateUrl: './detalle-licencia-hid.html',
  styleUrl: './detalle-licencia-hid.css',
})
export class DetalleLicenciaHid {
  private srvLicenciaHID = inject(LicenciaHIDService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvLicenciaHID.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {          
          this.data = s.data;
          console.log("DATA ::: ", this.data);
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }
}