import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule, MatButtonModule],
  standalone: true,
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  @Input() icon = 'inbox';
  @Input() title = 'No results found';
  @Input() message = 'There are no elements to show.';
  @Input() actionLabel?: string;

}
