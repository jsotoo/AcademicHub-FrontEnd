import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { Role } from "../models/auth.model";

export const roleGuard = (requiredRole: Role): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(requiredRole)) {
        return true;
    }

    return router.createUrlTree(['/403']);
}