import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IUsuario } from '../../modules/protected/authentication/interfaces/usuario.interface';

@Injectable({
    providedIn: 'root'
})
export class PlataformaService {

    constructor() { }

    getNombreUsuarioLogueado(booNombreCompleto = true): string {
        let usuario: IUsuario;
        let strUsuario: string | null = localStorage.getItem('usuario');
        let strNombreCompleto = '';

        if (strUsuario !== null && strUsuario.length > 0) {
            usuario = JSON.parse(strUsuario);

            if (usuario.nombres.length > 0) {
                strNombreCompleto = usuario.nombres;

                if (booNombreCompleto && usuario.apellidoPaterno.length > 0) {
                    strNombreCompleto += ' ' + usuario.apellidoPaterno;

                    strNombreCompleto += (usuario.apellidoMaterno.length > 0) ? ' ' + usuario.apellidoMaterno : '';
                }
            }
        }

        return strNombreCompleto;
    }

    getIdUsuarioLogueado(): string {
        let usuario: IUsuario;
        let strUsuario: string | null = localStorage.getItem('usuario');
        let strId: string = '';

        if (strUsuario !== null && strUsuario.length > 0) {
            usuario = JSON.parse(strUsuario);

            if (usuario.usuarioId.length > 0) {
                strId = usuario.usuarioId;
            }
        }

        return strId;
    }

    getTokenGuardado(): string {
        const strToken: string | null = localStorage.getItem('token');

        if (strToken === null) { return ''; }

        return strToken;
    }

    campoConErrores(miFormulario: FormGroup, nombreCampo: string): boolean {
        let booOk = false;

        if (miFormulario.controls[nombreCampo].errors && miFormulario.controls[nombreCampo].touched) {
            booOk = true;
        }

        return booOk;
    }

    getVisibilidad(valor: boolean): string {
        return valor ? 'd-block' : 'd-none';
    }

    getFilaSombreada(valor: number): string {
        return (valor % 2 == 0) ? 'sombreado' : '';
    }

    getIdColaboradorLogueado(): string {
        let usuario: IUsuario;
        let strUsuario: string | null = localStorage.getItem('usuario');
        let strId: string = '';

        if (strUsuario !== null && strUsuario.length > 0) {
            usuario = JSON.parse(strUsuario);

            if (usuario.colaboradorId.length > 0) {
                strId = usuario.colaboradorId;
            }
        }

        return strId;
    }

    getDateMinimo() {
        let dteMinimo: Date = new Date(1900, 1, 1, 0, 0, 0);
        return dteMinimo;
    }

    getTema() {
        const strTema: string | null = localStorage.getItem('tema');
        if (strTema === null) { return 'light'; }
        return strTema;
    }

    setTema(tema: string) {
        if (tema === null || tema.trim().length === 0) { return };
        localStorage.setItem('tema', tema);
    }

    formatFechaVencimiento(fecha: any): string {
        if (!fecha) return '';

        const date = new Date(fecha);

        const pad = (n: number) => n.toString().padStart(2, '0');

        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        const ss = pad(date.getSeconds());

        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    date(date: any): string {
        const processDate = new Date(date);

        const yyyy = processDate.getFullYear();
        const mm = (processDate.getMonth() + 1).toString().padStart(2, '0');
        const dd = processDate.getDate().toString().padStart(2, '0');
        const hh = processDate.getHours().toString().padStart(2, '0');
        const min = processDate.getMinutes().toString().padStart(2, '0');
        const ss = processDate.getSeconds().toString().padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }

    hour(date: any): string {
        const processDate = new Date(date);

        const hh = processDate.getHours().toString().padStart(2, '0');
        const min = processDate.getMinutes().toString().padStart(2, '0');
        const ss = processDate.getSeconds().toString().padStart(2, '0');

        return `${hh}:${min}:${ss}`;
    }

    dateSimple(date: any): string {
        const processDate = new Date(date);

        const yyyy = processDate.getFullYear();
        const mm = (processDate.getMonth() + 1).toString().padStart(2, '0');
        const dd = processDate.getDate().toString().padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }

    dateFromFormat(fecha: any) {
        const fechaDate = new Date(fecha);
        var MM = ((fechaDate.getMonth() + 1) < 10 ? '0' : '') + (fechaDate.getMonth() + 1);
        var dd = ((fechaDate.getDate() + 1) < 10 ? '0' : '') + (fechaDate.getDate());
        return fechaDate.getFullYear() + "-" + MM + "-" + dd + " " + "00" + ":" + "00" + ":" + "00";
    }

    dateToFormat(fecha: any) {
        const fechaDate = new Date(fecha);
        var MM = ((fechaDate.getMonth() + 1) < 10 ? '0' : '') + (fechaDate.getMonth() + 1);
        var dd = ((fechaDate.getDate() + 1) < 10 ? '0' : '') + (fechaDate.getDate());
        return fechaDate.getFullYear() + "-" + MM + "-" + dd + " " + "23" + ":" + "59" + ":" + "59";
    }
}