import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('../setting/profile-setting.module').then( m => m.ProfileSettingPageModule)
      },
      {
        path: 'paypro',
        loadChildren: () => import('../Products/paypro/paypro.module').then(m => m.PayproPageModule)
      },
      {
        path: 'import-trade',
        loadChildren: () => import('../Products/trade/trade.module').then(m => m.TradePageModule)
      },
      {
        path: 'export-trade',
        loadChildren: () => import('../Products/trade/trade.module').then(m => m.TradePageModule)
      },
      {
        path: 'logout',
        loadChildren: () => import('../logout/logout.module').then(m => m.LogoutPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {}
