import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { PlantillaNotificacionService } from '../../../services/plantilla-notificacion.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-detalle-plantilla-notificacion',
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ChipModule
  ],
  templateUrl: './detalle-plantilla-notificacion.html',
  styleUrl: './detalle-plantilla-notificacion.css',
})
export class DetallePlantillaNotificacion {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  private srvPlantilla = inject(PlantillaNotificacionService)

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvPlantilla.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          // console.log("DETALLE ::: ", JSON.stringify(s.data));
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }

  get cuerpoPlantilla(): string {
    if (!this.data?.cuerpoPlantilla) {
      return '';
    }

    return this.data.cuerpoPlantilla;
  }
}