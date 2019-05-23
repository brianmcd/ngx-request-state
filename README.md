# ngx-request-state

An easy, reactive way to track the status (loading, error, success) of your API requests, along with easy retry for failures.

## Installation

`yarn add ngx-request-state` or `npm install ngx-request-state`

## Setup

There are 2 ways to use this library: import the `trackRequest` function or use the `RequestStateService`.

#### Option 1:

```typescript
import { trackRequest } from 'ngx-request-state';
```

#### Option 2:

If you want to inject a service so you can mock it out during tests, you can use the `RequestStateService`.

Import the `NgxRequestStateModule` inside your `AppModule`:

```typescript
import { NgxRequestStateModule } from 'ngx-request-state';

@NgModule({
  declarations: [...],
  imports: [NgxRequestStateModule.forRoot()],
  providers: [...],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

Then inject `RequestStateService` wherever you'd like.

## Motivation

Lots of components implement the same 3 states:

* Loading
* Error with retry button
* Loaded

Tracking the request status (loading, error, loaded) and implementing retry requires a lot of boilerplate code for each request.

## Usage

There's a full example in the [Example App](https://github.com/brianmcd/ngx-request-state/tree/master/projects/example-app/src/app), but here's an overview of how it looks in practice.

`ngx-request-state` exposes a `trackRequest` function, either by itself or in a service. `trackRequest` takes an HTTP request `Observable` (like one returned from Angular's `HttpClient`) and returns an `Observable` that tracks the request state for you.

The returned `Observable` emits `RequestState` interface objects whenever the state changes, where `RequestState` is:

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

## An Important Note About Observable Completion

Since this library emits multiple values and allows retry, the completion semantics are different than Angular's `HttpClient` observables.  Requests wrapped in `trackRequest` will *not* automatically complete after a sucess or failure.
This means that you should:
* Unsubscribe from the requests when your component is destroyed, which is a good idea even with Angular's observables due to the possibility of slow requests completing after your component is destroyed.  If you're using the `async` pipe, you don't have to worry about this.
* Make sure you `filter` and `take(1)` in any route guards that use wrapped requests.

Example guard:

```typescript
@Injectable()
export class FetchWidgetGuard implements CanActivate {
  constructor(private readonly widgetService: WidgetService) {}

  public canActivate(): Observable<boolean> {
    return this.widgetService.fetch().pipe(
      // Wait until the request succeeds or fails.
      filter((request) => !request.isLoading),
      // If the request fails, emit `false`, otherwise, `true`.
      map((request) => !request.hasError),
      // The wrapped Observable won't automatically complete, so we have to do it.
      take(1)
    );
  }
}
```


#### Example

```typescript
import { trackRequest } from 'ngx-request-state';

@Injectable()
export class WidgetService {
  public fetch(id: number): Observable<RequestState<Widget>> {
    return trackRequest(() => this.httpClient.get(`/widgets/${id}`));
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
