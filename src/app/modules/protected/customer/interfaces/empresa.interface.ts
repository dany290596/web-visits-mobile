export class IEmpresaFilter {
    RazonSocial?: string;
    RFC?: string;
    TelefonoEmpresa?: string;
    TelefonoMovil?: string;
    CorreoElectronico?: string;
    UsaCredencialesHID?: string;
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