export interface IUsuario {
    fechaCreacion: Date,
    fechaModificacion: Date,
    fechaBaja: Date,
    fechaReactivacion: Date,
    usuarioCreadorId: string,
    usuarioModificadorId: string,
    usuarioBajaId: string,
    usuarioReactivacionId: string,
    empresaId: string,
    estado: number,
    usuarioId: string,
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    correoElectronico: string,
    passwordHash: string,
    passwordSalt: string,
    vence: 0,
    tipoUsuarioId: string,
    perfilId: string,
    colaboradorId: string,
    visitanteId: string,
    fechaVencimiento: string
}

export class IUsuarioFilter {
    Correo?: string;
    EmpresaId?: string;
    PerfilId?: string;
    TipoUsuarioId?: string;
    IdAsociado?: string;
    Vence?: any;
    Estado?: any;
    DatosCompletos?: number;
    DataComplete?: number;
    PageSize?: number;
    PageNumber?: number;
}

export class IUsuarioRequest {
    correo?: string;
    contrasena?: string;
    perfilId?: string;
    tipoUsuarioId?: string;
    idioma?: string;
    vence?: number;
    fechaVencimiento?: any;
}

export class IUsuarioExternoRequest {
    public correo?: string;
    public contrasena?: string;
    public perfilId?: string;
    public tipoUsuarioId?: string;
    public idAsociado?: string;
    public idioma?: string;
    public vence?: number;
    public fechaVencimiento?: string;

    public nombre?: string;
    public apellidoPaterno?: string;
    public apellidoMaterno?: string;
    public genero?: number;
    public tipoIdentificacionId?: string;
    public identificacion?: string;
    public foto?: string;
    public extensionFoto?: string;
    public empresa?: string;
    public tieneFoto?: number;
    public nombreFoto?: string;
    public esVisitanteFrecuente?: number;
    public numeroSeguro?: string;
    public colonia?: string;
    public calle?: string;
    public ciudad?: string;
    public cp?: string;
    public estadoCiudad?: string;
    public email?: string;
    public telefono?: string;
}

export class IUsuarioAutenticado {
    asociadoId?: string;
    email?: string;
    empresaId?: string;
    perfilId?: string;
    usuarioId?: string;
    tipoUsuarioId?: string;
}

export interface IUsuarioResponse {
    asociado: any;
    empresa: any;
    correo?: string;
    empresaId?: string;
    estado?: number;
    fechaCreacion?: string;
    fechaModificacion?: string;
    id?: string;
    idAsociado?: string;
    idioma?: string;
    perfil: any;
    perfilId?: string;
    tipoUsuario: any;
    tipoUsuarioId?: string;
    usuarioCreadorId?: string;
    usuarioModificadorId?: string;
    vence?: number;
    fechaVencimiento?: string;
    visitanteExterno: any;
}