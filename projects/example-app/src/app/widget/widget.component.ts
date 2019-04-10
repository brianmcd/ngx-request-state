import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { WidgetService } from '../widget.service';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css']
})
export class WidgetComponent {
  public request$ = this.activatedRoute.params.pipe(
    map((params) => params.id),
    switchMap((id) => this.widgetService.fetch(id))
  );

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly widgetService: WidgetService
  ) {}

  public toggleFailure() {
    this.widgetService.simulateFailure = !this.widgetService.simulateFailure;
  }
}
