import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUsuarioAutenticado, IUsuarioResponse } from '../../protected/authentication/interfaces/usuario.interface';
import { IEncriptacionResponse } from '../../../shared/interfaces/encriptacion.interface';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private srvRouter = inject(Router);

    private readonly TOKEN_KEY = 'user_token';
    private readonly USER_DATA_KEY = 'user_data';
    private readonly USER_DETAIL_KEY = 'user_detail';
    private readonly LICENSE_DETAIL_KEY = 'codigoDeAccesibilidad';

    private tokenSubject = new BehaviorSubject<string | null>(null);
    public readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

    private userDataSubject = new BehaviorSubject<IUsuarioAutenticado | null>(null);
    public readonly userData$: Observable<IUsuarioAutenticado | null> = this.userDataSubject.asObservable();

    private userDetailSubject = new BehaviorSubject<IUsuarioResponse | null>(null);
    public readonly userDetail$: Observable<IUsuarioResponse | null> = this.userDetailSubject.asObservable();

    private licenseSubject = new BehaviorSubject<IEncriptacionResponse | null>(null);
    public readonly license$: Observable<IEncriptacionResponse | null> = this.licenseSubject.asObservable();

    constructor(
        private ngZone: NgZone
    ) {
        this.loadTokenFromStorage();
        this.loadUserDataFromStorage();
        this.loadUserDetailFromStorage();
        this.loadLicenseFromStorage();

        // Escuchar cambios en otras pestañas
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', this.syncStorageAcrossTabs.bind(this));
        }
    }

    private loadTokenFromStorage() {
        if (this.isLocalStorageAvailable()) {
            const token = localStorage.getItem(this.TOKEN_KEY);

            if (token && !this.isTokenExpired(token)) {
                this.tokenSubject.next(token);
            } else {
                this.clearUserToken();
            }
        }
    }

    private loadUserDataFromStorage() {
        if (this.isLocalStorageAvailable()) {
            const userDataStr = localStorage.getItem(this.USER_DATA_KEY);
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    this.userDataSubject.next(userData);
                } catch {
                    this.clearUserData();
                }
            } else {
                this.userDataSubject.next(null);
            }
        }
    }

    private loadUserDetailFromStorage() {
        if (this.isLocalStorageAvailable()) {
            const userDetailStr = localStorage.getItem(this.USER_DETAIL_KEY);
            if (userDetailStr) {
                try {
                    const userDetail = JSON.parse(userDetailStr);
                    this.userDetailSubject.next(userDetail);
                } catch {
                    this.clearUserDetail();
                }
            } else {
                this.userDetailSubject.next(null);
            }
        }
    }

    private loadLicenseFromStorage() {
        if (this.isLocalStorageAvailable()) {
            const licenseStr = localStorage.getItem(this.LICENSE_DETAIL_KEY);
            if (licenseStr) {
                try {
                    const license = JSON.parse(licenseStr);
                    this.licenseSubject.next(license);
                } catch {
                    this.clearUserDetail();
                }
            } else {
                this.licenseSubject.next(null);
            }
        }
    }

    private isLocalStorageAvailable(): boolean {
        try {
            return typeof localStorage !== 'undefined' && localStorage !== null;
        } catch {
            return false;
        }
    }

    private syncStorageAcrossTabs(event: StorageEvent) {
        this.ngZone.run(() => {
            if (event.key === this.TOKEN_KEY) {
                const newToken = event.newValue;
                if (newToken && !this.isTokenExpired(newToken)) {
                    this.tokenSubject.next(newToken);
                } else {
                    this.tokenSubject.next(null);
                }
            } else if (event.key === this.USER_DATA_KEY) {
                if (event.newValue) {
                    try {
                        const newUserData = JSON.parse(event.newValue);
                        this.userDataSubject.next(newUserData);
                    } catch {
                        this.userDataSubject.next(null);
                    }
                } else {
                    this.userDataSubject.next(null);
                }
            }
        });
    }

    getUserToken(): string | null {
        const token = localStorage.getItem(this.TOKEN_KEY);
        return token && !this.isTokenExpired(token) ? token : null;
    }

    getUserData(): IUsuarioAutenticado | null {
        return this.userDataSubject.value;
    }

    getUserDetailData(): IUsuarioResponse | null {
        return this.userDetailSubject.value;
    }

    getLicenseData(): IEncriptacionResponse | null {
        return this.licenseSubject.value;
    }

    setToken(token: string): void {
        if (!this.isLocalStorageAvailable()) return;

        if (this.isTokenExpired(token)) {
            console.warn('Intentando establecer token expirado');
            this.clearUserToken();
            return;
        }

        localStorage.setItem(this.TOKEN_KEY, token);
        this.tokenSubject.next(token);
    }

    setUserData(data: any): void {
        if (!this.isLocalStorageAvailable()) return;

        try {
            const dataStr = JSON.stringify(data);
            localStorage.setItem(this.USER_DATA_KEY, dataStr);
            this.userDataSubject.next(data);
        } catch {
            console.warn('⚠️ Error al guardar datos de usuario');
        }
    }

    setUserDetail(detail: any): void {
        if (!this.isLocalStorageAvailable()) return;

        try {
            const detailStr = JSON.stringify(detail);
            localStorage.setItem(this.USER_DETAIL_KEY, detailStr);
            this.userDetailSubject.next(detail);
        } catch (error) {
            console.warn('⚠️ Error al guardar detalles de usuario', error);
        }
    }

    setLicense(data: IEncriptacionResponse): void {
        if (!this.isLocalStorageAvailable()) return;

        try {
            const dataStr = JSON.stringify(data);
            localStorage.setItem(this.LICENSE_DETAIL_KEY, dataStr);
            this.licenseSubject.next(data);
        } catch {
            console.warn('⚠️ Error al guardar licencia');
        }
    }

    clearUserToken(): void {
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.TOKEN_KEY);
        }
        this.tokenSubject.next(null);
    }

    clearUserData(): void {
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.USER_DATA_KEY);
        }
        this.userDataSubject.next(null);
    }

    clearUserDetail(): void {
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.USER_DETAIL_KEY);
        }
        this.userDetailSubject.next(null);
    }

    clearLicense(): void {
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.LICENSE_DETAIL_KEY);
        }
        this.licenseSubject.next(null);
    }

    closeSession(): void {
        this.clearUserToken();
        this.clearUserData();
        this.clearUserDetail();
        this.srvRouter.navigateByUrl('/sign-in');
    }

    public isTokenExpired(token: string): boolean {
        try {
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) return true;

            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            if (!payload.exp) return true;

            const now = Math.floor(Date.now() / 1000);
            return payload.exp < now;
        } catch {
            return true;
        }
    }
}