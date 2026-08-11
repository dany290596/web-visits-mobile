import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { SimpleTable } from '../../clases/table-dynamic-simple.clase';

import { ISimpleTable } from '../../interfaces/table-dynamic-simple.interface';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-table-dynamic-simple',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    AccordionModule,
    BadgeModule,
    ButtonModule,
    DividerModule,
    PaginatorModule,
    SkeletonModule,
    ProgressBarModule,
    TableModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    SelectModule,
    TagModule,
    AvatarModule,
    FormsModule,
    MenuModule
  ],
  templateUrl: './table-dynamic-simple.html',
  styleUrl: './table-dynamic-simple.css',
})
export class TableDynamicSimple {
  @Input() tabla: ISimpleTable = new SimpleTable();
  @Output() onEliminar: EventEmitter<number> = new EventEmitter();
  @Output() onEditar: EventEmitter<number> = new EventEmitter();

  @ViewChild('accionesMenu') accionesMenu?: Menu;
  accionesMenuItems: MenuItem[] = [];

  ngOnInit(): void {
  }

  cambiarExpandirRegistro(index: number) {
    this.tabla.registros[index].expandirRegistro = !this.tabla.registros[index].expandirRegistro;
  }

  eliminar(index: number) {
    this.onEliminar.emit(index);
  }

  editar(index: number) {
    this.onEditar.emit(index);
  }

  abrirMenuAcciones(event: Event, registro: any, index: number): void {
    const items: MenuItem[] = [];

    if (this.tabla.AccionDetalle) {
      items.push({
        label: registro.expandirRegistro ? 'Ocultar detalles' : 'Mostrar detalles',
        icon: registro.expandirRegistro ? 'pi pi-chevron-up' : 'pi pi-chevron-down',
        command: () => this.cambiarExpandirRegistro(index),
      });
    }

    if (this.tabla.AccionVer) {
      items.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editar(index),
      });
    }

    if (this.tabla.AccionEliminar) {
      items.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: () => this.eliminar(index),
      });
    }

    this.accionesMenuItems = items;
    this.accionesMenu?.toggle(event);
  }
}