import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, finalize, switchMap, tap } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';

import Swal from 'sweetalert2';

// import { LicenciaRequest } from '../../../protected/configuraciones/interfaces/licencia.interface';
// import { LicenciaHardwareRequest } from '../../../protected/configuraciones/interfaces/licencia-hardware.interface';

import { AuthService } from '../../services/auth.service';
// import { PlataformaService } from '../../../shared/services/plataforma.service';
// import { LicenciaService } from '../../../protected/configuraciones/services/licencia.service';
// import { EncriptacionService } from '../../../protected/configuraciones/services/encriptacion.service';
// import { LicenciaHardwareService } from '../../../protected/configuraciones/services/licencia-hardware.service';
// import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    ToastModule,
    DialogModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    RippleModule,
    StyleClassModule,
    DividerModule,
    CheckboxModule,
    ProgressSpinnerModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputMaskModule,
    MessageModule,
    FloatLabelModule,
    ChipModule,
    TagModule
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn implements OnInit {
  private srvForm = inject(FormBuilder);
  private srvRouter = inject(Router);
  private srvAuth = inject(AuthService);
  // private srvPlataforma = inject(PlataformaService);
  // private srvLicencia = inject(LicenciaService);
  // private srvEncriptacion = inject(EncriptacionService);
  // private srvLicenciaHardware = inject(LicenciaHardwareService);
  // private srvStorage = inject(StorageService);

  miFormulario: FormGroup = this.srvForm.group({
    email: ['', [Validators.required]],
    contrasena: ['', [Validators.required, Validators.minLength(1)]],
    recuerdame: [false, []]
  });

  activacion: FormGroup = this.srvForm.group({
    codigo: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$")]],
    serial: ['', [Validators.required, Validators.minLength(6)]]
  });

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]).{8,255}$/;
  FormularioContrasena: FormGroup = this.srvForm.group({
    email: ['', [Validators.required, Validators.email]],
    codigo: ['', [Validators.required, Validators.minLength(8), this.numerosValidator()]],
    contrasena: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255),
      Validators.pattern(this.passwordRegex)
    ]],
    contrasenavalidacion: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255),
      Validators.pattern(this.passwordRegex)
    ]]
  }, {
    validators: [this.passwordsIgualesValidator]
  });
  LicenciaRequest: any[] = [];

  displayModal2: boolean = false;
  licencia: boolean = false;
  validandoLicencia: boolean = false;
  visible: boolean = false;
  cargarLicencia: boolean = false;
  CambiarContrasena: boolean = false;
  errorCorreo: boolean = false;
  PasoCambioContrasena: number = 1;
  showLabel: boolean = false;

  secondsLeft = 120;
  interval: any;
  timeIsUp = true;
  mostrarContrasena: boolean = false;

  hardware: any;

  numerosValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /^[0-9]+$/.test(control.value);
      return valid ? null : { numerosInvalidos: true };
    };
  }

  ngOnInit(): void {
    const contrasenaGuardada = localStorage.getItem("contrasena");
    const correoGuardado = localStorage.getItem("correo");

    if (contrasenaGuardada !== null || correoGuardado !== null) {
      this.miFormulario.setValue({
        email: correoGuardado ?? '',
        contrasena: contrasenaGuardada ?? '',
        recuerdame: true
      });
    }

    /*
    if (localStorage.getItem("codigoDeAccesibilidad") === null) {
      this.licencia = false;
      this.validarLicencia();
    }

    if (localStorage.getItem("codigoDeAccesibilidad") != null && localStorage.getItem("codigoDeAccesibilidad") != undefined) {
      this.licencia = true;
      this.validarCaducidad();
    }
    */

    this.licencia = true;

    this.FormularioContrasena.get('contrasenavalidacion')?.setValidators([
      Validators.required,
      Validators.minLength(6),
      this.passwordsMatchValidator.bind(this)
    ]);

    this.FormularioContrasena.get('contrasena')?.valueChanges.subscribe(() => {
      this.FormularioContrasena.get('contrasenavalidacion')?.updateValueAndValidity();
    });
  }

  login(): void {
    const { email, contrasena } = this.miFormulario.value;
    this.displayModal2 = true;

    Swal.fire({
      title: 'Iniciando sesión...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal-theme',
      }
    });

    this.srvAuth.login(email, contrasena).pipe(
      switchMap((resp: any) => {
        Swal.close();
        if (resp.respuesta === true) {
          // this.srvRouter.navigateByUrl('/layout/dashboard');
          return this.srvAuth.getDataUsuario();
        } else {
          Swal.fire({
            icon: 'warning',
            title: '¡Acceso denegado!',
            text: 'El nombre de usuario o la contraseña no son correctos.',
            confirmButtonText: 'Aceptar',
            customClass: {
              popup: 'swal-theme',
            }
          });
          return EMPTY;
        }
      }),
      tap((userResp: any) => {
        Swal.close();
        localStorage.setItem('empresa', userResp.data.empresaId);

        if (this.miFormulario.value.recuerdame) {
          localStorage.setItem('contrasena', contrasena);
          localStorage.setItem('correo', email);
        } else {
          localStorage.removeItem("contrasena");
          localStorage.removeItem("correo");
        }
      }),
      finalize(() => {
        this.displayModal2 = false;
      })
    ).subscribe({
      next: (user) => {
        Swal.close();
        // if (user.data.tipoUsuarioId === '9019a67a-1f11-4876-bceb-629c327bf659') {
        //   this.srvRouter.navigateByUrl('/portal/proveedor/agenda-proveedor');
        // } else {
        //   this.srvRouter.navigateByUrl('/portal/agenda/calendario');
        // }
        this.srvRouter.navigateByUrl('/layout/dashboard');
      },
      error: (error) => {
        Swal.close();
        if (error.message === 'Credenciales inválidas') {
          Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Usuario o contraseña incorrectos',
            customClass: {
              popup: 'swal-theme',
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Ocurrió un error inesperado',
            customClass: {
              popup: 'swal-theme',
            }
          });
        }
      }
    });
  }

  alternarVisibilidad() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  campoConErrores(nombreCampo: string): boolean {
    // return this.srvPlataforma.campoConErrores(this.miFormulario, nombreCampo);
    return false;
  }

  CampoInvalidoCorreo(campo: string) {
    return this.FormularioContrasena.controls[campo].errors && this.FormularioContrasena.controls[campo].touched
  }

  passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!this.FormularioContrasena) {
      return null;
    }

    const password = this.FormularioContrasena.get('contrasena')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  ingresar(proveedor: string) {
    // if (proveedor === 'google') {
    //   this.srvAuth.loginGoogle().then((resp: any) => {
    //   }).catch((err: any) => {
    //   });
    // }
  }

  licenciaRequest() {
    // const params = new LicenciaRequest();
    // let formLicencia = this.activacion.value;
    // params.codigoActivacion = formLicencia.codigo;
    // params.serial = formLicencia.serial;
    // return params;
  }

  licenciaHardwareRequest() {
    // const params = new LicenciaHardwareRequest();
    // let formLicencia = this.activacion.value;
    // params.codigoActivacion = formLicencia.codigo;
    // params.serial = formLicencia.serial;
    // params.cpuId = "U3E1";
    // params.cpuNombre = "Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz";
    // params.cpuDeviceId = "BFEBFBFF000906EA";
    // params.cpuSystemname = "Microsoft Windows 11 Pro";
    // params.baseboardSerialNumber = "/J1HJJV2/CNWS20092N01L0/";
    // params.baseboardManufacturer = "Dell Inc.";
    // params.baseBoardProduct = "03NJH0";
    // params.discoDuro = "ADATA SU800";
    // return params;
  }

  guardarLicencia() {
    // this.validandoLicencia = true;

    // const params = this.licenciaRequest();

    // this.srvLicenciaHardware.activateLicense(params).subscribe({
    //   next: (hardware) => {
    //     if (hardware.respuesta === true) {
    //       var tiempoTranscurrido = Date.now();
    //       var fechaActual = new Date(tiempoTranscurrido);
    //       var nuevaFechaActual = new Date(fechaActual);
    //       var modificarFechaActual = new Date(nuevaFechaActual.setDate(nuevaFechaActual.getDate() + 1));
    //       var encriptarFechaActual = modificarFechaActual.toLocaleString();

    //       let request: any = {
    //         cadena: encriptarFechaActual
    //       }

    //       this.srvEncriptacion.encriptar(request).subscribe((encriptar: any) => {
    //         let jsonDeLicencia: any = {
    //           'CadL1': hardware.data.l1,
    //           'CadL2': hardware.data.l2,
    //           'Cad': hardware.data.cad,
    //           'CaducidadL1': encriptar.data.l1,
    //           'CaducidadL2': encriptar.data.l2,
    //           'Caducidad': encriptar.data.cad
    //         }
    //         this.srvStorage.setLicense(jsonDeLicencia);

    //         if (localStorage.getItem("codigoDeAccesibilidad") != null && localStorage.getItem("codigoDeAccesibilidad") != undefined) {
    //           this.licencia = false;
    //           this.licencia = true;
    //           this.validandoLicencia = false;
    //         }
    //       }, (error: any) => {
    //         throw error;
    //       });

    //       Swal.fire({
    //         title: 'Datos válidos',
    //         html: '<hr style="margin:0;"><p style="margin:0; text-align: left;"><small style="font-weight: bold;">Código de Activación: </small><small>' + params.codigoActivacion + '</small></p>' +
    //           '<p style="margin:0; text-align: left;"><small style="font-weight: bold;">Serial: </small><small>' + params.serial + '</small></p>' +
    //           '<hr style="margin:0;"><p style="font-weight: bold;"><small>' + hardware.mensaje + '</p></small>',
    //         icon: 'success',
    //         customClass: {
    //           popup: 'swal-theme',
    //         }
    //       });
    //       this.licencia = true;
    //       this.validandoLicencia = false;
    //     }
    //     if (hardware.respuesta === false) {
    //       this.licencia = false;
    //       this.validandoLicencia = false;
    //       localStorage.removeItem('codigoDeAccesibilidad');
    //       Swal.fire({
    //         title: 'Datos no válidos',
    //         html: '<hr style="margin:0;"><p style="margin:0; text-align: left;"><small style="font-weight: bold;"></small><small>Consulte con el administrador los datos del hardware de su equipo</small></p>' +
    //           '<hr style="margin:0;"><p style="font-weight: bold;"><small>Intente nuevamente</p></small>',
    //         icon: 'error',
    //         customClass: {
    //           popup: 'swal-theme',
    //         }
    //       });
    //     }
    //     if (hardware.error) {
    //       this.licencia = false;
    //       this.validandoLicencia = false;
    //       localStorage.removeItem('codigoDeAccesibilidad');
    //       Swal.fire({
    //         title: 'Datos no válidos',
    //         html: `<hr style="margin:0;"><p style="margin:0; text-align: left;"><small style="font-weight: bold;"></small><small> ${hardware.error.mensaje} </small></p>` +
    //           '<hr style="margin:0;"><p style="font-weight: bold;"><small>Intente nuevamente</p></small>',
    //         icon: 'warning',
    //         customClass: {
    //           popup: 'swal-theme',
    //         }
    //       });
    //     }
    //   },
    //   error: (err) => {
    //     console.log("LICENCIA ERROR ::: ", err);

    //     const mensaje = err.error?.mensaje || "Error desconocido";

    //     Swal.fire(
    //       'Error de licencia',
    //       mensaje,
    //       'error'
    //     );

    //     this.licencia = false;
    //     this.validandoLicencia = false;
    //   }
    // });
  }

  validarLicencia() {

  }

  validarCaducidad() {
    // let codigoDeAccesibilidad: any = localStorage.getItem('codigoDeAccesibilidad');
    // let modificarCodigoDeAccesibilidad: any = JSON.parse(codigoDeAccesibilidad);
    // let caducidadL1: number = modificarCodigoDeAccesibilidad.CaducidadL1;
    // let caducidadL2: number = modificarCodigoDeAccesibilidad.CaducidadL2;
    // let caducidad: string = modificarCodigoDeAccesibilidad.Caducidad;

    // let request: any = {
    //   l1: caducidadL1,
    //   l2: caducidadL2,
    //   cad: caducidad
    // }

    // this.srvEncriptacion.desencriptarLicencia(request).subscribe((dl: any) => {
    //   const tiempoTranscurrido = Date.now();
    //   const fechaActual = new Date(tiempoTranscurrido);
    //   const fechaVencimiento = new Date(dl.data.cadena);
    //   var fA = new Date(fechaActual.toLocaleString());
    //   var fV = new Date(fechaVencimiento.toLocaleString());

    //   if (fA <= fV && fV >= fA) {
    //   }

    //   if (fA > fV && fV < fA) {
    //     this.validarLicencia();
    //   }
    // }, (error: any) => {
    //   throw error;
    // });
  }

  datoshardware() {
    // this.cargarLicencia = true;
    // this.visible = true;
    // this.srvLicenciaHardware.ObtenerLicenciaHardwareEquipo().subscribe((res: any) => {
    //   if (res.data) {
    //     this.hardware = res.data;
    //     this.cargarLicencia = false;
    //   } else {
    //     this.cargarLicencia = false;
    //   }
    // });
  }

  copiarTexto() {
    const text = `
    BaseBoardProduct: 03NJH0
    BaseboardManufacturer: Dell Inc.
    BaseboardSerialNumber: /J1HJJV2/CNWS20092N01L0/
    CpuDeviceId: BFEBFBFF000906EA
    cpuId: U3E1
    CpuNombre: Intel(R) Core(TM) i7-8700 CPU @ 3.20GHz
    CpuSystemname: Microsoft Windows 11 Pro
    DiscoDuro: ADATA SU800`;

    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  enviarCorreo() {
    // this.srvAuth.ObtenerCodigoRecuperacion(this.FormularioContrasena.value.email).subscribe((res: any) => {
    //   if (res === true) {
    //     this.errorCorreo = false;
    //     this.PasoCambioContrasena = 2;
    //   } else {
    //     this.errorCorreo = true;
    //   }
    // });
  }

  enviarCorreoNuevo() {
    // this.srvAuth.ObtenerCodigoRecuperacion(this.FormularioContrasena.value.email).subscribe((res: any) => {
    //   if (res === true) {
    //     this.errorCorreo = false;
    //     this.PasoCambioContrasena = 2;
    //     this.showLabel = true;
    //     this.startTimer();

    //     setTimeout(() => {
    //       this.showLabel = false;
    //     }, 5000);

    //   } else {
    //     this.errorCorreo = true;
    //   }
    // });
  }

  startTimer() {
    this.timeIsUp = false;
    this.secondsLeft = 120;
    this.interval = setInterval(() => {
      this.secondsLeft--;

      if (this.secondsLeft <= 0) {
        clearInterval(this.interval);
        this.timeIsUp = true;
      }
    }, 1000);
  }

  validarCodigo() {
    // this.srvAuth.ValidarCodigoRecuperacion(this.FormularioContrasena.value.codigo, this.FormularioContrasena.value.email).subscribe((res: any) => {
    //   if (res === true) {
    //     this.PasoCambioContrasena = 3;
    //     this.errorCorreo = false;
    //   } else {
    //     this.errorCorreo = true;
    //   }
    // });
  }

  cambiarContraForm() {
    // if (this.FormularioContrasena.value.contrasena !== this.FormularioContrasena.value.contrasenavalidacion) {
    //   return;
    // }

    // let datos = {
    //   correo: this.FormularioContrasena.value.email,
    //   codigo: this.FormularioContrasena.value.codigo,
    //   contrasena: this.FormularioContrasena.value.contrasena
    // };

    // this.srvAuth.RecuperarContrasena(datos).subscribe(async (res: any) => {
    //   if (res) {
    //     this.CambiarContrasena = false;
    //     var alert = (await Swal.fire('Éxito', 'Se cambió la contraseña del usuario correctamente.', 'success')).isConfirmed;
    //     if (alert) {
    //     }
    //     this.PasoCambioContrasena = 1;
    //     this.FormularioContrasena.reset();
    //   } else {
    //     this.errorCorreo = true;
    //   }
    // });
  }





  hasUpperCase(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[A-Z]/.test(value);
  }

  hasLowerCase(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[a-z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[0-9]/.test(value);
  }

  hasMinLength(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return value.length >= 8;
  }

  hasSpecialChar(): boolean {
    const value = this.FormularioContrasena.get('contrasena')?.value || '';
    return /[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?~-]/.test(value);
  }

  isPasswordValid(): boolean {
    const pass = this.FormularioContrasena.get('contrasena')?.value;
    const confirm = this.FormularioContrasena.get('contrasenavalidacion')?.value;
    return this.hasMinLength() &&
      this.hasUpperCase() &&
      this.hasLowerCase() &&
      this.hasNumber() &&
      this.hasSpecialChar() &&
      pass === confirm;
  }

  getPasswordStrengthClass(): string {
    const password = this.FormularioContrasena.get('contrasena')?.value || '';
    if (password.length === 0) return 'empty';
    if (password.length < 4) return 'weak';
    if (password.length < 8) return 'medium';

    const hasUpper = this.hasUpperCase();
    const hasLower = this.hasLowerCase();
    const hasNumber = this.hasNumber();
    const hasSpecial = this.hasSpecialChar();

    if (hasUpper && hasLower && hasNumber && hasSpecial) return 'strong';
    if ((hasUpper && hasLower && hasNumber) || (hasUpper && hasLower && hasSpecial)) return 'good';

    return 'medium';
  }

  getPasswordStrengthPercent(): number {
    const strengthClass = this.getPasswordStrengthClass();
    switch (strengthClass) {
      case 'empty': return 0;
      case 'weak': return 25;
      case 'medium': return 50;
      case 'good': return 75;
      case 'strong': return 100;
      default: return 0;
    }
  }

  passwordsIgualesValidator(form: FormGroup) {
    const pass = form.get('contrasena')?.value;
    const confirm = form.get('contrasenavalidacion')?.value;
    return pass === confirm ? null : { noCoincide: true };
  }
}