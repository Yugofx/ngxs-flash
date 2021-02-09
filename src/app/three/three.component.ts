import { Component } from '@angular/core';
import { CounterThService } from '../three-store/service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.css'],
  providers: [CounterThService]
})
export class ThreeComponent {
  @Select(state => state.counterThrd.count) count$: Observable<number>;

  constructor(public service: CounterThService) {}
}
