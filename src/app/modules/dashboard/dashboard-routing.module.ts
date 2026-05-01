import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Nft } from './pages/nft/nft';
import { Inicio } from './pages/inicio/inicio';

const routes: Routes = [
    {
        path: '',
        component: Dashboard,
        children: [
            { path: '', redirectTo: 'inicio', pathMatch: 'full' },
            { path: 'nfts', component: Nft },
            { path: 'inicio', component: Inicio },
            { path: '**', redirectTo: 'errors/404' },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule { }