import { Component } from '@angular/core';
import { CounterService } from '../one-store/service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-one',
  templateUrl: './one.component.html',
  styleUrls: ['./one.component.css'],
  providers: [CounterService]
})
export class OneComponent {
  @Select(state => state.counter.count) count$: Observable<number>;

  constructor(public service: CounterService) {}
}
