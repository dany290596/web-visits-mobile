export class IUsuarioHIDFilter {
    LicenciaId: string = "";
    Nombre: string = "";
    Email: string = "";
    UserId: any;
    Site: string = "";
    Alert: string = "";
    LicenseCount: any;
    Telefono: string = "";
    InvitacionFecha: string = "";
    InvitacionExpirationDate: string = "";
    InvitacionActividad: string = "";
    InvitacionDetalle: string = "";
    Status: any;
    EmpresaClienteId: string = "";

    PageSize: any;
    PageNumber: any;
    DatosCompletos: any;
    TipoQuery: string = "";
    Id: string = "";
    UsuarioCreadorId: string = "";
    UsuarioModificadorId: string = "";
    UsuarioBajaId: string = "";
    UsuarioReactivadorId: string = "";
    FechaCreacionDesde: string = "";
    FechaCreacionHasta: string = "";
    FechaModificacionDesde: string = "";
    FechaModificacionHasta: string = "";
    FechaBajaDesde: string = "";
    FechaBajaHasta: string = "";
    FechaReactivacionDesde: string = "";
    FechaReactivacionHasta: string = "";
    Estado: any;
}

export class IUsuarioHIDRequest {
    licenciaId: any;
    nombre: any;
    email: any;
    userId: any;
    site: any;
    alert: any;
    licenseCount: any;
    telefono: any;
    invitacionFecha: any;
    invitacionExpirationDate: any;
    invitacionActividad: any;
    invitacionId: any;
    invitacionDetalle: any;
    status: any;
    apellidos: any;
    fechaInicio: any;
    fechaFin: any;
}