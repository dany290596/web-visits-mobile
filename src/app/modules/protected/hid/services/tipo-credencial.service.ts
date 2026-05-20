import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ITipoCredencialFilter } from '../../../protected/hid/interfaces/tipo-credencial.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class TipoCredencialService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ITipoCredencialFilter): Observable<any> {
        let params = new HttpParams();

        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
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

        return this.http.get(`${url}TipoCredencial`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}TipoCredencial/${id}`, {
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