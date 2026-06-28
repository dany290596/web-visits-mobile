import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ITipoUsuarioFilter } from '../interfaces/tipo-usuario.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class SesionService {
    constructor(
        private http: HttpClient
    ) { }

    getVerifyFirstConnection(id: string) {
        return this.http.get(`${url}Sesion/${id}`, {
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