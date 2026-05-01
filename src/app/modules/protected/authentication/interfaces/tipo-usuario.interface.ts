export class ITipoUsuarioFilter {
    Nombre?: string;
    TieneSesion?: number;
    PageSize?: number;
    PageNumber?: number;
    UsuarioCreadorId?: string;
    UsuarioModificadorId?: string;
    UsuarioBajaId?: string;
    UsuarioReactivadorId?: string;
    FechaCreacionDesde?: string;
    FechaCreacionHasta?: string;
    FechaModificacionDesde?: string;
    FechaModificacionHasta?: string;
    FechaBajaDesde?: string;
    FechaBajaHasta?: string;
    FechaReactivacionDesde?: string;
    FechaReactivacionHasta?: string;
    Estado?: number;
    EmpresaId?: string;
    DatosCompletos?: number;
}