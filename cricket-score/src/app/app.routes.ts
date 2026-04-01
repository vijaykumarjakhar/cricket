import { Routes } from '@angular/router';
import { CricapiMatchesComponent } from './cricapi-matches/cricapi-matches.component';
import { RoanuzMatchesComponent } from './roanuz-matches/roanuz-matches.component';

export const routes: Routes = [
  { path: '', redirectTo: 'cricapi', pathMatch: 'full' },
  { path: 'cricapi', component: CricapiMatchesComponent },
  { path: 'roanuz', component: RoanuzMatchesComponent }
];
