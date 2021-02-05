import { select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, OperatorFunction, pipe, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

export interface INgRxFlashAction {
    type: string | number | symbol;
    payload: any;
}

export function createReducer(reducers, initialState) {
    return function reducer(state = initialState, action) {
        if (action.type in reducers) {
            return reducers[action.type](state, action.payload);
        } else {
            return state;
        }
    };
}

export const createDispatcher = <T>(store): T => {
    return new Proxy(
        {},
        {
            get: (obj, prop) => {
                if (prop === 'hasOwnProperty') {
                    return obj[prop];
                }

                const dispatch = payload => {
                    store.dispatch({ type: prop, payload } as INgRxFlashAction);
                };
                Object.defineProperty(dispatch, 'name', {
                    value: prop
                });
                return dispatch;
            }
        }
    ) as T;
};

export const createActions = <T>(): T => {
    return new Proxy(
        {},
        {
            get: (obj, prop) => {
                if (prop === 'hasOwnProperty') {
                    return obj[prop];
                }

                const action = (payload): INgRxFlashAction => {
                    return { type: prop, payload };
                };
                Object.defineProperty(action, 'name', {
                    value: prop
                });
                return action;
            }
        }
    ) as T;
};

export const createSelectors = <T>(store, selectors): T => {
    const accessors = {};
    for (const selectorName in selectors) {
        if (!selectors.hasOwnProperty(selectorName)) {
            continue;
        }

        accessors[selectorName] = props => store.pipe(select(selectors[selectorName], props));
    }
    return accessors as T;
};

const ACTION_EFFECT = Symbol('@ngrx/flash/action-effect');

export function ActionEffect(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (target[propertyKey] instanceof Function) {
        descriptor.enumerable = true;
        target[propertyKey][ACTION_EFFECT] = true;
    }
}

export const createEffects = (service: any, actions$: Actions): void => {
    const effectMethods: string[] = [];
    for (const propertyName in service) {
        if (service[propertyName][ACTION_EFFECT] === true) {
            effectMethods.push(propertyName);
        }
    }

    effectMethods.forEach(method => {
        service[`_${method}$`] = createEffect(() => service[method](actions$.pipe(ofType(method))));
    });
};

export const NGRX_FLASH_EMPTY_ACTION = { type: '@ngrx/flash/EMPTY' };

export const EXIT_EFFECT = of(null).pipe(
    tap(() => console.warn('Make sure you\'re using "EXIT_EFFECT" in conjunction with "endEffect" operator')),
    switchMap(() => throwError(NGRX_FLASH_EMPTY_ACTION)));

export const endEffect = (finalizeFn = () => {}): OperatorFunction<any, any> => pipe(
    tap(() => {
        finalizeFn();
    }),
    catchError((error, source) => {
        finalizeFn();

        // If it's a skip logic, return source to keep source stream opened
        if (error === NGRX_FLASH_EMPTY_ACTION) {
            return source;
        } else {
            // All other errors are rethrown and caught by client
            return throwError(error);
        }
    }),
);
