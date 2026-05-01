import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeTableModule } from 'primeng/treetable';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';

import { ISeccionResponse } from '../../../interfaces/seccion.interface';
import { IModuloSeccionResponse } from '../../../interfaces/modulo.interface';

interface Permiso {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-pnl-perfil-permiso',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputMaskModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    DividerModule,
    MessageModule,
    TooltipModule,
    CheckboxModule,
    TreeTableModule,
    PanelModule,
    RadioButtonModule
  ],
  templateUrl: './pnl-perfil-permiso.html',
  styleUrl: './pnl-perfil-permiso.css',
})
export class PnlPerfilPermiso implements OnInit {
  expandedModuloIndex: number | null = null;

  private fb = inject(FormBuilder);

  @Input() listaSeccionesAsignadas: ISeccionResponse[] = [];
  @Input() listaSeccionesAgrupadas: IModuloSeccionResponse[] = [];
  @Input() action: string = "";

  @Output() eventSeccionesSeleccionadas = new EventEmitter<any>();

  private seccionesEspeciales: string[] = [
    'f3522b60-1370-43eb-ac06-9093eba65cdb',
    '0fcb36f5-1bbe-4d36-a4e4-aec27fdb2e0b'
  ];

  permisos: Permiso[] = [
    { id: 1, nombre: 'Lectura' },
    { id: 2, nombre: 'Lectura y Escritura' },
    { id: 3, nombre: 'Lectura, Escritura y Eliminación' }
  ];

  form!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.setupPermisosListeners();
  }

  initializeForm(): void {
    if (this.action === 'ADD') {
      console.log(this.listaSeccionesAgrupadas);
      if (this.listaSeccionesAgrupadas.length !== 0) {
        this.form = this.fb.group({
          modulos: this.fb.array(this.listaSeccionesAgrupadas.map(modulo =>
            this.createModuloGroup(modulo)
          ))
        });
      }
    }

    if (this.action === 'UPDATE') {
      if (this.listaSeccionesAgrupadas.length !== 0) {
        const idsAsignados = this.listaSeccionesAsignadas.map(s => s.id);
        this.form = this.fb.group({
          modulos: this.fb.array(this.listaSeccionesAgrupadas.map(modulo => {
            const seccionesFormArray = this.fb.array(modulo.secciones.map(seccion => {
              const estaAsignada = idsAsignados.includes(seccion.id);
              const seccionAsignada = this.listaSeccionesAsignadas.find(s => s.id === seccion.id);

              let permisoSeleccionado = 1;
              if (this.esSeccionEspecial(seccion.id!)) {
                permisoSeleccionado = 2;
              } else if (seccionAsignada?.permisoId) {
                permisoSeleccionado = seccionAsignada.permisoId;
              }

              return this.fb.group({
                id: [seccion.id],
                nombre: [seccion.nombre],
                seleccionado: [estaAsignada],
                permisoSeleccionado: [permisoSeleccionado]
              });
            }));

            const todasSeleccionadas = modulo.secciones.every(seccion =>
              idsAsignados.includes(seccion.id)
            );

            return this.fb.group({
              id: [modulo.id],
              nombre: [modulo.nombre],
              seleccionado: [todasSeleccionadas],
              secciones: seccionesFormArray
            });
          }))
        });

        this.eventSeccionesSeleccionadas.emit(this.obtenerSeccionesSeleccionadas());
      }
    }
  }

  esSeccionEspecial(seccionId: string): boolean {
    return this.seccionesEspeciales.includes(seccionId);
  }

  getPermisosDisponibles(seccionId: string): Permiso[] {
    if (this.esSeccionEspecial(seccionId)) {
      // Solo mostrar el permiso 2 para secciones especiales
      return [this.permisos[1]]; // índice 1 = permiso 2
    }
    return this.permisos;
  }

  private setupPermisosListeners(): void {
    if (this.form) {
      this.modulos.controls.forEach((moduloCtrl, moduloIndex) => {
        const secciones = this.getSecciones(moduloIndex);
        secciones.controls.forEach((seccionCtrl, seccionIndex) => {
          const permisoControl = this.getPermisoControl(moduloIndex, seccionIndex);
          permisoControl.valueChanges.subscribe((nuevoPermisoId) => {
            const seccionId = this.getSeccionGroup(moduloIndex, seccionIndex).get('id')?.value;

            // Si es sección especial, forzar permiso 2
            if (this.esSeccionEspecial(seccionId)) {
              permisoControl.setValue(2, { emitEvent: false });
              return;
            }

            const seccionGroup = this.getSeccionGroup(moduloIndex, seccionIndex);
            seccionGroup.get('seleccionado')?.setValue(true, { emitEvent: false });

            // Actualizar estado del módulo
            this.actualizarEstadoModulo(moduloIndex);

            // Emitir cambios
            this.emitirCambios();
          });
        });
      });
    }
  }

  createModuloGroup(modulo: IModuloSeccionResponse): FormGroup {
    return this.fb.group({
      id: [modulo.id],
      nombre: [modulo.nombre],
      seleccionado: [false],
      secciones: this.fb.array(modulo.secciones.map(seccion =>
        this.createSeccionGroup(seccion)
      ))
    });
  }

  createSeccionGroup(seccion: any): FormGroup {
    // Para secciones especiales, valor inicial 2, sino 1
    const permisoInicial = this.esSeccionEspecial(seccion.id) ? 2 : 1;

    return this.fb.group({
      id: [seccion.id],
      nombre: [seccion.nombre],
      seleccionado: [false],
      permisoSeleccionado: [permisoInicial]
    });
  }

  togglePanel(index: number): void {
    this.expandedModuloIndex = this.expandedModuloIndex === index ? null : index;
  }

  get modulos() {
    return this.form.get('modulos') as FormArray;
  }

  getSecciones(moduloIndex: number): FormArray {
    return this.modulos.at(moduloIndex).get('secciones') as FormArray;
  }

  getSeccionGroup(moduloIndex: number, seccionIndex: number): FormGroup {
    return this.getSecciones(moduloIndex).at(seccionIndex) as FormGroup;
  }

  // Método para obtener el FormControl del permiso
  getPermisoControl(moduloIndex: number, seccionIndex: number): FormControl {
    return this.getSeccionGroup(moduloIndex, seccionIndex).get('permisoSeleccionado') as FormControl;
  }

  toggleModulo(moduloIndex: number) {
    const moduloCtrl = this.modulos.at(moduloIndex);
    const seleccionado = moduloCtrl.get('seleccionado')?.value;
    const secciones = this.getSecciones(moduloIndex);

    secciones.controls.forEach(seccionCtrl => {
      const seccionId = seccionCtrl.get('id')?.value;
      const permisoInicial = this.esSeccionEspecial(seccionId) ? 2 : 1;

      seccionCtrl.get('seleccionado')?.setValue(seleccionado, { emitEvent: false });
      if (seleccionado) {
        seccionCtrl.get('permisoSeleccionado')?.setValue(permisoInicial, { emitEvent: false });
      }
    });

    this.emitirCambios();
  }

  toggleSeccion(moduloIndex: number, seccionIndex: number) {
    const moduloCtrl = this.modulos.at(moduloIndex);
    const secciones = this.getSecciones(moduloIndex);
    const seccionCtrl = secciones.at(seccionIndex);
    const seleccionado = seccionCtrl.get('seleccionado')?.value;

    if (seleccionado) {
      const seccionId = seccionCtrl.get('id')?.value;
      const permisoInicial = this.esSeccionEspecial(seccionId) ? 2 : 1;
      seccionCtrl.get('permisoSeleccionado')?.setValue(permisoInicial, { emitEvent: false });
    }

    this.actualizarEstadoModulo(moduloIndex);
    this.emitirCambios();
  }

  // Método para actualizar el estado del módulo
  private actualizarEstadoModulo(moduloIndex: number): void {
    const moduloCtrl = this.modulos.at(moduloIndex);
    const secciones = this.getSecciones(moduloIndex);
    const allSelected = secciones.controls.every(seccionCtrl =>
      seccionCtrl.get('seleccionado')?.value === true
    );
    moduloCtrl.get('seleccionado')?.setValue(allSelected, { emitEvent: false });
  }

  cambiarPermiso(moduloIndex: number, seccionIndex: number, permisoId: number) {
    const seccionCtrl = this.getSeccionGroup(moduloIndex, seccionIndex);
    const seccionId = seccionCtrl.get('id')?.value;

    // Si es sección especial, no hacer nada (no cambiar el permiso)
    if (this.esSeccionEspecial(seccionId)) {
      return;
    }

    seccionCtrl.get('permisoSeleccionado')?.setValue(permisoId);
    seccionCtrl.get('seleccionado')?.setValue(true, { emitEvent: false });

    this.actualizarEstadoModulo(moduloIndex);
    this.emitirCambios();
  }

  obtenerSeccionesSeleccionadas(): any[] {
    const modulosForm = this.form.get('modulos')?.value;

    if (!modulosForm || !Array.isArray(modulosForm)) return [];

    const seccionesSeleccionadas: any[] = [];

    modulosForm.forEach((moduloForm: any) => {
      if (moduloForm?.secciones && Array.isArray(moduloForm.secciones)) {
        moduloForm.secciones.forEach((seccionForm: any) => {
          if (seccionForm?.seleccionado) {
            const permisoSeleccionado = this.permisos.find(p => p.id === seccionForm.permisoSeleccionado);

            if (permisoSeleccionado) {
              seccionesSeleccionadas.push({
                id: seccionForm.id,
                nombre: seccionForm.nombre,
                moduloId: moduloForm.id,
                permisoId: permisoSeleccionado.id,
                permisoNombre: permisoSeleccionado.nombre,
                esSeccionEspecial: this.esSeccionEspecial(seccionForm.id)
              });
            }
          }
        });
      }
    });

    return seccionesSeleccionadas;
  }

  getPermisoSeleccionado(moduloIndex: number, seccionIndex: number): number {
    const seccionCtrl = this.getSeccionGroup(moduloIndex, seccionIndex);
    return seccionCtrl.get('permisoSeleccionado')?.value || 1;
  }

  getSeccionesSeleccionadasCount(moduloIndex: number): number {
    const secciones = this.getSecciones(moduloIndex).controls;
    return secciones.filter(seccionCtrl => seccionCtrl.get('seleccionado')?.value).length;
  }

  private emitirCambios(): void {
    this.eventSeccionesSeleccionadas.emit(this.obtenerSeccionesSeleccionadas());
  }
}