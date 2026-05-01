import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ICredencialHIDFilter } from '../../../protected/hid/interfaces/credencial-hid.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class CredencialHIDService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ICredencialHIDFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.TipoCredencial !== null && filter.TipoCredencial !== undefined && filter.TipoCredencial !== "") {
            params = params.set('TipoCredencial', filter.TipoCredencial);
        }
        if (filter.DispositivoId !== null && filter.DispositivoId !== undefined && filter.DispositivoId !== "") {
            params = params.set('DispositivoId', filter.DispositivoId);
        }
        if (filter.Usuarioid !== null && filter.Usuarioid !== undefined && filter.Usuarioid !== "") {
            params = params.set('Usuarioid', filter.Usuarioid);
        }
        if (filter.CredencialValor !== null && filter.CredencialValor !== undefined && filter.CredencialValor !== "") {
            params = params.set('CredencialValor', filter.CredencialValor);
        }
        if (filter.Validity !== null && filter.Validity !== undefined && filter.Validity !== "") {
            params = params.set('Validity', filter.Validity);
        }
        if (filter.Status !== null && filter.Status !== undefined && filter.Status !== 0 && filter.Status !== '') {
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

        return this.http.get(`${url}CredencialHID`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}CredencialHID/${id}`, {
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