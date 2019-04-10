import { Injectable } from '@angular/core';
import { Observable, throwError, Subject, of } from 'rxjs';
import { tap, catchError, retryWhen, switchMapTo, switchMap } from 'rxjs/operators';

export interface RequestState<T> {
  result: T | null;
  isLoading: boolean;
  error: any;
  retry: () => void;
}

@Injectable()
export class RequestStateService {
  public createRequest<T>(callback: () => Observable<T>): Observable<RequestState<T>> {
    const retry$ = new Subject<void>();
    const retry = () => retry$.next();

    return new Observable((subscriber) => {
      const subscription = of('start')
        .pipe(
          tap(() => {
            subscriber.next({
              result: null,
              isLoading: true,
              error: null,
              retry
            });
          }),
          switchMap(() => callback()),
          catchError((err) => {
            subscriber.next({
              result: null,
              error: err,
              isLoading: false,
              retry
            });
            return throwError(err);
          }),
          retryWhen((errs) => errs.pipe(switchMapTo(retry$))),
          tap((result) => {
            subscriber.next({
              result,
              error: null,
              isLoading: false,
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
}
