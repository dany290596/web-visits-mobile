import { Component, Input, Output, EventEmitter, inject, effect } from '@angular/core';
import { IDataTable, IDataTableRegistro } from '../../interfaces/table-dynamic.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTable, DataTableRegistroCampo } from '../../clases/table-dynamic.clase';
import { CommonModule } from '@angular/common';

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
  selector: 'app-table-dynamic',
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
  templateUrl: './table-dynamic.html',
  styleUrl: './table-dynamic.css',
})
export class TableDynamic {
  private srvForm = inject(FormBuilder);

  _tabla: IDataTable = new DataTable();
  _registrosVisibles: IDataTableRegistro[] = [];

  @Input() minimo: number = 0;
  @Input() maximo: number = 10;
  @Input() paginaActual: number = 1;
  @Input() totalPaginas: number = 2;
  @Input() totalRegistros: number = 20;
  @Input() tituloTabla?: string = 'Registros encontrados';
  @Input() cargando: boolean = false;

  @Output() CambiarPaginaEmit = new EventEmitter();

  @Input() set tabla(valor: IDataTable) {
    this._registrosVisibles = [];
    this._tabla = new DataTable();
    this._tabla = valor;
  }

  @Input() maxFilasPagina: number = 20;

  @Output() onVer: EventEmitter<string> = new EventEmitter();
  @Output() onDet: EventEmitter<string> = new EventEmitter();
  @Output() onInactivar: EventEmitter<string> = new EventEmitter();
  @Output() onReactivar: EventEmitter<string> = new EventEmitter();

  Aumentar: boolean = true;

  constructor() {
    effect(() => {
    });
  }

  get tabla(): IDataTable {
    return this._tabla;
  }

  get registros() {

    this._registrosVisibles = [];

    if (this._tabla.registros.length > 0) {
      this._tabla.registros.forEach(reg => {
        if (reg.visualizar) {
          this._registrosVisibles.push(reg);
        }
      });
    }

    return this._registrosVisibles;
  }

  get paginasTotales(): number[] {
    let arrPaginas: number[] = [];
    for (var i = 1; i <= this.totalPaginas; i++) {
      arrPaginas.push(i);
    }
    return arrPaginas;
  }

  miFormulario: FormGroup = this.srvForm.group({
    palabraBuscada: ['']
  });

  ngOnInit(): void {
    this.maximo = this.maxFilasPagina;
    if (this.paginaActual === this.totalPaginas) {
      this.Aumentar = false;
    } else {
      this.Aumentar = true;
    }
  }

  cambiarExpandirRegistro(index: number) {
    if (this.tabla != null) {
      this._registrosVisibles[index].expandirRegistro = !this._registrosVisibles[index].expandirRegistro;
    }
  }

  toggleDetalle(registro: IDataTableRegistro) {
    registro.expandirRegistro = !registro.expandirRegistro;
  }

  cambiarPagina(pagina: number) {
    this.CambiarPaginaEmit.emit(pagina);

    if (pagina > 0) {
      this.minimo = (pagina * this.maxFilasPagina) - this.maxFilasPagina;
      this.maximo = (pagina * this.maxFilasPagina) - 1;
      this.paginaActual = pagina;
    }
    else {
      if (pagina == -1) {
        if (this.paginaActual == 1) { this.paginaActual = this.totalPaginas; }
        else { this.paginaActual--; }
      }

      if (pagina == -2) {
        if (this.paginaActual == this.totalPaginas) { this.paginaActual = 1; }
        else { this.paginaActual++; }
      }

      this.minimo = (this.paginaActual * this.maxFilasPagina) - this.maxFilasPagina;
      this.maximo = (this.paginaActual * this.maxFilasPagina) - 1;
    }
  }

  buscarEnTabla() {
    this.cambiarPagina(1);

    let palabra = this.miFormulario.value.palabraBuscada;

    if (this.tabla != null && this.tabla?.registros.length > 0) {

      this.tabla.registros.forEach(registro => {
        let booCoincide = false;

        registro.camposEnLinea.forEach(campo => {
          if (campo.tipoCampo == DataTableRegistroCampo.CAMPO_TEXTO || campo.tipoCampo == DataTableRegistroCampo.CAMPO_BADGE) {
            if (!booCoincide && campo.texto.toLowerCase().includes(palabra.toLowerCase())) {
              booCoincide = true;
            }
          }
          else if (campo.tipoCampo == DataTableRegistroCampo.CAMPO_ARR_TEXTO) {
            campo.arrTexto.forEach(strTexto => {
              if (!booCoincide && strTexto.toLowerCase().includes(palabra.toLowerCase())) {
                booCoincide = true;
              }
            });
          }
        });

        if (!booCoincide) {
          registro.camposEnDetalle.forEach(campo => {
            if (!booCoincide && campo.texto.toLowerCase().includes(palabra.toLowerCase())) {
              booCoincide = true;
            }
          });
        }

        registro.visualizar = booCoincide;
      });
    }
  }

  ver(id: string) {
    this.onVer.emit(id);
  }

  detalle(id: string) {
    this.onDet.emit(id);
  }

  inactivar(id: string) {
    this.onInactivar.emit(id);
  }

  reactivar(id: string) {
    this.onReactivar.emit(id);
  }

  onPageChange(event: any): void {
    const newPage = Math.floor(event.first / event.rows) + 1;
    this.cambiarPagina(newPage);
  }
}