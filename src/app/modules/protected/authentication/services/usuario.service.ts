import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IUsuarioFilter } from '../interfaces/usuario.interface';
import { IUsuarioRequest } from '../../../protected/authentication/interfaces/usuario.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class UsuarioService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IUsuarioFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Correo !== null && filter.Correo !== undefined && filter.Correo !== "") {
            params = params.set('Correo', filter.Correo);
        }
        if (filter.EmpresaId !== null && filter.EmpresaId !== undefined && filter.EmpresaId !== "") {
            params = params.set('EmpresaId', filter.EmpresaId);
        }
        if (filter.PerfilId !== null && filter.PerfilId !== undefined && filter.PerfilId !== "") {
            params = params.set('PerfilId', filter.PerfilId);
        }
        if (filter.TipoUsuarioId !== null && filter.TipoUsuarioId !== undefined && filter.TipoUsuarioId !== "") {
            params = params.set('TipoUsuarioId', filter.TipoUsuarioId);
        }
        if (filter.IdAsociado !== null && filter.IdAsociado !== undefined && filter.IdAsociado !== "") {
            params = params.set('IdAsociado', filter.IdAsociado);
        }
        if (filter.Vence !== null && filter.Vence !== undefined && filter.Vence !== 0 && filter.Vence !== '') {
            params = params.set('Vence', filter.Vence);
        }
        if (filter.Estado !== null && filter.Estado !== undefined && filter.Estado !== 0 && filter.Estado !== '') {
            params = params.set('Estado', filter.Estado);
        }
        if (filter.DatosCompletos !== null && filter.DatosCompletos !== undefined && filter.DatosCompletos !== 0) {
            params = params.set('DatosCompletos', filter.DatosCompletos);
        }
        if (filter.DataComplete !== null && filter.DataComplete !== undefined && filter.DataComplete !== 0) {
            params = params.set('DataComplete', filter.DataComplete);
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

        return this.http.get(`${url}Usuario/GetAll`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}Usuario/GetById/${id}`, {
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

    create(request: IUsuarioRequest): Observable<any> {
        return this.http.post(`${url}Usuario/Create`, request, {
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

    update(request: IUsuarioRequest, id: string): Observable<any> {
        return this.http.put(`${url}Usuario/Update?id=${id}`, request, {
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

    inactivate(id: string) {
        return this.http.patch(`${url}Usuario/Inactivate/${id}`, null, {
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

    reactivate(id: string) {
        return this.http.patch(`${url}Usuario/Reactivate/${id}`, null, {
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

    CambiarContrasena(puesto: any) {
        return this.http.post(`${url}Usuario/CambiarContrasena/CambiarContrasena`, puesto, {
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