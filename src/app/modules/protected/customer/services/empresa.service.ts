import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IEmpresaFilter } from '../../../protected/customer/interfaces/empresa.interface';

export interface TestConnectionDTO {
    CustomerId: string;
    ClientId: string;
    ClientSecretOrCertificate: string;
    IdpAuthenticationUrl: string;
}

export interface Tarea {
    id: string;
    tipoTareaId: string;
    fecha: string;
    pendiente: number;
    status: number;
    valorEnvio: string;
    valorRetorno: string;
    empresaClienteId: string;
}

export interface ApiResponse<T> {
    respuesta: boolean;
    mensaje: string;
    codigo: number;
    data: T;
}

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class EmpresaService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IEmpresaFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.RazonSocial !== null && filter.RazonSocial !== undefined && filter.RazonSocial !== "") {
            params = params.set('RazonSocial', filter.RazonSocial);
        }
        if (filter.RFC !== null && filter.RFC !== undefined && filter.RFC !== "") {
            params = params.set('RFC', filter.RFC);
        }
        if (filter.TelefonoEmpresa !== null && filter.TelefonoEmpresa !== undefined && filter.TelefonoEmpresa !== "") {
            params = params.set('TelefonoEmpresa', filter.TelefonoEmpresa);
        }
        if (filter.TelefonoMovil !== null && filter.TelefonoMovil !== undefined && filter.TelefonoMovil !== "") {
            params = params.set('TelefonoMovil', filter.TelefonoMovil);
        }
        if (filter.CorreoElectronico !== null && filter.CorreoElectronico !== undefined && filter.CorreoElectronico !== "") {
            params = params.set('CorreoElectronico', filter.CorreoElectronico);
        }
        if (filter.UsaCredencialesHID !== null && filter.UsaCredencialesHID !== undefined && filter.UsaCredencialesHID !== '') {
            params = params.set('UsaCredencialesHID', filter.UsaCredencialesHID);
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

        return this.http.get(`${url}EmpresaCliente`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}EmpresaCliente/${id}`, {
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

    /**
 * Crea una tarea para probar la conexión HID.
 * POST /api/EmpresaCliente/TestConnection
 */
    testConnection(data: TestConnectionDTO): Observable<ApiResponse<Tarea>> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Empresa': `${localStorage.getItem('empresa')}`
        });

        return this.http.post<ApiResponse<Tarea>>(`${url}EmpresaCliente/TestConnection`, data, { headers }).pipe(
            catchError((error) => {
                console.error('Error en TestConnection:', error);
                return of({ respuesta: false, mensaje: 'Error al iniciar prueba', codigo: 500, data: null as any });
            })
        );
    }

    /**
     * Retorna la URL del endpoint SSE para monitorear la tarea.
     * GET /api/EmpresaCliente/TaskUpdates?id=...
     */
    getTaskUpdatesUrl(taskId: string): string {
        return `${url}EmpresaCliente/TaskUpdates?id=${taskId}`;
    }

    create(data: { empresa: any; configuraciones: any[] }): Observable<ApiResponse<any>> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Empresa': `${localStorage.getItem('empresa')}`
        });

        return this.http.post<ApiResponse<any>>(`${url}EmpresaCliente`, data, { headers }).pipe(
            catchError((error) => {
                console.error('Error al guardar empresa:', error);
                return of({ respuesta: false, mensaje: 'Error al guardar', codigo: 500, data: null } as any);
            })
        );
    }

    inactivate(id: string, usuarioBajaId: string) {
        return this.http.patch(`${url}EmpresaCliente/Inactivate?id=${id}&usuarioBajaId=${usuarioBajaId}`, null, {
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
        return this.http.patch(`${url}EmpresaCliente/Reactivate?id=${id}&usuarioReactivadorId=${usuarioReactivadorId}`, null, {
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