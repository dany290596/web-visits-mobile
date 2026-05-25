import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EmpresaService } from '../../../services/empresa.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-empresa',
  imports: [
    CommonModule,
    TagModule,
  ],
  templateUrl: './detalle-empresa.html',
  styleUrl: './detalle-empresa.css',
})
export class DetalleEmpresa {
  private srvEmpresa = inject(EmpresaService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvEmpresa.getComplete(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          
          this.data = s.data;
          console.log("DATA ::: ", this.data );
        }
      });
    }
  }

  cerrar() {
    this.closeModal.emit();
  }
}