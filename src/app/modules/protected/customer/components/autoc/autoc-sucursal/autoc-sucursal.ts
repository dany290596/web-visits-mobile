import { CommonModule } from '@angular/common';
import { Component, inject, forwardRef, Optional, Attribute } from '@angular/core';
import { ControlContainer, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { forkJoin } from 'rxjs';

import { SucursalService } from '../../../services/sucursal.service';

@Component({
  selector: 'app-autoc-sucursal',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule
  ],
  template: `
    <label class="form-label">Sucursal <span class="text-red-500" *ngIf="isRequired">*</span></label>
    <p-autoComplete
      [ngModel]="valorSeleccionado"
      [suggestions]="filteredItems"
      (completeMethod)="filtrar($event)"
      optionLabel="label"
      dataKey="id"
      [dropdown]="true"
      placeholder="Busque por nombre o RFC"
      (onSelect)="onSelect($event)"
      (onClear)="onClear()"
      styleClass="w-full"
      appendTo="body"
      emptyMessage="No se encontraron resultados"
    >
      <ng-template let-item pTemplate="item">
        <div>{{ item.nombre }} <span class="text-muted-foreground">({{ item.rfc }})</span></div>
      </ng-template>
    </p-autoComplete>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutocSucursal),
    multi: true
  }]
})
export class AutocSucursal implements ControlValueAccessor {
  filteredItems: any[] = [];
  valorSeleccionado: any = null;
  private pendingValue: any = null;

  private srvSucursal = inject(SucursalService);

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(
    @Optional() private controlContainer: ControlContainer,
    @Attribute('formControlName') private controlName: string
  ) { }

  get isRequired(): boolean {
    if (this.controlContainer?.control && this.controlName) {
      const control = this.controlContainer.control.get(this.controlName);
      return control?.hasValidator(Validators.required) ?? false;
    }
    return false;
  }

  filtrar(event: any): void {
    const query = event.query ?? '';

    forkJoin({
      porNombre: this.srvSucursal.getAll({ Nombre: query, Estado: 1, PageSize: 20, PageNumber: 1 }),
      porRFC: this.srvSucursal.getAll({ RFC: query, Estado: 1, PageSize: 20, PageNumber: 1 })
    }).subscribe(({ porNombre, porRFC }) => {
      const encontrados: any[] = [];
      if (porNombre?.respuesta === true && Array.isArray(porNombre.data)) {
        encontrados.push(...porNombre.data);
      }
      if (porRFC?.respuesta === true && Array.isArray(porRFC.data)) {
        encontrados.push(...porRFC.data);
      }

      const unicos = new Map<string, any>();
      encontrados.forEach((item: any) => {
        unicos.set(item.id, {
          id: item.id,
          nombre: item.nombre,
          rfc: item.rfc,
          label: `${item.nombre} (${item.rfc})`
        });
      });

      this.filteredItems = Array.from(unicos.values());

      if (this.pendingValue) {
        this.valorSeleccionado = this.filteredItems.find(item => item.id === this.pendingValue) || null;
        this.pendingValue = null;
      }
    });
  }

  onSelect(event: any): void {
    const seleccionado = event.value;
    this.valorSeleccionado = seleccionado;
    this.onChange(seleccionado.id);
    this.onTouched();
  }

  onClear(): void {
    this.valorSeleccionado = null;
    this.onChange(null);
    this.onTouched();
  }

  writeValue(value: any): void {
    if (!value) {
      this.valorSeleccionado = null;
      return;
    }

    if (typeof value === 'object') {
      this.valorSeleccionado = value;
      return;
    }

    this.valorSeleccionado = this.filteredItems.find(item => item.id === value) || null;
    if (!this.valorSeleccionado) {
      this.pendingValue = value;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}
