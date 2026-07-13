import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ISucursalFilter } from '../interfaces/sucursal.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})
export class SucursalService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ISucursalFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== '') {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.RFC !== null && filter.RFC !== undefined && filter.RFC !== '') {
            params = params.set('RFC', filter.RFC);
        }
        if (filter.Estado !== null && filter.Estado !== undefined) {
            params = params.set('Estado', filter.Estado);
        }
        if (filter.EmpresaClienteId !== null && filter.EmpresaClienteId !== undefined && filter.EmpresaClienteId !== '') {
            params = params.set('EmpresaClienteId', filter.EmpresaClienteId);
        }
        if (filter.PageSize !== null && filter.PageSize !== undefined) {
            params = params.set('PageSize', filter.PageSize);
        }
        if (filter.PageNumber !== null && filter.PageNumber !== undefined) {
            params = params.set('PageNumber', filter.PageNumber);
        }

        return this.http.get(`${url}Sucursal`, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            }),
            params: params
        }).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    vincularEmpresaCliente(sucursalId: string, empresaClienteId: string): Observable<any> {
        return this.http.put(`${url}Sucursal/VincularEmpresaCliente/${sucursalId}`, { empresaClienteId }, {
            headers: new HttpHeaders({
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
