import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestState } from './request-state.interface';
import { trackRequest } from './track-request';

@Injectable()
export class RequestStateService {
  public trackRequest<T>(callback: () => Observable<T>): Observable<RequestState<T>> {
    return trackRequest(callback);
  }
}
