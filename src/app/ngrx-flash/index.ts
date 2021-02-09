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
import { pluck, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

const compact = (array: any[]) => array.filter(Boolean);

const ACTION_EFFECT_SYMBOL = Symbol('__ngxs-fin-effects__');
const ACTION_MAP_SYMBOL = Symbol('__ngxs-fin-actions__');

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

export function FinStoreAction(options?: ActionOptions): MethodDecorator {
  // tslint:disable-next-line:only-arrow-functions
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const decorateFn = Action([propertyKey].map(type => ({ type })), options);
    decorateFn(target, propertyKey, descriptor);
  };
}

function createAction<T>(actionName, payload: T) {
  if (!createAction[ACTION_MAP_SYMBOL]) {
    createAction[ACTION_MAP_SYMBOL] = {};
  }
  if (!createAction[ACTION_MAP_SYMBOL][actionName]) {
    createAction[ACTION_MAP_SYMBOL][actionName] = class {
      static readonly type = actionName;
      constructor(actionPayload = {}) {
        Object.keys(actionPayload).forEach(key => {
          this[key] = actionPayload[key];
        });
      }
    };
  }

  return new createAction[ACTION_MAP_SYMBOL][actionName](payload);
}

export function createDispatcher<T, K = any>(store: Store): T {
  return new Proxy({}, {
    get(target, actionName: string) {
      if (actionName === 'hasOwnProperty') {
        return target[actionName];
      }
      return payload => store.dispatch(createAction<K>(actionName, payload));
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

export function FinServiceAction(): MethodDecorator {
  // tslint:disable-next-line:only-arrow-functions
  return function(target: any, prop, descriptor) {
    if (typeof target[prop] !== 'function') {
      return;
    }

    const originalFn = descriptor.value;

    const [_, body] = target[prop].toString().match(/\{([\s\S]*)\}$/m);
    const isBodyEmpty = body.replace(/^\s*\/\/.*$/mg, '').trim().length === 0;
    if (isBodyEmpty) {
      // @ts-ignore
      descriptor.value = function(payload) {
        return this.dispatch[prop](payload).pipe(take(1)).subscribe();
      };
    } else {
      // @ts-ignore
      // tslint:disable-next-line:only-arrow-functions
      descriptor.value = function(payload) {
        // @ts-ignore
        return originalFn.call(this, payload).subscribe();
      };
    }
    return descriptor;
  };
}

export function FinActionEffect(actionName: string, hook: TEffectType): MethodDecorator {
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
        if (!effectRunner[actionName]) {
          effectRunner[actionName] = null;
        } else if (typeof effectRunner[actionName].unsubscribe === 'function') {
          effectRunner[actionName].unsubscribe();
          effectRunner[actionName] = null;
        }
        effectRunner[actionName] = this.actions$
          .pipe(
            resolveHandler(hook, actionName),
            originalPipe.call(this)
          ).subscribe();
      }
      target[ACTION_EFFECT_SYMBOL][propertyKey] = effectRunner;
    }
  };
}

export function FinStateService<K, TActions = any>(): ClassDecorator {
  // @ts-ignore
  // tslint:disable-next-line:only-arrow-functions
  return function(constructor) {
    // @ts-ignore
    return class extends constructor {
      private dispatch: TActions;
      private store: Store;
      constructor() {
        super();
        this.dispatch = createDispatcher(this.store);
      }
    };
  };
}
