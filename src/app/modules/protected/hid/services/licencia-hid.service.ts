import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ILicenciaHIDFilter } from '../../../protected/hid/interfaces/licencia-hid.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class LicenciaHIDService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ILicenciaHIDFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.NumeroParte !== null && filter.NumeroParte !== undefined && filter.NumeroParte !== "") {
            params = params.set('NumeroParte', filter.NumeroParte);
        }
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.EmpresaClienteId !== null && filter.EmpresaClienteId !== undefined && filter.EmpresaClienteId !== "") {
            params = params.set('EmpresaClienteId', filter.EmpresaClienteId);
        }
        if (filter.CantidadDisponible !== null && filter.CantidadDisponible !== undefined && filter.CantidadDisponible !== "") {
            params = params.set('CantidadDisponible', filter.CantidadDisponible);
        }
        if (filter.CantidadConsumida !== null && filter.CantidadConsumida !== undefined && filter.CantidadConsumida !== "") {
            params = params.set('CantidadConsumida', filter.CantidadConsumida);
        }
        if (filter.FechaInicio !== null && filter.FechaInicio !== undefined && filter.FechaInicio !== '') {
            params = params.set('FechaInicio', filter.FechaInicio);
        }
        if (filter.FechaFin !== null && filter.FechaFin !== undefined && filter.FechaFin !== '') {
            params = params.set('FechaFin', filter.FechaFin);
        }
        if (filter.EstadoLicencia !== null && filter.EstadoLicencia !== undefined && filter.EstadoLicencia !== '') {
            params = params.set('EstadoLicencia', filter.EstadoLicencia);
        }
        if (filter.EstadoPeriodo !== null && filter.EstadoPeriodo !== undefined && filter.EstadoPeriodo !== '') {
            params = params.set('EstadoPeriodo', filter.EstadoPeriodo);
        }
        if (filter.MensajeEstado !== null && filter.MensajeEstado !== undefined && filter.MensajeEstado !== '') {
            params = params.set('MensajeEstado', filter.MensajeEstado);
        }
        if (filter.EmpresaClienteId !== null && filter.EmpresaClienteId !== undefined && filter.EmpresaClienteId !== '') {
            params = params.set('EmpresaClienteId', filter.EmpresaClienteId);
        }
        if (filter.PageSize !== null && filter.PageSize !== undefined && filter.PageSize !== "") {
            params = params.set('PageSize', filter.PageSize);
        }
        if (filter.PageNumber !== null && filter.PageNumber !== undefined && filter.PageNumber !== "") {
            params = params.set('PageNumber', filter.PageNumber);
        }
        if (filter.DatosCompletos !== null && filter.DatosCompletos !== undefined && filter.DatosCompletos !== 0 && filter.DatosCompletos !== '') {
            params = params.set('DatosCompletos', filter.DatosCompletos);
        }
        if (filter.Estado !== null && filter.Estado !== undefined && filter.Estado !== 0 && filter.Estado !== '') {
            params = params.set('Estado', filter.Estado);
        }

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            }),
            params: params
        };

        return this.http.get(`${url}LicenciaHID`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}LicenciaHID/${id}`, {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Empresa': `${localStorage.getItem('empresa')}`
                })
        }).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }
}