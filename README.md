# ngx-request-state

An easy, reactive way to track the status of your API requests.  It makes it easy to implement a "retry button" for failures.

## Installation

`yarn add ngx-request-state` or `npm install ngx-request-state`

## Setup

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

## Motivation

Lots of components implement the same 3 states:

* Loading
* Error with retry button
* Loaded

Tracking the request status (loading, error, loaded) and implementing retry requires a lot of boilerplate code.

## Usage

There's a full example in the [Example App](https://github.com/brianmcd/ngx-request-state/tree/master/projects/example-app/src/app), but here's an overview of how it looks in practice.

`ngx-request-state` comes with a `RequestStateService`.  The `RequestStateService`'s `createRequest` method takes an HTTP request `Observable` (like one returned from Angular's `HttpClient`) and returns an `Observable` that tracks the request state for you.

The returned `Observable` emits `RequestState` interface objects whenever the state changes, where `RequestState` is:

```typescript
interface RequestState<T> {
  // The result from a successful call, or null.
  result: T | null;

  // true while a the request is in-flight.
  isLoading: boolean;

  // The error object emitted in case of an error.
  error: any;

  // Calling this method will retry a failed error request.
  // Useful for retry buttons.
  retry: () => void;
}
```

```typescript
@Injectable()
export class WidgetService {
  constructor(private readonly requestStateService: RequestStateService) {}

  public fetch(id: number): Observable<RequestState<Widget>> {
    return this.requestStateService.createRequest(() => {
      return this.httpClient.get(`/widgets/${id}`);
    });
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
  <div *ngIf="request.error as error">
    <h1>Error: {{ error.message }}</h1>
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
