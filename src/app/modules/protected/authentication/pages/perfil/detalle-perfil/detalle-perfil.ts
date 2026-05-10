import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PerfilService } from '../../../services/perfil.service';

import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-detalle-perfil',
  imports: [
    TagModule,
  ],
  templateUrl: './detalle-perfil.html',
  styleUrl: './detalle-perfil.css',
})
export class DetallePerfil {
  private srvPerfil = inject(PerfilService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  public data: any;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvPerfil.getById(this.id).subscribe((s: any) => {
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