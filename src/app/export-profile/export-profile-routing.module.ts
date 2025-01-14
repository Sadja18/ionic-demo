import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExportProfilePage } from './export-profile.page';

const routes: Routes = [
  {
    path: '',
    component: ExportProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportProfilePageRoutingModule {}
