import { Injectable } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { createDispatcher, createEffects, FinActionEffect, FinServiceAction, FinStateService } from '../ngrx-flash';
import { switchMap, tap } from 'rxjs/operators';
import { pipe, timer } from 'rxjs';

// @FinStateService<CounterThService>()
@Injectable()
export class CounterThService {
  dispatch = createDispatcher<any>(this.store);
  constructor(private store: Store, private actions$: Actions) {
    createEffects(this);
  }

  @FinServiceAction()
  incrementTh(payload: { count: number }) {}

  @FinServiceAction()
  decrementTh(payload: { count: number }) {
    return timer(2000)
      .pipe(switchMap(() => this.dispatch.decrementTh(payload)));
  }

  @FinActionEffect('incrementTh', 'ofActionSuccessful')
  ofIncrementThSuccessful() {
    return pipe(tap(payload => console.log(payload)));
  }

  @FinActionEffect('decrementTh', 'ofAction')
  ofDecrementThSuccessful() {
    return pipe(tap(payload => console.log(payload)));
  }
}
