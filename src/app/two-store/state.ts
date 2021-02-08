import { Action, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Decrement, Increment, Reset } from './actions';

@State<{ count: number }>({
  name: 'counterSec',
  defaults: { count: 0 }
})
@Injectable()
export class CounterSecState {

  @Action(Increment)
  increment(ctx: StateContext<{ count: number }>) {
    console.log('state increment');
    ctx.patchState({ count: ctx.getState().count + 1 });
  }

  @Action(Decrement)
  decrement(ctx: StateContext<{ count: number }>) {
    console.log('state decrement');
    ctx.patchState({ count: ctx.getState().count - 1 });
  }

  @Action(Reset)
  reset(ctx: StateContext<{ count: number }>) {
    console.log('state reset');
    ctx.setState({ count: 0 });
  }
}
