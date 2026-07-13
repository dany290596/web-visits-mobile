export interface ISucursalFilter {
    Nombre?: string;
    RFC?: string;
    Estado?: number;
    EmpresaClienteId?: string;
    PageSize?: number;
    PageNumber?: number;
}

export interface ISucursal {
    id: string;
    nombre: string;
    rfc: string;
    estado?: number;
}
