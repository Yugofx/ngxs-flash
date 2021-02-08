import {
  Action,
  ActionOptions,
  Store,
  ofAction,
  ofActionDispatched,
  ofActionCanceled,
  ofActionCompleted,
  ofActionErrored,
  ofActionSuccessful,
  ActionType
} from '@ngxs/store';
import { pluck } from 'rxjs/operators';

const ACTION_EFFECT_SYMBOL = Symbol('__ngxs-fin-effects__');

export type TEffectType = 'ofAction'
  | 'ofActionDispatched'
  | 'ofActionSuccessful'
  | 'ofActionCanceled'
  | 'ofActionErrored'
  | 'ofActionCompleted';

function resolveHandler(type: TEffectType, actionName: string) {
  const action = { type: actionName } as ActionType;
  switch (type) {
    case 'ofAction': return ofAction(action);
    case 'ofActionDispatched': return ofActionDispatched(action);
    case 'ofActionSuccessful': return ofActionSuccessful(action);
    case 'ofActionCanceled': return ofActionCanceled(action);
    case 'ofActionErrored': return ofActionErrored(action);
    case 'ofActionCompleted': return ofActionCompleted(action);
  }
}

export function FinAction(options?: ActionOptions): MethodDecorator {
  // tslint:disable-next-line:only-arrow-functions
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const decorateFn = Action([propertyKey].map(type => ({ type })), options);
    decorateFn(target, propertyKey, descriptor);
  };
}

function createAction<T>(actionName, payload: T) {
  return { payload, type: actionName };
}

export function createDispatcher<T, K = any>(store: Store): T {
  return new Proxy({}, {
    get(target, actionName: string) {
      if (actionName === 'hasOwnProperty') {
        return target[actionName];
      }
      return payload => {
        store.dispatch(createAction<K>(actionName, payload));
      };
    }
  }) as T;
}

export function FinEffect(hook: TEffectType): MethodDecorator {
  // tslint:disable-next-line:only-arrow-functions
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (typeof target[propertyKey] === 'function') {
      const originalPipe = target[propertyKey];
      if (!target[ACTION_EFFECT_SYMBOL]) {
        target[ACTION_EFFECT_SYMBOL] = {};
      }
      function effectRunner() {
        if (!this.actions$) {
          throw new Error(`Actions must be provided from the @ngxs/store.

@Injectable()
export class ${this.constructor.name} {
  constructor(>>> private actions$: Actions <<<)
  ...
}
          `);
        }
        if (!effectRunner[propertyKey]) {
          effectRunner[propertyKey] = null;
        } else if (typeof effectRunner[propertyKey].unsubscribe === 'function') {
          effectRunner[propertyKey].unsubscribe();
          effectRunner[propertyKey] = null;
        }
        effectRunner[propertyKey] = this.actions$
          .pipe(
            resolveHandler(hook, propertyKey),
            pluck('payload'),
            originalPipe.call(this)
          ).subscribe();
      }
      target[ACTION_EFFECT_SYMBOL][propertyKey] = effectRunner;
    }
  };
}

export function createEffects<T>(service: T) {
  if (!service[ACTION_EFFECT_SYMBOL]) {
    throw new Error(`No effects declared in ${service.constructor.name}`);
  }
  Object.values(service[ACTION_EFFECT_SYMBOL])
    .forEach((func: any) => func.call(service));
}
//
// export const createSelectors = <T>(store, selectors): T => {
//     const accessors = {};
//     for (const selectorName in selectors) {
//         if (!selectors.hasOwnProperty(selectorName)) {
//             continue;
//         }
//
//         accessors[selectorName] = props => store.pipe(select(selectors[selectorName], props));
//     }
//     return accessors as T;
// };
