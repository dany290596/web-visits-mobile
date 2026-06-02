import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
    ConfiguracionDto,
    PatchConfiguracionResponse,
    EmailWalletConfig,
    CONFIG_IDS,
} from '../interfaces/email-wallet-config.interface';
import { ConfiguracionService } from '../../configuration/services/configuration.service';

// ─────────────────────────────────────────────────────────────────────────────
// EmailWalletConfigService
//
// Tiene DOS rutas internas controladas por environment.useDummyData:
//
//   true  → lee /assets/dummy-data/configuraciones.json
//            el PATCH simula un delay de 600ms y devuelve éxito
//
//   false → llama a /api/configuraciones con GET y PATCH reales
//
// Para migrar a APIs reales: environment.useDummyData = false. Ya.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GUIDs de los registros en [dbo].[Configuraciones]
 * Generados en el script PlantillaCorreoWallet_Insert.sql
 */
// ─────────────────────────────────────────────────────────────────────────────
// Tipo explícito para evitar referencias circulares
// ─────────────────────────────────────────────────────────────────────────────
type ConfigEntry = { id: string; nombre: string };
type ConfigKey = keyof EmailWalletConfig;

const CONFIGS: Record<ConfigKey, ConfigEntry> = {
    asunto: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000001', nombre: 'Asunto del correo' },
    nombreRemitente: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000002', nombre: 'Nombre del remitente (Wallet)' },
    emailRemitente: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000003', nombre: 'Email del remitente (Wallet)' },
    telefonoContacto: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000004', nombre: 'Teléfono de contacto (Wallet)' },
    emailContacto: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000005', nombre: 'Email de contacto (Wallet)' },
    direccion: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000006', nombre: 'Dirección (Wallet)' },
    tituloPaso1: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000007', nombre: 'Título Paso 1 (Wallet)' },
    textoPaso1: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000008', nombre: 'Texto Paso 1 (Wallet)' },
    tituloPaso2: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000009', nombre: 'Título Paso 2 (Wallet)' },
    textoPaso2: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000010', nombre: 'Texto Paso 2 (Wallet)' },
    tituloPaso3: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000011', nombre: 'Título Paso 3 (Wallet)' },
    textoPaso3: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000012', nombre: 'Texto Paso 3 (Wallet)' },
    nombreEmpresa: { id: 'a1f3c2d4-1a2b-4e5f-9c3d-100000000013', nombre: 'Nombre de la empresa (Wallet)' },
};

