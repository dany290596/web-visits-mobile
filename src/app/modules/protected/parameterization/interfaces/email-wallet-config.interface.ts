// ─────────────────────────────────────────────────────────────────────────────
// email-wallet-config.model.ts
// ─────────────────────────────────────────────────────────────────────────────

// ── DTO que devuelve el API (o el JSON dummy) ──────────────────────────────
export interface ConfiguracionDto {
    id: string;
    nombreParametro: string;
    valor1: string | null;
    valor2: string | null;
    valor3: string | null;
    editable: number;
    estado: number;
}

// ── Respuesta del PATCH ────────────────────────────────────────────────────
export interface PatchConfiguracionResponse {
    success: boolean;
    message: string;
    updatedAt: string;
}

// ── Modelo interno del formulario Angular ──────────────────────────────────
export interface EmailWalletConfig {
    // Datos del correo
    asunto: string;
    nombreRemitente: string;
    emailRemitente: string;

    // Contacto
    telefonoContacto: string;
    emailContacto: string;
    direccion: string;

    // Pasos editables
    tituloPaso1: string;
    textoPaso1: string;
    tituloPaso2: string;
    textoPaso2: string;
    tituloPaso3: string;
    textoPaso3: string;

    // Pie de página
    nombreEmpresa: string;
}

// ── Datos dinámicos — solo para el preview de muestra ─────────────────────
// El Servicio Windows los inyecta en runtime; Angular solo los muestra como ejemplo
export interface EmailWalletPreviewData {
    destinatario: string;
    codigoInvitacion: string;
    qrBase64: string;
    fechaExpiracion: Date;
}

export const PREVIEW_DATA_DEFAULT: EmailWalletPreviewData = {
    destinatario: 'usuario@ejemplo.com',
    codigoInvitacion: 'HID-2025-XK9T',
    qrBase64: '',
    fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

// ── IDs de configuración en BD ─────────────────────────────────────────────
// Coinciden 1:1 con los GUIDs del script SQL
export const CONFIG_IDS = {
    ASUNTO: '78b7dd37-d5f0-4c85-a38f-0babfe604c30',
    REMITENTE: 'f2cbe367-793c-497c-9110-5e2fb6c75889',
    TELEFONO_CONTACTO: 'dc227a7d-e48d-47ab-a401-7dac136f6c27',
    EMAIL_CONTACTO: 'b42608e0-216b-42c0-8edf-9355009ac0f9',
    DIRECCION: 'dir-001',
    PASO1_TITULO: 'paso1-titulo',
    PASO1_TEXTO: 'paso1-texto',
    PASO2_TITULO: 'paso2-titulo',
    PASO2_TEXTO: 'paso2-texto',
    PASO3_TITULO: 'paso3-titulo',
    PASO3_TEXTO: 'paso3-texto',
    EMPRESA_NOMBRE: 'empresa-nombre',
} as const;


// ============================================================
// email-wallet-config.interface.ts
// ============================================================

/** Campos editables de la plantilla de correo Wallet */
export interface EmailWalletConfig {
    asunto: string;
    nombreRemitente: string;
    emailRemitente: string;
    telefonoContacto: string;
    emailContacto: string;
    direccion: string;
    tituloPaso1: string;
    textoPaso1: string;
    tituloPaso2: string;
    textoPaso2: string;
    tituloPaso3: string;
    textoPaso3: string;
    nombreEmpresa: string;
}

/** Datos de muestra inyectados solo en el preview — no van a BD */
export interface EmailWalletPreviewData {
    destinatario: string;
    codigoInvitacion: string;
    qrBase64: string;
}