import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EmpresaService } from '../../../services/empresa.service';
import { SucursalService } from '../../../services/sucursal.service';

import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AutocSucursal } from '../../../components/autoc/autoc-sucursal/autoc-sucursal';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-empresa',
  imports: [
    CommonModule,
    FormsModule,
    TagModule,
    AutocSucursal,
  ],
  templateUrl: './detalle-empresa.html',
  styleUrl: './detalle-empresa.css',
})
export class DetalleEmpresa {
  private srvEmpresa = inject(EmpresaService);
  private srvSucursal = inject(SucursalService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>();
  @Input() id!: string;
  @Input() nombre!: string;

  public data: any;

  sucursalId: string | null = null;
  vinculando: boolean = false;

  sucursalesVinculadas: any[] = [];
  cargandoSucursales: boolean = false;

  ngOnInit(): void {
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvEmpresa.getComplete(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {

          this.data = s.data;
          console.log("DATA ::: ", this.data );
        }
      });

      this.cargarSucursalesVinculadas();
    }
  }

  private cargarSucursalesVinculadas(): void {
    this.cargandoSucursales = true;
    this.srvSucursal.getAll({ EmpresaClienteId: this.id, Estado: 1 }).subscribe({
      next: (response: any) => {
        this.cargandoSucursales = false;
        this.sucursalesVinculadas = response?.respuesta === true && Array.isArray(response.data) ? response.data : [];
      },
      error: () => {
        this.cargandoSucursales = false;
        this.sucursalesVinculadas = [];
      }
    });
  }

  vincularSucursal(): void {
    if (!this.sucursalId) {
      return;
    }

    this.vinculando = true;
    this.srvSucursal.vincularEmpresaCliente(this.sucursalId, this.id).subscribe({
      next: (response: any) => {
        this.vinculando = false;
        if (response?.respuesta === true) {
          Swal.fire({
            title: '¡Éxito!',
            text: response.mensaje || 'La sucursal se vinculó correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            timerProgressBar: true,
            customClass: {
              popup: 'swal-theme',
            }
          });
          this.sucursalId = null;
          this.cargarSucursalesVinculadas();
        } else {
          Swal.fire({
            title: '¡Advertencia!',
            text: response?.mensaje || 'No se pudo vincular la sucursal',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2563EB',
            customClass: {
              popup: 'swal-theme',
            }
          });
        }
      },
      error: () => {
        this.vinculando = false;
        Swal.fire({
          title: '¡Advertencia!',
          text: 'No se pudo vincular la sucursal',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2563EB',
          customClass: {
            popup: 'swal-theme',
          }
        });
      }
    });
  }

  cerrar() {
    this.closeModal.emit();
  }
}