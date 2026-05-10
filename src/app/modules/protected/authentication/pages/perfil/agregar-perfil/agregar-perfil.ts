import { Component, inject, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

import { PnlPerfilPermiso } from '../../../components/pnl/pnl-perfil-permiso/pnl-perfil-permiso';

import { PerfilService } from '../../../services/perfil.service';
import { SeccionService } from '../../../services/seccion.service';
import { MessageService } from 'primeng/api';

import { IPerfilRequest, IPerfilPermisoSeccion } from '../../../interfaces/perfil.interface';
import { ISeccionFilter, ISeccionResponse } from '../../../interfaces/seccion.interface';
import { IModuloSeccionResponse } from '../../../interfaces/modulo.interface';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-perfil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    TooltipModule,
    PnlPerfilPermiso
  ],
  templateUrl: './agregar-perfil.html',
  styleUrl: './agregar-perfil.css',
  providers: [MessageService]
})
export class AgregarPerfil implements OnInit {
  private srvPerfil = inject(PerfilService);
  private srvSeccion = inject(SeccionService);
  private srvMessage = inject(MessageService);

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<any>(); // para refrescar la tabla
  @Input() id!: string;
  @Input() nombre!: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Listas necesarias para el panel de permisos
  listaSecciones: ISeccionResponse[] = [];
  listaSeccionesAgrupadas: IModuloSeccionResponse[] = [];
  listaSeccionesSeleccionadas: ISeccionResponse[] = [];

  miFormulario: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
  });

  ngOnInit(): void {
    this.cargarSecciones();
    if (this.id !== undefined && this.id !== null && this.id !== "") {
      this.srvPerfil.getById(this.id).subscribe((s: any) => {
        if (s.respuesta === true) {
          console.log(s);
          this.miFormulario.controls['nombre'].setValue(s.data.nombre);
        }
      });
    }
  }

  private cargarSecciones(): void {
    const filter: ISeccionFilter = {
      PageNumber: 1,
      PageSize: 1000,
      DatosCompletos: 1
    };

    this.srvSeccion.getAll(filter).subscribe((data: any) => {
      if (data.respuesta == true) {
        this.listaSecciones = data.data.map((m: any) => ({
          id: m.id,
          moduloId: m.moduloId,
          nombre: m.nombre,
          modulo: m.modulo && Object.keys(m.modulo).length > 0
            ? { id: m.modulo.id, nombre: m.modulo.nombre }
            : undefined
        } as ISeccionResponse));

        this.listaSeccionesAgrupadas = Array.from(
          this.listaSecciones.reduce((map, seccion) => {
            const modulo = seccion.modulo;
            if (!modulo) return map;
            if (!map.has(modulo.id)) {
              map.set(modulo.id, {
                id: modulo.id,
                nombre: modulo.nombre,
                secciones: []
              });
            }
            map.get(modulo.id).secciones.push({
              id: seccion.id,
              nombre: seccion.nombre,
              moduloId: seccion.moduloId
            });
            return map;
          }, new Map())
        ).map(([_, group]) => group);

        // console.log("JSON ::: ", JSON.stringify(this.listaSeccionesAgrupadas));
      }
    });
  }

  // Recibe las secciones seleccionadas del componente hijo
  eventSeccionesSeleccionadas(secciones: ISeccionResponse[]): void {
    this.listaSeccionesSeleccionadas = secciones;
  }

  guardar(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Complete el campo obligatorio.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    if (this.listaSeccionesSeleccionadas.length === 0) {
      Swal.fire({
        title: '¡No se puede crear el perfil!',
        text: 'Debe asignar al menos un permiso al perfil para poder continuar.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    const form = this.miFormulario.value;
    const request = new IPerfilRequest();
    request.nombre = form.nombre;
    request.perfilPermisoSecciones = this.listaSeccionesSeleccionadas.map((m: ISeccionResponse) => ({
      seccionId: m.id,
      permiso: m.permisoId,
      vence: 2,
      fechaVencimiento: null
    } as IPerfilPermisoSeccion));

    this.srvPerfil.create(request).subscribe((data: any) => {
      if (data.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil creado', life: 3000 });
        this.miFormulario.reset();
        this.listaSeccionesSeleccionadas = [];
        Swal.fire({
          title: '¡Éxito!',
          text: 'El perfil ha sido registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: { popup: 'swal-theme' }
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardadoExitoso.emit({ creado: true });
            this.closeModal.emit();
          }
        });
      } else {
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el perfil', life: 5000 });
      }
    });
  }

  cerrar(): void {
    this.closeModal.emit();
  }
}