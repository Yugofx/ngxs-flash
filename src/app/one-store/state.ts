import { State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { FinAction } from '../ngrx-flash';

@State<{ count: number }>({
  name: 'counter',
  defaults: { count: 0 }
})
@Injectable()
export class CounterState {
  @FinAction()
  increment(ctx: StateContext<{ count: number }>) {
    console.log('state increment');
    ctx.patchState({ count: ctx.getState().count + 1 });
  }

  @FinAction()
  decrement(ctx: StateContext<{ count: number }>) {
    console.log('state decrement');
    ctx.patchState({ count: ctx.getState().count - 1 });
  }

  @FinAction()
  reset(ctx: StateContext<{ count: number }>) {
    console.log('state reset');
    ctx.setState({ count: 0 });
  }
}
