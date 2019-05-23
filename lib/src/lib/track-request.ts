import { Observable, throwError, Subject, of } from 'rxjs';
import { tap, catchError, retryWhen, switchMapTo, switchMap } from 'rxjs/operators';
import { RequestState } from './request-state.interface';

export function trackRequest<T>(
  callback: () => Observable<T>
): Observable<RequestState<T>> {
  const retry$ = new Subject<void>();
  const retry = () => retry$.next();

  return new Observable((subscriber) => {
    const subscription = of('start')
      .pipe(
        tap(() => {
          subscriber.next({
            result: null,
            isLoading: true,
            hasError: false,
            error: null,
            retry
          });
        }),
        switchMap(() => callback()),
        catchError((err) => {
          subscriber.next({
            result: null,
            isLoading: false,
            hasError: true,
            error: err,
            retry
          });
          return throwError(err);
        }),
        retryWhen((errs) => errs.pipe(switchMapTo(retry$))),
        tap((result) => {
          subscriber.next({
            result,
            isLoading: false,
            hasError: false,
            error: null,
            retry
          });
        })
      )
      .subscribe();

    return function unsubscribe() {
      subscription.unsubscribe();
    };
  });
}
