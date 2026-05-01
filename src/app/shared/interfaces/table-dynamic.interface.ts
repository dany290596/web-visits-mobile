export interface IDataTable {
    titulosEnTitulos: IDataTableTitulo[],
    titulosEnDetalle: IDataTableTitulo[],
    registros: IDataTableRegistro[],
    ColumnaAcciones: boolean,
    AccionVer: boolean,
    AccionEliminar: boolean,
    AccionEditar: boolean,
    AccionDetalle: boolean,

    setTieneAcciones(booAccionVer: boolean, booAccionEliminar: boolean, booAccionDetalle: boolean, booAccionEditar: boolean): void;
    addTitulo(strTexto: string, booEnTitulo: boolean, booEnDetalle: boolean, booVisibleMD: boolean,
        booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number, numColLG: number,
        numColXL: number): void;
    addRegistro(strRegistroId: string, estado: number, arrCampos: IDataTableRegistroCampo[],
        opcionesControl?: {
            mostrarInactivar?: boolean,
            mostrarReactivar?: boolean,
            mostrarDetalle?: boolean,
            mostrarEditar?: boolean
        }
    ): void;
    refreshRegistro(strRegistroId: string, arrCampos: IDataTableRegistroCampo[]): boolean;
}

export interface IDataTableTitulo {
    texto: string,
    enDetalle: boolean,
    enTitulos: boolean,
    visibleMD: boolean,
    visibleLG: boolean,
    visibleXL: boolean,
    colMD: number,
    colLG: number,
    colXL: number

    getClass(): string;
}

export interface IDataTableRegistro {
    registroId: string,
    expandirRegistro: boolean,
    estado: number,
    visualizar: boolean,
    camposEnLinea: IDataTableRegistroCampo[],
    camposEnDetalle: IDataTableRegistroCampo[]

    mostrarInactivar?: boolean;
    mostrarReactivar?: boolean;
    mostrarDetalle?: boolean;
    mostrarEditar?: boolean;

    addCampo(campo: IDataTableRegistroCampo): void;
    addCampos(campos: IDataTableRegistroCampo[]): void;
}

export interface IDataTableRegistroCampo {
    texto: string,
    arrTexto: string[],
    tipoCampo: number,
    propiedadesCampo: IDTRCampoPropiedad[],
    enLinea: boolean,
    enDetalle: boolean,
    visibleMD: boolean,
    visibleLG: boolean,
    visibleXL: boolean,
    colMD: number,
    colLG: number,
    colXL: number

    getClass(): string;

    setValores(strTexto: string, numTipoCampo: number, booEnTitulo: boolean, booEnDetalle: boolean,
        booVisibleMD: boolean, booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number,
        numColLG: number, numColXL: number, arrPropiedadesCampo?: IDTRCampoPropiedad[],
        strArrTexto?: string[]): void;

    getBadgeColor(): string;
}

export interface IDTRCampoPropiedad {
    condicion: string,
    aplicar: number
}