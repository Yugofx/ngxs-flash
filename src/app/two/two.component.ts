import { Component, OnInit } from '@angular/core';
import { CounterSecService } from '../two-store/service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-two',
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.css'],
  providers: [CounterSecService]
})
export class TwoComponent {
  @Select(state => state.counterSec.count) count$: Observable<number>;

  constructor(private service: CounterSecService) {}

  increment() {
    this.service.increment();
  }

  decrement() {
    this.service.decrement();
  }

  reset() {
    this.service.reset();
  }
}
