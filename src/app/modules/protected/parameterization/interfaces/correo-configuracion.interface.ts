export interface ISmtpConfig {
    correo: string;
    servidor: string;
    puerto: number;
    usuario: string;
    password: string;
    ssl: boolean;
    tls12: boolean;
    tls13: boolean;
}

export interface IOAuthConfig {
    tenant: string;
    client: string;
    clientSecret: string;
    correo: string;
}

export interface ICorreoConfiguracionRequest {
    empresaId: string;
    tipoAutenticacion: 'SMTP' | 'OAuth';
    smtp?: ISmtpConfig;
    oauth?: IOAuthConfig;
}

export interface ICorreoConfiguracionData {
    empresaId: string;
    tipoAutenticacion: string;
    smtp: ISmtpConfig | null;
    oAuth: IOAuthConfig | null;
}

export interface ICorreoConfiguracionResponse {
    respuesta: boolean;
    mensaje: string;
    codigo: number;
    data: ICorreoConfiguracionData | null;
    meta: any;
}
