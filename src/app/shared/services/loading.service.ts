import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private srvRouter = inject(Router);

    private _auto$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private _mode$: BehaviorSubject<'determinate' | 'indeterminate'> = new BehaviorSubject<'determinate' | 'indeterminate'>('indeterminate');
    private _progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private _show$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // Map dinámico para manejar múltiples peticiones activas
    private _urlMap: Map<string, boolean> = new Map<string, boolean>();

    private _excludedRoutes: string[] = [
        '/portal/agenda/visitante-listado'
    ];

    // URLs de API que no deben activar el spinner
    private _excludedApis: string[] = [
        `/EmpresaCliente/GetAllEmpresaCliente`,
        `/Colaborador/GetColaboradores`,
        `/Visitante/GetVisitantes`,
        `/Visitante/GetVisitanteSinFoto`,
        `/TipoVisitante/GetAllSinPaginacion`,
        `/TipoParam/GetConParams`,
        `/TipoVisitante/Get`,
        `/Cita/GetCitasByColaborador`,
        `/ConfiguracionGeneral/GetConfiguracionGeneral`,
        `/Visitante/GetVisitanteIdentificacion`,
        `/Param/GetAllParams`
    ];

    // Observables públicos
    show$: Observable<boolean> = this._show$.asObservable();
    progress$: Observable<number> = this._progress$.asObservable();
    mode$: Observable<'determinate' | 'indeterminate'> = this._mode$.asObservable();
    auto$: Observable<boolean> = this._auto$.asObservable();

    private isRouteExcluded(): boolean {
        const currentRoute = this.srvRouter.url;
        return this._excludedRoutes.some(route => currentRoute.includes(route));
    }

    private isApiExcluded(url: string): boolean {
        // Verifica si la URL coincide con alguno de los patrones excluidos
        return this._excludedApis.some(apiPattern => url.includes(apiPattern));
    }

    // -------------------- Mostrar el spinner --------------------
    show(url: string = 'default'): void {
        // Verifica si la ruta o la API están excluidas
        if (this.isRouteExcluded() || this.isApiExcluded(url)) {
            return;
        }

        // Registrar la URL/identificador en el map
        this._urlMap.set(url, true);

        // Solo cambiar el estado si no estaba activo
        if (!this._show$.getValue()) {
            this._show$.next(true);
        }
    }

    // -------------------- Ocultar el spinner --------------------
    hide(url: string = 'default'): void {
        if (this.isApiExcluded(url)) {
            return;
        }

        // Eliminar URL/identificador del map
        if (this._urlMap.has(url)) {
            this._urlMap.delete(url);
        }

        // Ocultar spinner solo si no quedan requests activas
        if (this._urlMap.size === 0) {
            // Pequeño delay para evitar parpadeo rápido
            setTimeout(() => {
                if (this._urlMap.size === 0) {
                    this._show$.next(false);
                }
            }, 50); // 50ms es suficiente, ajustable
        }
    }

    // -------------------- Progreso manual --------------------
    setProgress(value: number): void {
        if (value < 0 || value > 100) {
            console.error('Progress value must be between 0 and 100!');
            return;
        }
        this._progress$.next(value);
    }

    // -------------------- Modo --------------------
    setMode(mode: 'determinate' | 'indeterminate'): void {
        this._mode$.next(mode);
    }

    // -------------------- Auto mode --------------------
    setAutoMode(value: boolean): void {
        this._auto$.next(value);
    }
}