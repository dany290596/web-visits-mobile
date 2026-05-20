import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IPlantillaCredencialFilter, IPlantillaCredencialRequest } from '../../../protected/hid/interfaces/plantilla-credencial.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class PlantillaCredencialService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IPlantillaCredencialFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.ImagenFondo !== null && filter.ImagenFondo !== undefined && filter.ImagenFondo !== "") {
            params = params.set('ImagenFondo', filter.ImagenFondo);
        }
        if (filter.ExtensionImagenFondo !== null && filter.ExtensionImagenFondo !== undefined && filter.ExtensionImagenFondo !== "") {
            params = params.set('ExtensionImagenFondo', filter.ExtensionImagenFondo);
        }
        if (filter.ImagenLogo !== null && filter.ImagenLogo !== undefined && filter.ImagenLogo !== "") {
            params = params.set('ImagenLogo', filter.ImagenLogo);
        }
        if (filter.ExtensionImagenLogo !== null && filter.ExtensionImagenLogo !== undefined && filter.ExtensionImagenLogo !== "") {
            params = params.set('ExtensionImagenLogo', filter.ExtensionImagenLogo);
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

        return this.http.get(`${url}PlantillaCredencial`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}PlantillaCredencial/${id}`, {
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

    create(request: IPlantillaCredencialRequest): Observable<any> {
        return this.http.post(`${url}PlantillaCredencial`, request, {
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

    update(request: IPlantillaCredencialRequest, id: string): Observable<any> {
        return this.http.put(`${url}PlantillaCredencial?id=${id}`, request, {
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

    inactivate(id: string, usuarioBajaId: string) {
        console.log("0000");
        return this.http.patch(`${url}PlantillaCredencial/Inactivate?id=${id}&usuarioBajaId=${usuarioBajaId}`, null, {
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

    reactivate(id: string, usuarioReactivadorId: string) {
        return this.http.patch(`${url}PlantillaCredencial/Reactivate?id=${id}&usuarioReactivadorId=${usuarioReactivadorId}`, null, {
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