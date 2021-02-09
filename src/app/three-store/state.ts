import { State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FinStoreAction } from '../ngrx-flash';

@State<{ count: number }>({
  name: 'counterThrd',
  defaults: { count: 0 }
})
@Injectable()
export class CounterThState {
  @FinStoreAction()
  incrementTh(ctx: StateContext<{ count: number }>, { count }) {
    ctx.patchState({ count: ctx.getState().count + count });
  }

  @FinStoreAction()
  decrementTh(ctx: StateContext<{ count: number }>, { count }) {
    ctx.patchState({ count: ctx.getState().count - count });
  }

  @FinStoreAction()
  resetTh(ctx: StateContext<{ count: number }>) {
    ctx.setState({ count: 0 });
  }
}
