import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUsuarioHIDFilter, IUsuarioHIDRequest } from '../../../protected/hid/interfaces/usuario-hid.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class UsuarioHIDService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IUsuarioHIDFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.LicenciaId !== null && filter.LicenciaId !== undefined && filter.LicenciaId !== "") {
            params = params.set('LicenciaId', filter.LicenciaId);
        }
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.Email !== null && filter.Email !== undefined && filter.Email !== "") {
            params = params.set('Email', filter.Email);
        }
        if (filter.UserId !== null && filter.UserId !== undefined && filter.UserId !== "") {
            params = params.set('UserId', filter.UserId);
        }
        if (filter.Site !== null && filter.Site !== undefined && filter.Site !== "") {
            params = params.set('Site', filter.Site);
        }
        if (filter.Alert !== null && filter.Alert !== undefined && filter.Alert !== '') {
            params = params.set('Alert', filter.Alert);
        }
        if (filter.LicenseCount !== null && filter.LicenseCount !== undefined && filter.LicenseCount !== "") {
            params = params.set('LicenseCount', filter.LicenseCount);
        }
        if (filter.Telefono !== null && filter.Telefono !== undefined && filter.Telefono !== "") {
            params = params.set('Telefono', filter.Telefono);
        }
        if (filter.InvitacionFecha !== null && filter.InvitacionFecha !== undefined && filter.InvitacionFecha !== "") {
            params = params.set('InvitacionFecha', filter.InvitacionFecha);
        }
        if (filter.InvitacionExpirationDate !== null && filter.InvitacionExpirationDate !== undefined && filter.InvitacionExpirationDate !== "") {
            params = params.set('InvitacionExpirationDate', filter.InvitacionExpirationDate);
        }
        if (filter.InvitacionActividad !== null && filter.InvitacionActividad !== undefined && filter.InvitacionActividad !== "") {
            params = params.set('InvitacionActividad', filter.InvitacionActividad);
        }
        if (filter.InvitacionDetalle !== null && filter.InvitacionDetalle !== undefined && filter.InvitacionDetalle !== '') {
            params = params.set('InvitacionDetalle', filter.InvitacionDetalle);
        }
        if (filter.Status !== null && filter.Status !== undefined && filter.Status !== '') {
            params = params.set('Status', filter.Status);
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

        return this.http.get(`${url}UsuarioHID`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}UsuarioHID/${id}`, {
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

    create(request: IUsuarioHIDRequest): Observable<any> {
        return this.http.post(`${url}UsuarioHID`, request, {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Empresa': `${localStorage.getItem('empresa')}`
                })
        })
            .pipe(
                catchError((e: any) =>
                    of(e)
                ),
                switchMap((response: any) => {
                    return of(response);
                })
            );
    }

    update(request: IUsuarioHIDRequest, id: string): Observable<any> {
        return this.http.put(`${url}UsuarioHID/Update?id=${id}`, request, {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Empresa': `${localStorage.getItem('empresa')}`
                })
        })
            .pipe(
                catchError((e: any) =>
                    of(e)
                ),
                switchMap((response: any) => {
                    return of(response);
                })
            );
    }
}