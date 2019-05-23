import { Observable, throwError, Subject } from 'rxjs';
import { tap, catchError, retryWhen, switchMapTo } from 'rxjs/operators';
import { RequestState } from './request-state.interface';

export function trackRequest<T = any>() {
  return (source: Observable<T>): Observable<RequestState<T>> => {
    return new Observable((subscriber) => {
      const retry$ = new Subject<void>();
      const retry = () => retry$.next();

      subscriber.next({
        result: null,
        isLoading: true,
        hasError: false,
        error: null,
        retry
      });

      return source
        .pipe(
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
          retryWhen((errs) => {
            return errs.pipe(
              switchMapTo(retry$),
              tap(() => {
                subscriber.next({
                  result: null,
                  isLoading: true,
                  hasError: false,
                  error: null,
                  retry
                });
              })
            );
          }),
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
    });
  };
}
