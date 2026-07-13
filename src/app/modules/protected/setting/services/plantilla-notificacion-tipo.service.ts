import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IPlantillaNotificacionFilter, IPlantillaNotificacionRequest } from '../interfaces/plantilla-notificacion.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class PlantillaNotificacionTipoService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IPlantillaNotificacionFilter): Observable<any> {
        let params = new HttpParams();

        if (filter.Nombre !== undefined && filter.Nombre !== null && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.CuerpoPlantilla !== undefined && filter.CuerpoPlantilla !== null && filter.CuerpoPlantilla !== "") {
            params = params.set('CuerpoPlantilla', filter.CuerpoPlantilla);
        }
        if (filter.NotificarEmail !== undefined && filter.NotificarEmail !== null && filter.NotificarEmail !== "") {
            params = params.set('NotificarEmail', filter.NotificarEmail);
        }
        if (filter.NotificarTeams !== undefined && filter.NotificarTeams !== null && filter.NotificarTeams !== "") {
            params = params.set('NotificarTeams', filter.NotificarTeams);
        }
        if (filter.Identificador !== undefined && filter.Identificador !== null && filter.Identificador !== "") {
            params = params.set('Identificador', filter.Identificador);
        }
        if (filter.TipoPlantillaNotificacionId !== undefined && filter.TipoPlantillaNotificacionId !== null && filter.TipoPlantillaNotificacionId !== "") {
            params = params.set('TipoPlantillaNotificacionId', filter.TipoPlantillaNotificacionId);
        }
        if (filter.EmpresaClienteId !== null && filter.EmpresaClienteId !== undefined && filter.EmpresaClienteId !== "") {
            params = params.set('EmpresaClienteId', filter.EmpresaClienteId);
        }
        if (filter.Estado !== undefined && filter.Estado !== null && filter.Estado !== 0 && filter.Estado !== "") {
            params = params.set('Estado', filter.Estado);
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

        return this.http.get(`${url}TipoPlantillaNotificacion`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}TipoPlantillaNotificacion/GetById/${id}`, {
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

    create(request: IPlantillaNotificacionRequest): Observable<any> {
        return this.http.post(`${url}TipoPlantillaNotificacion/Create`, request, {
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

    update(request: IPlantillaNotificacionRequest, id: string): Observable<any> {
        return this.http.put(`${url}TipoPlantillaNotificacion/Update?id=${id}`, request, {
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
        return this.http.patch(`${url}TipoPlantillaNotificacion/Inactivate/${id}`, null, {
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
        return this.http.patch(`${url}TipoPlantillaNotificacion/Reactivate/${id}`, null, {
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