@Injectable({ providedIn: 'root' })
export class EmailWalletConfigService {
    private readonly srvConfig = inject(ConfiguracionService);

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/configuraciones`;
    private readonly dummyUrl = `${environment.dummyDataUrl}/configuraciones.json`;

    // ── Lectura de configuración ───────────────────────────────────────────────
    // getConfig(): Observable<EmailWalletConfig> {
    //     if (environment.useDummyData) {
    //         return this.http
    //             .get<ConfiguracionDto[]>(this.dummyUrl)
    //             .pipe(map(lista => this.mapDtoToConfig(lista)));
    //     }

    //     // API real: GET /api/configuraciones?ids=id1,id2,...
    //     const ids = Object.values(CONFIG_IDS).join(',');
    //     return this.http
    //         .get<ConfiguracionDto[]>(`${this.apiUrl}?ids=${ids}`)
    //         .pipe(map(lista => this.mapDtoToConfig(lista)));
    // }

    getConfig(): Observable<EmailWalletConfig> {
        return forkJoin({
            asunto: this.srvConfig.getById(CONFIGS.asunto.id),
            nombreRemitente: this.srvConfig.getById(CONFIGS.nombreRemitente.id),
            emailRemitente: this.srvConfig.getById(CONFIGS.emailRemitente.id),
            telefonoContacto: this.srvConfig.getById(CONFIGS.telefonoContacto.id),
            emailContacto: this.srvConfig.getById(CONFIGS.emailContacto.id),
            direccion: this.srvConfig.getById(CONFIGS.direccion.id),
            tituloPaso1: this.srvConfig.getById(CONFIGS.tituloPaso1.id),
            textoPaso1: this.srvConfig.getById(CONFIGS.textoPaso1.id),
            tituloPaso2: this.srvConfig.getById(CONFIGS.tituloPaso2.id),
            textoPaso2: this.srvConfig.getById(CONFIGS.textoPaso2.id),
            tituloPaso3: this.srvConfig.getById(CONFIGS.tituloPaso3.id),
            textoPaso3: this.srvConfig.getById(CONFIGS.textoPaso3.id),
            nombreEmpresa: this.srvConfig.getById(CONFIGS.nombreEmpresa.id),
        }).pipe(
            map(responses => ({
                asunto: responses.asunto?.data?.valor1 ?? '',
                nombreRemitente: responses.nombreRemitente?.data?.valor1 ?? '',
                emailRemitente: responses.emailRemitente?.data?.valor1 ?? '',
                telefonoContacto: responses.telefonoContacto?.data?.valor1 ?? '',
                emailContacto: responses.emailContacto?.data?.valor1 ?? '',
                direccion: responses.direccion?.data?.valor1 ?? '',
                tituloPaso1: responses.tituloPaso1?.data?.valor1 ?? '',
                textoPaso1: responses.textoPaso1?.data?.valor1 ?? '',
                tituloPaso2: responses.tituloPaso2?.data?.valor1 ?? '',
                textoPaso2: responses.textoPaso2?.data?.valor1 ?? '',
                tituloPaso3: responses.tituloPaso3?.data?.valor1 ?? '',
                textoPaso3: responses.textoPaso3?.data?.valor1 ?? '',
                nombreEmpresa: responses.nombreEmpresa?.data?.valor1 ?? '',
            } satisfies EmailWalletConfig)
            ));
    }

    // ── Guardar configuración ─────────────────────────────────────────────────
    // saveConfig(config: EmailWalletConfig): Observable<PatchConfiguracionResponse[]> {
    //     if (environment.useDummyData) {
    //         return this.http
    //             .get<PatchConfiguracionResponse>(`${environment.dummyDataUrl}/patch-configuracion-response.json`)
    //             .pipe(
    //                 delay(600),   // simula latencia de red
    //                 map(res => Array(12).fill(res))  // 12 campos = 12 PATCHes simulados
    //             );
    //     }

    //     // API real: un PATCH por cada campo de configuración
    //     const requests: Observable<PatchConfiguracionResponse>[] = [
    //         this.patch(CONFIG_IDS.ASUNTO, { valor1: config.asunto }),
    //         this.patch(CONFIG_IDS.REMITENTE, { valor1: config.nombreRemitente, valor2: config.emailRemitente }),
    //         this.patch(CONFIG_IDS.TELEFONO_CONTACTO, { valor1: config.telefonoContacto }),
    //         this.patch(CONFIG_IDS.EMAIL_CONTACTO, { valor1: config.emailContacto }),
    //         this.patch(CONFIG_IDS.DIRECCION, { valor1: config.direccion }),
    //         this.patch(CONFIG_IDS.PASO1_TITULO, { valor1: config.tituloPaso1 }),
    //         this.patch(CONFIG_IDS.PASO1_TEXTO, { valor1: config.textoPaso1 }),
    //         this.patch(CONFIG_IDS.PASO2_TITULO, { valor1: config.tituloPaso2 }),
    //         this.patch(CONFIG_IDS.PASO2_TEXTO, { valor1: config.textoPaso2 }),
    //         this.patch(CONFIG_IDS.PASO3_TITULO, { valor1: config.tituloPaso3 }),
    //         this.patch(CONFIG_IDS.PASO3_TEXTO, { valor1: config.textoPaso3 }),
    //         this.patch(CONFIG_IDS.EMPRESA_NOMBRE, { valor1: config.nombreEmpresa }),
    //     ];
    //     return forkJoin(requests);
    // }

    saveConfig(config: EmailWalletConfig, userId: string): Observable<boolean[]> {
        return forkJoin([
            this.srvConfig.update(CONFIGS.asunto.id, this._buildPayload('asunto', config.asunto, userId)),
            this.srvConfig.update(CONFIGS.nombreRemitente.id, this._buildPayload('nombreRemitente', config.nombreRemitente, userId)),
            this.srvConfig.update(CONFIGS.emailRemitente.id, this._buildPayload('emailRemitente', config.emailRemitente, userId)),
            this.srvConfig.update(CONFIGS.telefonoContacto.id, this._buildPayload('telefonoContacto', config.telefonoContacto, userId)),
            this.srvConfig.update(CONFIGS.emailContacto.id, this._buildPayload('emailContacto', config.emailContacto, userId)),
            this.srvConfig.update(CONFIGS.direccion.id, this._buildPayload('direccion', config.direccion, userId)),
            this.srvConfig.update(CONFIGS.tituloPaso1.id, this._buildPayload('tituloPaso1', config.tituloPaso1, userId)),
            this.srvConfig.update(CONFIGS.textoPaso1.id, this._buildPayload('textoPaso1', config.textoPaso1, userId)),
            this.srvConfig.update(CONFIGS.tituloPaso2.id, this._buildPayload('tituloPaso2', config.tituloPaso2, userId)),
            this.srvConfig.update(CONFIGS.textoPaso2.id, this._buildPayload('textoPaso2', config.textoPaso2, userId)),
            this.srvConfig.update(CONFIGS.tituloPaso3.id, this._buildPayload('tituloPaso3', config.tituloPaso3, userId)),
            this.srvConfig.update(CONFIGS.textoPaso3.id, this._buildPayload('textoPaso3', config.textoPaso3, userId)),
            this.srvConfig.update(CONFIGS.nombreEmpresa.id, this._buildPayload('nombreEmpresa', config.nombreEmpresa, userId)),
        ]).pipe(
            map(results => results.map((r: any) => r?.respuesta === true))
        );
    }

    // ── Payload completo según esquema PUT /api/Configuracion ─────────────────
    private _buildPayload(key: ConfigKey, valor1: string, userId: string): object {
        const cfg = CONFIGS[key];
        return {
            nombreParametro: cfg.nombre,
            valorGuid: null,
            valor1,
            valor2: null,
            valor3: null,
            editable: 1,
            lectura: 0,
            empresaClienteId: localStorage.getItem('empresa') ?? '',
            tipoConfiguracion: cfg.id,
            usuarioCreadorId: userId,
        };
    }

    // ── Helpers privados ──────────────────────────────────────────────────────
    private patch(
        id: string,
        valores: { valor1?: string | null; valor2?: string | null; valor3?: string | null }
    ): Observable<PatchConfiguracionResponse> {
        return this.http.patch<PatchConfiguracionResponse>(`${this.apiUrl}/${id}`, valores);
    }

    private mapDtoToConfig(lista: ConfiguracionDto[]): EmailWalletConfig {
        const v = (id: string) => lista.find(c => c.id === id)?.valor1 ?? '';
        const remitente = lista.find(c => c.id === CONFIG_IDS.REMITENTE);

        return {
            asunto: v(CONFIG_IDS.ASUNTO) || 'Código de Acceso - Plataforma HID',
            nombreRemitente: remitente?.valor1 ?? 'CRC de México',
            emailRemitente: remitente?.valor2 ?? 'cloud@crcdemexico.com.mx',
            telefonoContacto: v(CONFIG_IDS.TELEFONO_CONTACTO) || '+52 (443) 340 0992',
            emailContacto: v(CONFIG_IDS.EMAIL_CONTACTO) || 'omorales@crcdemexico.com.mx',
            direccion: v(CONFIG_IDS.DIRECCION) || 'Lic. Antonio del Moral 45, Nueva Chapultepec, 58280 Morelia, Mich.',
            tituloPaso1: v(CONFIG_IDS.PASO1_TITULO) || 'Descarga nuestra App',
            textoPaso1: v(CONFIG_IDS.PASO1_TEXTO) || 'Accede fácilmente desde tu dispositivo móvil.',
            tituloPaso2: v(CONFIG_IDS.PASO2_TITULO) || 'Para acceder',
            textoPaso2: v(CONFIG_IDS.PASO2_TEXTO) || 'Abre la app y escanea el QR.',
            tituloPaso3: v(CONFIG_IDS.PASO3_TITULO) || 'Alternativa - Código manual',
            textoPaso3: v(CONFIG_IDS.PASO3_TEXTO) || 'Copia el código y canjéalo en la app.',
            nombreEmpresa: v(CONFIG_IDS.EMPRESA_NOMBRE) || 'CRC de México®, S.A. de C.V.',
        };
    }
}