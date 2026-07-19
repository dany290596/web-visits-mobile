import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { PlantillaCredencialService } from '../../../services/plantilla-credencial.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-detalle-plantilla-credencial',
  imports: [
    CommonModule, TagModule, CardModule
  ],
  templateUrl: './detalle-plantilla-credencial.html',
  styleUrl: './detalle-plantilla-credencial.css',
})
export class DetallePlantillaCredencial {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  private srvPlantillaCredencial = inject(PlantillaCredencialService);

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvPlantillaCredencial.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          // console.log("DETALLE DE LA PLANTILLA ::: ", s.data);
          this.data = s.data;
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }
}