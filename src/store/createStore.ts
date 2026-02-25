import { useSyncExternalStore } from 'react';

type Listener = () => void;

type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
  replace?: boolean
) => void;
type GetState<T> = () => T;

export interface StoreApi<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
}

export type UseStore<T> = {
  (): T;
  <U>(selector: (state: T) => U): U;
} & StoreApi<T>;

export function createStore<TState>(
  createState: (set: SetState<TState>, get: GetState<TState>) => TState
): UseStore<TState> {
  let state: TState;
  const listeners = new Set<Listener>();

  const setState: SetState<TState> = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (nextState !== state) {
      const previousState = state;
      state = (replace ? nextState : Object.assign({}, state, nextState)) as TState;
      listeners.forEach((listener) => listener());
    }
  };

  const getState: GetState<TState> = () => state;

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  state = createState(setState, getState);

  const useStore = <TSelection>(
    selector?: (state: TState) => TSelection
  ): TSelection | TState => {
    const storeState = useSyncExternalStore(subscribe, getState, getState);
    return selector ? selector(storeState) : storeState;
  };

  Object.assign(useStore, {
    getState,
    setState,
    subscribe,
  });

  return useStore as UseStore<TState>;
}
