import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, forwardRef, Optional, Attribute } from '@angular/core';
import { ControlContainer, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { DispositivoHIDService } from '../../../services/dispositivo-hid.service';

@Component({
  selector: 'app-autoc-dispositivo-hid',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule
  ],
  template: `
    <label class="form-label">Dispositivo HID <span class="text-red-500" *ngIf="isRequired">*</span></label>
    <p-autoComplete
      [ngModel]="valorSeleccionado"
      [suggestions]="filteredItems"
      (completeMethod)="filtrar($event)"
      optionLabel="nombre"
      dataKey="id"
      [dropdown]="true"
      placeholder="Busque dispositivo HID"
      (onSelect)="onSelect($event)"
      (onClear)="onClear()"
      styleClass="w-full"
      emptyMessage="No se encontraron resultados"
    >
      <ng-template let-item pTemplate="item">
        <div>{{ item.nombre }}</div>
      </ng-template>
    </p-autoComplete>
  `,
  styleUrl: './autoc-dispositivo-hid.css',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocDispositivoHid),
    multi: true
  }]
})
export class AutocDispositivoHid implements OnInit, ControlValueAccessor {
  items: any[] = [];
  filteredItems: any[] = [];
  valorSeleccionado: any = null;
  private pendingValue: any = null;

  private srvDispositivoHID = inject(DispositivoHIDService);

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(
    @Optional() private controlContainer: ControlContainer,
    @Attribute('formControlName') private controlName: string
  ) { }

  ngOnInit() {
    this.cargarPerfiles();
  }

  get isRequired(): boolean {
    if (this.controlContainer?.control && this.controlName) {
      const control = this.controlContainer.control.get(this.controlName);
      return control?.hasValidator(Validators.required) ?? false;
    }
    return false;
  }

  cargarPerfiles() {
    const idExcluir = '442aeb8f-f667-4210-be63-f7f2822dfdf5';
    this.srvDispositivoHID.getAll({ Estado: 1, PageNumber: 1, PageSize: 1000 }).subscribe((res: any) => {
      if (res?.respuesta) {
        // this.items = res.data.map((m: any) => ({ id: m.id, nombre: m.nombre }));
        this.items = res.data.map((m: any) => ({ id: m.id, nombre: m.nombre })).filter((item: any) => item.id !== idExcluir);
        if (this.pendingValue) {
          this.valorSeleccionado = this.items.find(item => item.id === this.pendingValue) || null;
          this.pendingValue = null;
        }
      }
    });
  }

  filtrar(event: any) {
    const query = event.query.toLowerCase();
    this.filteredItems = this.items.filter(item => item.nombre.toLowerCase().includes(query));
  }

  onSelect(event: any) {
    const seleccionado = event.value; // ✅ Clave del éxito
    this.valorSeleccionado = seleccionado;
    this.onChange(seleccionado.id);
    this.onTouched();
  }

  onClear() {
    this.valorSeleccionado = null;
    this.onChange(null);
    this.onTouched();
  }

  writeValue(value: any): void {

    if (!value) {
      this.valorSeleccionado = null;
      return;
    }

    // si viene objeto completo
    if (typeof value === 'object') {
      this.valorSeleccionado = value;
      return;
    }

    // si viene solo id
    if (this.items.length) {
      this.valorSeleccionado =
        this.items.find(item => item.id === value) || null;
    } else {
      this.pendingValue = value;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}