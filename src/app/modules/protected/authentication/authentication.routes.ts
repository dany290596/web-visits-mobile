import { Routes } from '@angular/router';
import { Perfil } from './pages/perfil/perfil';
import { Usuario } from './pages/usuario/usuario';

export default [
    {
        path: 'perfil',
        component: Perfil
    },
    {
        path: 'usuario',
        component: Usuario
    },
    {
        path: '**',
        redirectTo: 'usuario'
    }
] as Routes;