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
type ConfigEntry = { tipoConfiguracion: string; nombre: string };
type ConfigKey = keyof EmailWalletConfig;

const CONFIGS: Record<ConfigKey, ConfigEntry> = {
    asunto: { tipoConfiguracion: '6f8b2c91-3d4a-4f72-a9d1-7b3c8e1f5a21', nombre: 'Asunto del correo' },
    nombreRemitente: { tipoConfiguracion: 'c1e74d59-9b28-4a8d-8c63-2d9f7a4e6b10', nombre: 'Nombre del remitente (Wallet)' },
    emailRemitente: { tipoConfiguracion: '94f3a6d8-71b2-45b4-9e17-f8c2d6a9134e', nombre: 'Email del remitente (Wallet)' },
    telefonoContacto: { tipoConfiguracion: '2ab97c5e-84d1-4cb6-b3f9-51d8e7a2c640', nombre: 'Teléfono de contacto (Wallet)' },
    emailContacto: { tipoConfiguracion: 'd6c4b1f9-2a83-46ed-a8f4-9b7c5d1e3042', nombre: 'Email de contacto (Wallet)' },
    direccion: { tipoConfiguracion: '8e15f2a7-6b39-49c8-bd42-3f7e91c5a684', nombre: 'Dirección (Wallet)' },
    tituloPaso1: { tipoConfiguracion: 'b34e7d12-fc59-4a86-90d3-6a2b8f4c9175', nombre: 'Título Paso 1 (Wallet)' },
    textoPaso1: { tipoConfiguracion: 'f7c2d914-8b63-40a5-9d71-2e6a4c8f135b', nombre: 'Texto Paso 1 (Wallet)' },
    tituloPaso2: { tipoConfiguracion: '1d8e5b73-42cf-4f91-b6a8-7c3d9e2f5041', nombre: 'Título Paso 2 (Wallet)' },
    textoPaso2: { tipoConfiguracion: '73a1f6c8-95d4-4b2f-8e37-1c9a5d6b248f', nombre: 'Texto Paso 2 (Wallet)' },
    tituloPaso3: { tipoConfiguracion: '4c9b1d7f-e263-41a8-93f5-8d2e7b6c1509', nombre: 'Título Paso 3 (Wallet)' },
    textoPaso3: { tipoConfiguracion: 'e5a8c2d1-7f94-4b36-a1d9-5c7e2f8b4306', nombre: 'Texto Paso 3 (Wallet)' },
    nombreEmpresa: { tipoConfiguracion: '9f2d6b18-c743-44ae-b8d1-3e7c5a9f6240', nombre: 'Nombre de la empresa (Wallet)' },
};

@Injectable({ providedIn: 'root' })
export class EmailWalletConfigService {
    private readonly srvConfig = inject(ConfiguracionService);

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/configuraciones`;

    // ── Lectura de configuración ───────────────────────────────────────────────
    getConfig(empresaId: string): Observable<EmailWalletConfig> {
        return forkJoin({
            asunto: this.srvConfig.GetByTypeSetting(CONFIGS.asunto.tipoConfiguracion, empresaId),
            nombreRemitente: this.srvConfig.GetByTypeSetting(CONFIGS.nombreRemitente.tipoConfiguracion, empresaId),
            emailRemitente: this.srvConfig.GetByTypeSetting(CONFIGS.emailRemitente.tipoConfiguracion, empresaId),
            telefonoContacto: this.srvConfig.GetByTypeSetting(CONFIGS.telefonoContacto.tipoConfiguracion, empresaId),
            emailContacto: this.srvConfig.GetByTypeSetting(CONFIGS.emailContacto.tipoConfiguracion, empresaId),
            direccion: this.srvConfig.GetByTypeSetting(CONFIGS.direccion.tipoConfiguracion, empresaId),
            tituloPaso1: this.srvConfig.GetByTypeSetting(CONFIGS.tituloPaso1.tipoConfiguracion, empresaId),
            textoPaso1: this.srvConfig.GetByTypeSetting(CONFIGS.textoPaso1.tipoConfiguracion, empresaId),
            tituloPaso2: this.srvConfig.GetByTypeSetting(CONFIGS.tituloPaso2.tipoConfiguracion, empresaId),
            textoPaso2: this.srvConfig.GetByTypeSetting(CONFIGS.textoPaso2.tipoConfiguracion, empresaId),
            tituloPaso3: this.srvConfig.GetByTypeSetting(CONFIGS.tituloPaso3.tipoConfiguracion, empresaId),
            textoPaso3: this.srvConfig.GetByTypeSetting(CONFIGS.textoPaso3.tipoConfiguracion, empresaId),
            nombreEmpresa: this.srvConfig.GetByTypeSetting(CONFIGS.nombreEmpresa.tipoConfiguracion, empresaId),
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
    saveConfig(config: EmailWalletConfig, empresaId: string, userId: string): Observable<boolean[]> {
        return forkJoin([
            this.srvConfig.updateTypeSetting(this._buildPayload('asunto', config.asunto, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('nombreRemitente', config.nombreRemitente, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('emailRemitente', config.emailRemitente, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('telefonoContacto', config.telefonoContacto, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('emailContacto', config.emailContacto, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('direccion', config.direccion, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('tituloPaso1', config.tituloPaso1, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('textoPaso1', config.textoPaso1, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('tituloPaso2', config.tituloPaso2, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('textoPaso2', config.textoPaso2, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('tituloPaso3', config.tituloPaso3, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('textoPaso3', config.textoPaso3, empresaId, userId)),
            this.srvConfig.updateTypeSetting(this._buildPayload('nombreEmpresa', config.nombreEmpresa, empresaId, userId)),
        ]).pipe(
            map(results => results.map((r: any) => r?.respuesta === true))
        );
    }

    // ── Payload completo según esquema PUT /api/Configuracion ─────────────────
    private _buildPayload(key: ConfigKey, valor1: string, empresaId: string, userId: string): object {
        const cfg = CONFIGS[key];
        return {
            nombreParametro: cfg.nombre,
            valorGuid: null,
            valor1,
            valor2: null,
            valor3: null,
            editable: 1,
            lectura: 1,
            empresaClienteId: empresaId ?? '',
            tipoConfiguracion: cfg.tipoConfiguracion,
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