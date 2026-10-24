import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  /*templateUrl: './app.html',*/
  template: `<router-outlet/>`,
})
export class App {
  protected readonly title = signal('AcademicHub-FrontEnd');
}
