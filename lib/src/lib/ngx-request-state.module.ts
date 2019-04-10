import { NgModule, ModuleWithProviders } from '@angular/core';
import { RequestStateService } from './request-state.service';

@NgModule({})
export class NgxRequestStateModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxRequestStateModule,
      providers: [RequestStateService]
    };
  }
}
