import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxsModule } from '@ngxs/store';
import { CounterState } from './one-store/state';
import { RouterModule } from '@angular/router';
import { CounterSecState } from './two-store/state';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxsModule.forRoot([CounterState, CounterSecState]),
    RouterModule.forRoot([
      { path: '', pathMatch: 'full', redirectTo: 'one' },
      { path: 'one', loadChildren: () => import('./one/one.module').then(m => m.OneModule) },
      { path: 'two', loadChildren: () => import('./two/two.module').then(m => m.TwoModule) },
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
