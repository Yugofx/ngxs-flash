import { State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FinStoreAction } from '../ngrx-flash';

@State<{ count: number }>({
  name: 'counter',
  defaults: { count: 0 }
})
@Injectable()
export class CounterState {
  @FinStoreAction()
  increment(ctx: StateContext<{ count: number }>, { count }) {
    ctx.patchState({ count: ctx.getState().count + count });
  }

  @FinStoreAction()
  decrement(ctx: StateContext<{ count: number }>) {
    ctx.patchState({ count: ctx.getState().count - 1 });
  }

  @FinStoreAction()
  reset(ctx: StateContext<{ count: number }>) {
    ctx.setState({ count: 0 });
  }
}
