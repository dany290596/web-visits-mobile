import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';

import { VariablePlantilla, VariablePlantillaService } from '../../../services/variable-plantilla.service';


@Component({
  selector: 'app-pnl-variables-notificacion-alta-usuario',
  imports: [
    InputTextModule,
    PasswordModule,
    MessageModule,
    TooltipModule,
    ToggleSwitchModule,
    DatePickerModule,
    ChipModule,
  ],
  templateUrl: './pnl-variables-notificacion-alta-usuario.html',
  styleUrl: './pnl-variables-notificacion-alta-usuario.css',
})
export class PnlVariablesNotificacionAltaUsuario {
  @Input() tipoPlantillaNotificacionId: string | null = null;
  @Output() variableSeleccionada = new EventEmitter<string>();

  variablesPlantilla: VariablePlantilla[] = [];

  private srvVariables = inject(VariablePlantillaService);

  ngOnChanges(): void {
    this.variablesPlantilla = this.srvVariables.obtenerVariables(this.tipoPlantillaNotificacionId);
  }

  seleccionar(nombreVariable: string): void {
    this.variableSeleccionada.emit(nombreVariable);
  }

  onDragStart(evento: DragEvent, nombreVariable: string): void {
    evento.dataTransfer?.setData('text/plain', nombreVariable);
    if (evento.dataTransfer) evento.dataTransfer.effectAllowed = 'copy';
  }
}