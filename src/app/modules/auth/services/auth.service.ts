import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map, catchError, switchMap, filter, take } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { StorageService } from '../../auth/services/storage.service';
import { UsuarioService } from '../../protected/authentication/services/usuario.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private srvUsuario = inject(UsuarioService);

    constructor(
        private http: HttpClient,
        private storageService: StorageService
    ) { }

    private url: string = `${environment.api}`;

    getDataUsuario() {
        return this.http.get(`${this.url}Usuario/GetUserData`, {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                })
        }).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                if (response.respuesta === true) {
                    this.storageService.setUserData(response.data);
                    if (response.data.usuarioId !== null && response.data.usuarioId !== undefined && response.data.usuarioId !== "") {
                        this.srvUsuario.getById(response.data.usuarioId).subscribe({
                            next: (user: any) => {
                                if (user.respuesta === true && user.data !== null && user.data !== undefined) {
                                    this.storageService.setUserDetail(user.data);
                                }
                            },
                            error: (err) => console.error("Error al obtener detalles del usuario:", err)
                        });
                    }
                }
                return of(response);
            })
        );
    }

    login(usuario: string, contrasena: string) {
        const body = { email: usuario, contrasena };

        return this.http.post(`${this.url}Login`, body).pipe(
            tap((resp: any) => {
                if (resp.respuesta === true) {
                    const token = resp?.data;
                    if (token && typeof token === 'string') {
                        this.storageService.setToken(token);
                    } else {
                    }
                }
            }),
            switchMap(resp => {
                // Si la respuesta fue exitosa y hay token guardado, espera a que el token esté listo
                if (resp.respuesta === true) {
                    return this.storageService.token$.pipe(
                        filter(token => token !== null && !this.storageService.isTokenExpired(token)),
                        take(1),
                        map(() => resp) // continúa con la respuesta original
                    );
                } else {
                    // Si login falló, devuelve error
                    return of(resp);
                }
            }),
            catchError(err => of({ respuesta: false, mensaje: err.error?.mensaje || 'Error en login' }))
        );
    }

    ValidarToken(): Observable<boolean> {
        return this.http.get(`${this.url}Login/ValidarToken`, {
            headers: new HttpHeaders(
                {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                })
        }).pipe(
            map((resp: any) => {
                this.storageService.setToken(resp.data)
                return true;
            }),
            catchError(err => of(false))
        );
    }

    ObtenerCodigoRecuperacion(correo: string) {
        return this.http.get(`${this.url}Login/ObtenerCodigoDeRecuperacion?correo=${correo}`).pipe(catchError(err => of(err)));
    }

    ValidarCodigoRecuperacion(codigo: string, correo: string) {
        return this.http.get(`${this.url}Login/ValidarCodigo?codigo=${codigo}&correo=${correo}`).pipe(catchError(err => of(err)));
    }

    RecuperarContrasena(datos: any) {
        return this.http.post(`${this.url}Login/RecuperarContrasena`, datos).pipe(catchError(err => of(err)));
    }

    CambiarContrasena(puesto: any) {
        return this.http.post(`${this.url}Login/CambiarContrasena`, puesto, {
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