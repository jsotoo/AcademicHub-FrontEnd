import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule,MatMenuModule, MatDividerModule],
  styleUrl: './toolbar.component.scss',
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {

  @Output() menuToggle = new EventEmitter<void>();

  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  toggleMenu() {
    this.menuToggle.emit();
  }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
