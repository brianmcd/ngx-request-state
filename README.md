# ngx-request-state

An RxJS operator that provides an easy way to track the status (loading, error, success) of your API requests, along with easy retry for failures.

## Installation

`yarn add ngx-request-state` or `npm install ngx-request-state`

## Motivation

Lots of components implement the same 3 states:

* Loading
* Error with retry button
* Loaded

Tracking the request status (loading, error, loaded) and implementing retry requires a lot of boilerplate code for each request.

## Usage

There's a full example in the [Example App](https://github.com/brianmcd/ngx-request-state/tree/master/projects/example-app/src/app), but here's an overview of how it works in practice.

`ngx-request-state` exports a `trackRequest` operator that turns your stream into a stream of `RequestState`s:

```typescript
interface RequestState<T> {
  // The result from a successful call, or null.
  result: T | null;

  // true while a the request is in-flight.
  isLoading: boolean;

  // true if the request failed.
  hasError: boolean;

  // The error object emitted in case of an error.
  error: any;

  // Calling this method will retry a failed error request.
  // Useful for retry buttons.
  retry: () => void;
}
```

#### Example

```typescript
import { trackRequest } from 'ngx-request-state';

@Injectable()
export class WidgetService {
  public fetch(id: number): Observable<RequestState<Widget>> {
    return this.httpClient.get(`/widgets/${id}`)).pipe(trackRequest());
  }
}
```

```typescript
@Component({
  ...
})
export class WidgetComponent {
  public request$ = this.activatedRoute.params.pipe(
    switchMap((params) => this.widgetService.fetch(params.id))
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private widgetService: WidgetService
  ) {}
}
```

```html
<ng-container *ngIf="(request$ | async) as request">
  <div *ngIf="request.hasError">
    <h1>Error: {{ request.error.message }}</h1>
    <button (click)="request.retry()">Retry</button>
  </div>

  <div *ngIf="request.isLoading">
    <h1>Loading...</h1>
  </div>

  <div *ngIf="request.result as widget">
    <h1>{{ widget.name }}</h1>
  </div>
</ng-container>
```

Note that we can retry the request by calling `retry()` on the `RequestState`.

## An Important Note About Observable Completion

Since this library emits multiple values and allows retry, the completion semantics are different than Angular's `HttpClient` observables.  Requests wrapped in `trackRequest` will *not* automatically complete after a sucess or failure.
This means that you should:
* Use the async pipe or unsubscribe from the requests when your component is destroyed, which is a good idea even with Angular's observables due to the possibility of slow requests completing after your component is destroyed.
* Make sure you `filter` and `take(1)` in any route guards that use wrapped requests.
