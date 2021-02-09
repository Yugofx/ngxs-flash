import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { createDispatcher, createEffects, FinEffect } from '../ngrx-flash';
import { pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

interface ICounterAction {
  increment(payload: { count: number });
  decrement();
  reset();
}

@Injectable()
export class CounterService {
  dispatch = createDispatcher<ICounterAction>(this.store);
  constructor(private store: Store, private actions$: Actions) {
    createEffects(this);
  }

  @FinEffect('ofActionSuccessful')
  increment() {
    return pipe(tap(() => console.log('increment effect')));
  }

  @FinEffect('ofActionSuccessful')
  decrement() {
    return pipe(tap(() => console.log('decrement effect')));
  }

  @FinEffect('ofActionSuccessful')
  reset() {
    return pipe(tap(() => console.log('reset effect')));
  }
}
