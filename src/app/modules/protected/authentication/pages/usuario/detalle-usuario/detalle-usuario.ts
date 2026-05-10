import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';

import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-detalle-usuario',
  imports: [
    TagModule,
  ],
  templateUrl: './detalle-usuario.html',
  styleUrl: './detalle-usuario.css',
})
export class DetalleUsuario {
  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  public data: any;

  private srvUsuario = inject(UsuarioService);

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvUsuario.getById(this.id).subscribe((s: any) => {
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