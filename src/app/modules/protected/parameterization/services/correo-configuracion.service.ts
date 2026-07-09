import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ICorreoConfiguracionRequest, ICorreoConfiguracionResponse } from '../interfaces/correo-configuracion.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})
export class CorreoConfiguracionService {
    constructor(
        private http: HttpClient
    ) { }

    private get headers(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Empresa': `${localStorage.getItem('empresa')}`
        });
    }

    getByEmpresaId(empresaId: string): Observable<ICorreoConfiguracionResponse> {
        return this.http.get<ICorreoConfiguracionResponse>(`${url}Configuracion/Correo/${empresaId}`, {
            headers: this.headers
        }).pipe(
            catchError((error: any) =>
                of({ respuesta: false, mensaje: 'Error al obtener la configuración', codigo: 500, data: null, meta: null } as ICorreoConfiguracionResponse)
            )
        );
    }

    create(request: ICorreoConfiguracionRequest): Observable<ICorreoConfiguracionResponse> {
        return this.http.post<ICorreoConfiguracionResponse>(`${url}Configuracion/Correo`, request, {
            headers: this.headers
        }).pipe(
            catchError((error: any) =>
                of({ respuesta: false, mensaje: 'Error al crear la configuración', codigo: 500, data: null, meta: null } as ICorreoConfiguracionResponse)
            )
        );
    }

    update(request: ICorreoConfiguracionRequest): Observable<ICorreoConfiguracionResponse> {
        return this.http.put<ICorreoConfiguracionResponse>(`${url}Configuracion/Correo`, request, {
            headers: this.headers
        }).pipe(
            catchError((error: any) =>
                of({ respuesta: false, mensaje: 'Error al actualizar la configuración', codigo: 500, data: null, meta: null } as ICorreoConfiguracionResponse)
            )
        );
    }
}
