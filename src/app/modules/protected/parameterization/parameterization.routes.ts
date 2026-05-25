import { Routes } from '@angular/router';

import { ConfiguracionCorreo } from './pages/configuracion-correo/configuracion-correo';
import { CuentaCorreo } from './pages/cuenta-correo/cuenta-correo';
import { PlantillaCorreoHid } from './pages/plantilla-correo-hid/plantilla-correo-hid';
import { PlantillaCorreoWallet } from './pages/plantilla-correo-wallet/plantilla-correo-wallet';

export default [
    {
        path: 'configuracion-correo',
        component: ConfiguracionCorreo
    },
    {
        path: 'cuenta-correo',
        component: CuentaCorreo
    },
    {
        path: 'plantilla-correo-hid',
        component: PlantillaCorreoHid
    },
    {
        path: 'plantilla-correo-wallet',
        component: PlantillaCorreoWallet
    },
    {
        path: '**',
        redirectTo: 'cuenta-correo'
    }
] as Routes;