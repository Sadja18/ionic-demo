import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileListPage } from './profile-list.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileListPageRoutingModule {}
