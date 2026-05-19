import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, forwardRef, Optional, Attribute } from '@angular/core';
import { ControlContainer, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect'; // ✅ Cambio a MultiSelect

import { TipoCredencialService } from '../../../services/tipo-credencial.service';

@Component({
  selector: 'app-mselect-tipo-credencial-hid',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule
  ],
  template: `
    <label class="form-label">Tipo credencial <span class="text-red-500" *ngIf="isRequired">*</span></label>
    <p-multiSelect
      [ngModel]="valorSeleccionado"
      [options]="items"
      optionLabel="nombre"
      dataKey="id"
      [filter]="true"
      filterBy="nombre"
      placeholder="Busque tipo de credencial"
      (onChange)="onChangeMulti($event)"
      (onClear)="onClear()"
      styleClass="w-full"
      emptyFilterMessage="No se encontraron resultados"
    ></p-multiSelect>
  `,
  styleUrl: './mselect-tipo-credencial-hid.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MselectTipoCredencialHid),
    multi: true
  }]
})
export class MselectTipoCredencialHid implements OnInit, ControlValueAccessor {
  items: any[] = [];
  valorSeleccionado: any[] = [];  // Array de objetos seleccionados
  private pendingValue: any[] = []; // Cambiado a array para multi-selección

  private srvTipoCredencial = inject(TipoCredencialService);

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(
    @Optional() private controlContainer: ControlContainer,
    @Attribute('formControlName') private controlName: string
  ) { }

  ngOnInit() {
    this.cargarTiposCredenciales();
  }

  get isRequired(): boolean {
    if (this.controlContainer?.control && this.controlName) {
      const control = this.controlContainer.control.get(this.controlName);
      return control?.hasValidator(Validators.required) ?? false;
    }
    return false;
  }

  cargarTiposCredenciales() {
    const idExcluir = '442aeb8f-f667-4210-be63-f7f2822dfdf5';
    this.srvTipoCredencial.getAll({ Estado: 1, PageNumber: 1, PageSize: 1000 }).subscribe((res: any) => {
      if (res?.respuesta) {
        this.items = res.data.map((m: any) => ({ id: m.id, nombre: m.nombre }))
          .filter((item: any) => item.id !== idExcluir);
        if (this.pendingValue) {
          // Mapea los IDs pendientes a objetos
          this.valorSeleccionado = this.items.filter(item => this.pendingValue.includes(item.id));
          this.pendingValue = [];
        }
      }
    });
  }

  // Evento al seleccionar/desseleccionar ítems
  onChangeMulti(event: any) {
    // event.value contiene el array de objetos seleccionados
    this.valorSeleccionado = event.value || [];
    const ids = this.valorSeleccionado.map(item => item.id);
    this.onChange(ids);
    this.onTouched();
  }

  onClear() {
    this.valorSeleccionado = [];
    this.onChange([]);
    this.onTouched();
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      this.valorSeleccionado = [];
      return;
    }

    // Si vienen objetos completos
    if (Array.isArray(value) && typeof value[0] === 'object') {
      this.valorSeleccionado = value;
      return;
    }

    // Si vienen IDs (array de strings)
    if (this.items.length) {
      this.valorSeleccionado = this.items.filter(item => value.includes(item.id));
    } else {
      // Guarda los IDs para mapear cuando la data esté lista
      this.pendingValue = value;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}