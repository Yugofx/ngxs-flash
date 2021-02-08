import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TwoComponent } from './two.component';

@NgModule({
  declarations: [TwoComponent],
  imports: [CommonModule, RouterModule.forChild([
    { path: '', component: TwoComponent }
  ])],
})
export class TwoModule {}
