import { computed, Directive, inject, Input, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/auth.model';

@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly auth = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly requiredRole = signal<Role | null>(null);
  private readonly visible = computed(() => {
    const role = this.requiredRole();
    return role !== null && this.auth.hasRole(role);
  });

  constructor() {
    toObservable(this.visible)
      .pipe(takeUntilDestroyed())
      .subscribe((show) => {
        this.viewContainer.clear();
        if (show) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  @Input('appHasRole') set role(requiredRole: Role) {
    this.requiredRole.set(requiredRole);
  }
}
