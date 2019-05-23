import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { WidgetComponent } from './widget/widget.component';

const routes: Routes = [
  {
    path: 'widgets/:id',
    component: WidgetComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'widgets/1'
  }
];

@NgModule({
  declarations: [AppComponent, WidgetComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
