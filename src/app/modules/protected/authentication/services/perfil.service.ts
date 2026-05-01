import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IPerfilFilter, IPerfilRequest } from '../interfaces/perfil.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class PerfilService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IPerfilFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Nombre !== undefined && filter.Nombre !== null && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.Estado !== undefined && filter.Estado !== null && filter.Estado !== 0 && filter.Estado !== "") {
            params = params.set('Estado', filter.Estado);
        }
        if (filter.EmpresaId !== null && filter.EmpresaId !== undefined && filter.EmpresaId !== "") {
            params = params.set('EmpresaId', filter.EmpresaId);
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

        return this.http.get(`${url}Perfil/GetAll`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}Perfil/GetById/${id}`, {
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

    getByIdWithPermissions(id: string) {
        return this.http.get(`${url}Perfil/GetConPermisos/${id}`, {
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

    getByIdProfileAndIdSectionWithPermissions(idPerfil: string, idSeccion: string) {
        return this.http.get(`${url}PerfilPermiso/PerfilpermisoSeccionIds?IdPerfil=${idPerfil}&Seccion=${idSeccion}`, {
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

    create(request: IPerfilRequest): Observable<any> {
        return this.http.post(`${url}Perfil/Create`, request, {
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

    update(request: IPerfilRequest, id: string): Observable<any> {
        return this.http.put(`${url}Perfil/Update?id=${id}`, request, {
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
        console.log("URL  ", `${url}Perfil/Inactivate/${id}`,);
        return this.http.patch(`${url}Perfil/Inactivate/${id}`, null, {
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
        return this.http.patch(`${url}Perfil/Reactivate/${id}`, null, {
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