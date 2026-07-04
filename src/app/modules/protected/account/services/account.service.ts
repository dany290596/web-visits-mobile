import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class AccountService {
    constructor(
        private http: HttpClient
    ) { }

    getAccountInfo(): Observable<any> {
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            })
        };

        return this.http.get(`${url}Account`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }
}