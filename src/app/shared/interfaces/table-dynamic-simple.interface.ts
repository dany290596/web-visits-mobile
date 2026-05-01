export interface ISimpleTable {
    titulosEnTitulos: ISimpleTableTitulo[],
    titulosEnDetalle: ISimpleTableTitulo[],
    registros: ISimpleTableRegistro[],
    ColumnaAcciones: boolean,
    TieneDetalle: boolean,
    AccionVer: boolean,
    AccionEliminar: boolean,
    AccionDetalle: boolean

    setTieneAcciones(booAccionVer: boolean, booAccionEliminar: boolean, booAccionDetalle: boolean): void;
    addTitulo(strTexto: string, booEnTitulo: boolean, booEnDetalle: boolean, booVisibleMD: boolean,
        booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number, numColLG: number,
        numColXL: number): void;
    addRegistro(strRegistroId: string, arrCampos: ISimpleTableRegistroCampo[]): void;
}

export interface ISimpleTableTitulo {
    texto: string,
    enDetalle: boolean,
    enTitulo: boolean,
    visibleMD: boolean,
    visibleLG: boolean,
    visibleXL: boolean,
    colMD: number,
    colLG: number,
    colXL: number

    getClass(): string;
}

export interface ISimpleTableRegistro {
    registroId: string,
    expandirRegistro: boolean,
    camposEnLinea: ISimpleTableRegistroCampo[],
    camposEnDetalle: ISimpleTableRegistroCampo[]

    addCampo(campo: ISimpleTableRegistroCampo): void;
    addCampos(campos: ISimpleTableRegistroCampo[]): void;
}

export interface ISimpleTableRegistroCampo {
    texto: string,
    enLinea: boolean,
    enDetalle: boolean,
    visibleMD: boolean,
    visibleLG: boolean,
    visibleXL: boolean,
    colMD: number,
    colLG: number,
    colXL: number

    getClass(): string;
    setValores(strTexto: string, booEnLinea: boolean, booEnDetalle: boolean,
        booVisibleMD: boolean, booVisibleLG: boolean, booVisibleXL: boolean,
        numColMD: number, numColLG: number, numColXL: number): void;
}