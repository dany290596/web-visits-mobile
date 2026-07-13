import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';

import { MessageService } from 'primeng/api';
import { PlataformaService } from '../../../../../../shared/services/plataforma.service';
import { UsuarioService } from '../../../../authentication/services/usuario.service';
import { PlantillaNotificacionService } from '../../../services/plantilla-notificacion.service';
import { VariablePlantillaService } from '../../../services/variable-plantilla.service';
import { StorageService } from '../../../../../auth/services/storage.service';

import { IUsuarioAutenticado } from '../../../../authentication/interfaces/usuario.interface';

import { IPlantillaNotificacionRequest } from '../../../interfaces/plantilla-notificacion.interface';

import { AutocTipoPlantillaNotificacion } from '../../../components/autoc/autoc-tipo-plantilla-notificacion/autoc-tipo-plantilla-notificacion';
import { PnlVariablesNotificacionAltaUsuario } from '../../../components/pnl/pnl-variables-notificacion-alta-usuario/pnl-variables-notificacion-alta-usuario';
import { PnlEditorPlantilla } from '../../../components/pnl/pnl-editor-plantilla/pnl-editor-plantilla';

import Swal from 'sweetalert2';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-agregar-plantilla-notificacion',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TooltipModule,
    ToggleSwitchModule,
    DatePickerModule,
    ChipModule,
    AutocTipoPlantillaNotificacion,
    PnlVariablesNotificacionAltaUsuario,
    PnlEditorPlantilla
  ],
  templateUrl: './agregar-plantilla-notificacion.html',
  styleUrl: './agregar-plantilla-notificacion.css',
  providers: [MessageService]
})
export class AgregarPlantillaNotificacion {
  @ViewChild('editorCuerpo') editorCuerpo!: PnlEditorPlantilla;

  @Output() closeModal = new EventEmitter<void>();
  @Output() guardadoExitoso = new EventEmitter<void>(); // para refrescar tabla
  @Input() id!: string;
  @Input() nombre!: string;

  private fb = inject(FormBuilder);
  private srvUsuario = inject(UsuarioService);
  private srvPlataforma = inject(PlataformaService);
  private srvMessage = inject(MessageService);
  private srvStorage = inject(StorageService);
  private srvPlantillaNotificacion = inject(PlantillaNotificacionService);
  private srvVariables = inject(VariablePlantillaService);

  userData!: IUsuarioAutenticado;

  formSubmitted = false;
  showPasswordExamples = false;
  passwordExamples: string[] = [];
  currentDate = new Date();

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    cuerpoPlantilla: ['', [Validators.required]],
    notificarEmail: [false],
    notificarTeams: [false],
    tipoPlantillaNotificacionId: ['', [Validators.required]],
  });

  get variablesActuales() {
    return this.srvVariables.obtenerVariables(this.form.value.tipoPlantillaNotificacionId);
  }

  ngOnInit(): void {
    this.srvStorage.userData$
      .pipe(
        filter((data: any) => !!data?.perfilId),
        take(1)
      )
      .subscribe((data: IUsuarioAutenticado) => {
        this.userData = data;
      });

    if (this.id !== undefined && this.id !== null && this.id !== "") {
    }
  }

  isInvalid(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.hasError(errorType) && (control.touched || this.formSubmitted);
  }

  guardar() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, complete todos los campos obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2563EB',
        customClass: { popup: 'swal-theme' }
      });
      return;
    }

    let email = 2;
    let teems = 2;

    if (this.form.value.notificarEmail) {
      email = 1;
    }

    if (this.form.value.notificarTeams) {
      teems = 1;
    }

    const formValue = this.form.value;
    const request = new IPlantillaNotificacionRequest();
    request.nombre = formValue.nombre;
    request.cuerpoPlantilla = formValue.cuerpoPlantilla;
    request.notificarEmail = email;
    request.notificarTeams = teems;
    request.identificador = null;
    request.tipoPlantillaNotificacionId = formValue.tipoPlantillaNotificacionId;
    request.empresaClienteId = this.userData.empresaId;

    // console.log("REQUEST ::: ", request);
    // console.log("REQUEST ::: ", JSON.stringify(request));

    this.srvPlantillaNotificacion.create(request).subscribe((resp: any) => {
      if (resp.respuesta === true) {
        this.srvMessage.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado', life: 3000 });
        this.form.reset();
        this.formSubmitted = false;
        Swal.fire({
          title: '¡Éxito!',
          text: 'La plantilla ha sido registrada.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false,
          customClass: { popup: 'swal-theme' }
        }).then((result) => {
          if (result.isConfirmed) {
            this.guardadoExitoso.emit();
            this.closeModal.emit();
          }
        });
      } else {
        this.srvMessage.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear', life: 5000 });
      }
    });
  }

  cerrar() {
    this.closeModal.emit();
  }

  insertarVariable(nombreVariable: string): void {
    this.editorCuerpo.insertarVariable(nombreVariable);
  }
}