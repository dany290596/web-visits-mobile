export class IUsuarioHidTipoCredencialRequest {
    licenciaHidUserId?: string;
    tipoCredencialId?: string;
}

export class IUsuarioHidTipoCredencialFilter {
    LicenciaHidUserId?: any;
    TipoCredencialId?: any;

    LicenciaId?: string = "";
    Nombre?: string = "";
    Email?: string = "";
    UserId?: any;
    Site?: string = "";
    Alert?: string = "";
    LicenseCount?: any;
    Telefono?: string = "";
    InvitacionFecha?: string = "";
    InvitacionExpirationDate?: string = "";
    InvitacionActividad?: string = "";
    InvitacionDetalle?: string = "";
    Status?: any;
    EmpresaClienteId?: string = "";

    PageSize?: any;
    PageNumber?: any;
    DatosCompletos?: any;
    TipoQuery?: string = "";
    Id?: string = "";
    UsuarioCreadorId?: string = "";
    UsuarioModificadorId?: string = "";
    UsuarioBajaId?: string = "";
    UsuarioReactivadorId?: string = "";
    FechaCreacionDesde?: string = "";
    FechaCreacionHasta?: string = "";
    FechaModificacionDesde?: string = "";
    FechaModificacionHasta?: string = "";
    FechaBajaDesde?: string = "";
    FechaBajaHasta?: string = "";
    FechaReactivacionDesde?: string = "";
    FechaReactivacionHasta?: string = "";
    Estado?: any;
}