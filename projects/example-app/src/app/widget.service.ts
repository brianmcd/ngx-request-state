import { Injectable } from '@angular/core';
import { RequestStateService, RequestState } from 'ngx-request-state';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Widget {
  name: string;
}

interface WidgetMap {
  [id: number]: Widget;
}

const widgets: WidgetMap = {
  1: { name: 'My First Widget' },
  2: { name: 'My Second Widget' }
};

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  public simulateFailure = false;

  constructor(private readonly requestStateService: RequestStateService) {}

  public fetch(id: number): Observable<RequestState<Widget>> {
    return this.requestStateService.createRequest(() => {
      return timer(300).pipe(
        switchMap(() => {
          if (this.simulateFailure) {
            return throwError(new Error('Simulated Failure'));
          }
          return of(widgets[id]);
        })
      );
    });
  }
}
