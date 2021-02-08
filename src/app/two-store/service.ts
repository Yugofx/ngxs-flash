import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Decrement, Increment, Reset } from './actions';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Injectable()
export class CounterSecService {
  private destroy = new Subject();
  constructor(private store: Store, private actions$: Actions) {
    this.actions$.pipe(
      ofActionSuccessful(Increment),
      tap(() => console.log('increment effect')),
      takeUntil(this.destroy)
    ).subscribe();

    this.actions$.pipe(
      ofActionSuccessful(Decrement),
      tap(() => console.log('decrement effect')),
      takeUntil(this.destroy)
    ).subscribe();

    this.actions$.pipe(
      ofActionSuccessful(Reset),
      tap(() => console.log('reset effect')),
      takeUntil(this.destroy)
    ).subscribe();
  }

  increment() {
    this.store.dispatch(new Increment());
  }

  decrement() {
    this.store.dispatch(new Decrement());
  }

  reset() {
    this.store.dispatch(new Reset());
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
