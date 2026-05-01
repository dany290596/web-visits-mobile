import { Routes } from '@angular/router';

import { ConfiguracionCorreo } from './pages/configuracion-correo/configuracion-correo';
import { CuentaCorreo } from './pages/cuenta-correo/cuenta-correo';

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
        path: '**',
        redirectTo: 'cuenta-correo'
    }
] as Routes;