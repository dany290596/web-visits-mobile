import { Component, EventEmitter, Input, Output } from '@angular/core';

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
    FormsModule
  ],
  templateUrl: './table-dynamic-simple.html',
  styleUrl: './table-dynamic-simple.css',
})
export class TableDynamicSimple {
  @Input() tabla: ISimpleTable = new SimpleTable();
  @Output() onEliminar: EventEmitter<number> = new EventEmitter();
  @Output() onEditar: EventEmitter<number> = new EventEmitter();

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
}