import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ISeccionFilter } from '../interfaces/seccion.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class SeccionService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ISeccionFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.EmpresaId !== null && filter.EmpresaId !== undefined && filter.EmpresaId !== "") {
            params = params.set('EmpresaId', filter.EmpresaId);
        }
        if (filter.Estado !== null && filter.Estado !== undefined && filter.Estado !== 0) {
            params = params.set('Estado', filter.Estado);
        }
        if (filter.DatosCompletos !== null && filter.DatosCompletos !== undefined && filter.DatosCompletos !== 0) {
            params = params.set('DatosCompletos', filter.DatosCompletos);
        }
        if (filter.PageSize !== null && filter.PageSize !== undefined) {
            params = params.set('PageSize', filter.PageSize);
        }
        if (filter.PageNumber !== null && filter.PageNumber !== undefined) {
            params = params.set('PageNumber', filter.PageNumber);
        }

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            }),
            params: params
        };

        return this.http.get(`${url}Seccion/GetAll`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}Seccion/${id}`, {
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