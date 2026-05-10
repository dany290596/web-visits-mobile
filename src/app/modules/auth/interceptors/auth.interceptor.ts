import { environment } from '../../../../environments/environment';
import { inject } from '@angular/core';
import {
    HttpInterceptorFn,
    HttpRequest,
    HttpEvent,
    HttpErrorResponse,
    HttpHandlerFn,
    HttpClient,
} from '@angular/common/http';
import { Observable, EMPTY, from, throwError } from 'rxjs';
import { switchMap, catchError, finalize, take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { StorageService } from '../services/storage.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { Router } from '@angular/router';

const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/Login',
    '/RecuperarContrasena',
    'Licencia/ExisteLicenciaActiva',
    'Licencia/ObtenerCodigoYSerial',
    'Licencia/ValidarLicenciaActivaPorCodigoYSerial',
    'Licencia/BuscarLicenciaIdPorCodigoYSerial',
    'LicenciaHardware/ObtenerLicenciaHardwareEquipo',
    'LicenciaHardware/BuscarLicenciaHardwarePorFiltros',
    'Empresa/GetEmpresasDisponibles',
    'Licencia/ColaboradoresDisponibles',
    'Encriptacion/Encriptar',
    'Encriptacion/Desencriptar',
    'Licencia/BuscarL1YL2YCadPorLicenciaId?id=',
    'Licencia/Crear',
    'Licencia/ActualizarPorL1YL2YCad',
    'LicenciaHardware/ActivateLicense'
];

const isPublicUrl = (url: string): boolean =>
    PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));

const isTokenValid = (token: unknown): token is string =>
    typeof token === 'string' &&
    token.trim() !== '' &&
    token.trim().toLowerCase() !== 'null' &&
    token.trim().toLowerCase() !== 'undefined';

export const AuthInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const urlBase: string = `${environment.api}`;
    const storageService = inject(StorageService);
    const loadingService = inject(LoadingService);
    const router = inject(Router);
    const http = inject(HttpClient);

    loadingService.show(req.url);

    if (isPublicUrl(req.url)) {
        return next(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (
                    error.status === 404 &&
                    error.error == null &&
                    error.statusText === 'OK' &&
                    error.ok === false &&
                    error.type === undefined
                ) {
                    Swal.fire({
                        icon: 'warning',
                        title: '¡Advertencia!',
                        text: 'El servicio solicitado no está disponible o la URL es incorrecta.',
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        customClass: { popup: 'swal-theme' }
                    });
                    return EMPTY;
                }

                if (
                    error.status === 403 &&
                    error.error !== null &&
                    error.statusText === 'OK' &&
                    error.ok === false &&
                    error.type === undefined
                ) {
                    if (error.error.codigo === 407 && error.error.respuesta === false) {
                        Swal.fire({
                            icon: 'warning',
                            title: '¡Advertencia!',
                            text: error.error.mensaje,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: { popup: 'swal-theme' }
                        });
                        return EMPTY;
                    }

                    if (error.error.codigo === 408 && error.error.respuesta === false) {

                        Swal.fire({
                            icon: 'warning',
                            title: '¡Advertencia!',
                            text: error.error.mensaje,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: { popup: 'swal-theme' }
                        });
                        return EMPTY;
                    }
                }

                if (
                    error.status === 403 &&
                    error.error !== null &&
                    error.statusText === 'Forbidden' &&
                    error.ok === false &&
                    error.type === undefined
                ) {
                    if (error.error.codigo === 407 && error.error.respuesta === false) {
                        Swal.fire({
                            icon: 'warning',
                            title: '¡Advertencia!',
                            text: error.error.mensaje,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: { popup: 'swal-theme' }
                        });
                        return EMPTY;
                    }

                    if (error.error.codigo === 408 && error.error.respuesta === false) {

                        Swal.fire({
                            icon: 'warning',
                            title: '¡Advertencia!',
                            text: error.error.mensaje,
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            customClass: { popup: 'swal-theme' }
                        });
                        return EMPTY;
                    }
                }

                if (error.status === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: '¡Advertencia de conexión!',
                        text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión o intenta más tarde.',
                        confirmButtonText: 'Aceptar',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: true,
                        customClass: { popup: 'swal-theme' }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            console.log("sdcdscds");
                            router.navigate(['/sign-in']);
                        }
                    });
                    return EMPTY;
                }

                return throwError(() => error);
            }),
            finalize(() => loadingService.hide(req.url))
        );
    }

    return storageService.token$.pipe(
        take(1),
        switchMap((token) => {
            if (!isTokenValid(token) || storageService.isTokenExpired(token)) {
                loadingService.hide(req.url);
                // storageService.closeSession();

                if (!router.url.includes('/sign-in')) {
                    return from(
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sesión caducada',
                            text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: true,
                            customClass: { popup: 'swal-theme' }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                router.navigate(['/sign-in']);
                            }
                        })
                    ).pipe(
                        switchMap(() => {
                            router.navigate(['/sign-in']);
                            return EMPTY;
                        })
                    );
                }
                return EMPTY;
            }

            // Solo clona la petición con el token, no se valida
            const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });

            return next(authReq).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 0) {
                        Swal.fire({
                            icon: 'warning',
                            title: '¡Advertencia!',
                            text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión o intenta más tarde.',
                            confirmButtonText: 'Aceptar',
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            allowEnterKey: true,
                            customClass: { popup: 'swal-theme' }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                console.log("sdcdscds");
                                router.navigate(['/sign-in']);
                            }
                        });
                        return EMPTY;
                    }

                    if (error.status === 401) {
                        // console.log("ERROR 2 : ", error);
                        // storageService.closeSession();
                        // if (!router.url.includes('/auth/login')) {
                        //     return from(
                        //         Swal.fire({
                        //             icon: 'warning',
                        //             title: 'Sesión caducada',
                        //             text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                        //             confirmButtonText: 'Aceptar',
                        //             allowOutsideClick: false,
                        //             allowEscapeKey: false,
                        //             allowEnterKey: true,
                        //             customClass: { popup: 'swal-theme' }
                        //         })
                        //     ).pipe(
                        //         switchMap(() => {
                        //             router.navigate(['/auth/login']);
                        //             return EMPTY;
                        //         })
                        //     );
                        // }
                        // return EMPTY;
                    }

                    if (error.status === 403) {
                        if (error.error.code === 1996) {
                            Swal.fire({
                                title: '¡Advertencia!',
                                text: error.error.msg || 'No tiene permisos para realizar esta acción.',
                                icon: 'warning',
                                confirmButtonText: 'Aceptar',
                                customClass: {
                                    popup: 'swal-theme',
                                }
                            });
                        }
                    }

                    if (
                        error.status === 409 &&
                        error.error !== null &&
                        error.statusText === 'OK' &&
                        error.ok === false &&
                        error.type === undefined
                    ) {
                        if (error.error.codigo === 409 && error.error.respuesta === false) {
                            Swal.fire({
                                icon: 'warning',
                                title: '¡Advertencia!',
                                text: error.error.mensaje,
                                confirmButtonText: 'Aceptar',
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                                customClass: { popup: 'swal-theme' }
                            });
                        }
                    }

                    return throwError(() => error);
                }),
                finalize(() => loadingService.hide(req.url))
            );
        })
    );
};