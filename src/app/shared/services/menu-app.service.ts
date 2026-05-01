import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IMenuFilter, IValidateAccessFilter } from '../interfaces/menu-app.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class MenuAppService {
    constructor(
        private http: HttpClient
    ) { }

    getSectionsGroupedByModule(filter: IMenuFilter): Observable<any> {
        let params = new HttpParams();

        if (filter.PerfilId !== null && filter.PerfilId !== undefined && filter.PerfilId !== "") {
            params = params.set('PerfilId', filter.PerfilId);
        }
        if (filter.TipoUsuarioId !== null && filter.TipoUsuarioId !== undefined && filter.TipoUsuarioId !== "") {
            params = params.set('TipoUsuarioId', filter.TipoUsuarioId);
        }

        return this.http.get(`${url}Menu/GetMenuGroupedByModule`, {
            headers: new HttpHeaders(
                {
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

    getValidateAccess(filter: IValidateAccessFilter): Observable<any> {
        let params = new HttpParams();

        if (filter.seccionId !== null && filter.seccionId !== undefined && filter.seccionId !== "") {
            params = params.set('seccionId', filter.seccionId);
        }
        if (filter.perfilId !== null && filter.perfilId !== undefined && filter.perfilId !== "") {
            params = params.set('perfilId', filter.perfilId);
        }

        return this.http.get(`${url}Menu/ValidateAccess`, {
            headers: new HttpHeaders(
                {
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
}