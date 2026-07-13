import { Injectable } from '@angular/core';

export interface VariablePlantilla {
    nombre: string;
    detalle: string;
}

const ALTA_USUARIO_ID = '00ebbdab-b1f6-4a5e-90de-4333ba36f18b';

const MAPA_VARIABLES: Record<string, VariablePlantilla[]> = {
    [ALTA_USUARIO_ID]: [
        { nombre: '#Nombre', detalle: 'Nombre' },
        { nombre: '#Usuario', detalle: 'Nombre del usuario' },
        { nombre: '#Contrasena', detalle: 'Contraseña del usuario' },
    ],
};

@Injectable({ providedIn: 'root' })
export class VariablePlantillaService {
    obtenerVariables(tipoPlantillaNotificacionId: string | null | undefined): VariablePlantilla[] {
        if (!tipoPlantillaNotificacionId) return [];
        return MAPA_VARIABLES[tipoPlantillaNotificacionId] ?? [];
    }
}