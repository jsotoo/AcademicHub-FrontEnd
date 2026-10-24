import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiServiceFactory } from './api-service-factory';
import { isPlatformBrowser } from '@angular/common';
import { API_ROUTES } from '../constants/api-routes.constants';
import { ApiResult, CurrentUser, LoginRequest, LoginResponse, Role } from '../models/auth.model';
import { map, Observable, tap } from 'rxjs';

const SESSION_KEY = 'session';
const TOKEN_KEY = 'token';

@Service()
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly factory = inject(ApiServiceFactory);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);
    private readonly loginEndpoint = this.factory.create(API_ROUTES.AUTH.LOGIN).url;
    private readonly _currentUser = signal<CurrentUser | null>(this.loadFromSessionStorage());

    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly isAdmin = computed(() => this.hasRole('admin'));

    login(request: LoginRequest): Observable<CurrentUser> {
        return this.http
            .post<ApiResult<LoginResponse>>(this.loginEndpoint, request)
            .pipe(
                map((result) => {
                    const data = result.value!;
                    const user: CurrentUser = {
                        userName: request.userName,
                        role: this.resolveRole(data.role, data.token),
                        token: data.token,
                        expiresAt: data.expirationDate
                    }
                    return user;
                }),
                tap((user) => this.setSession(user))
            )
    }


    logout(): void {
        this._currentUser.set(null);
        const storage = this.getSessionStorage();
        if (storage) {
            storage.removeItem(SESSION_KEY);
            storage.removeItem(TOKEN_KEY);
        }
    }

    isAuthenticated(): boolean {
        return this._currentUser() !== null || this.token() !== null;
    }

    hasRole(role: Role): boolean {
        return this.currentUser()?.role === role;
    }

    homeRoute(): string {
        return this.hasRole('student') ? '/my-enrollment' : '/dashboard';
    }

    token(): string | null {
        const tokenFromSignal = this._currentUser()?.token;
        if(tokenFromSignal) {
            return tokenFromSignal;
        }
        const tokenFromStorage = this.getSessionStorage()?.getItem(TOKEN_KEY);
        return tokenFromStorage?.trim() ? tokenFromStorage : null;
      
    }

    private setSession(user: CurrentUser) {
        this._currentUser.set(user);
        const storage = this.getSessionStorage();
        if (storage) {
            storage.setItem(SESSION_KEY, JSON.stringify(user));
            storage.setItem(TOKEN_KEY, user.token);
        }
    }

    private loadFromSessionStorage(): CurrentUser | null {
        const sessionStorage = this.getSessionStorage();
        if (sessionStorage) {
            const sessionData = sessionStorage.getItem(SESSION_KEY);
            if (sessionData) {
                const stored = JSON.parse(sessionData) as CurrentUser;
                const role = this.resolveRole(stored.role, stored.token);
                return { ...stored, role };
            }

        }
        return null;
    }

    private resolveRole(role: string | null | undefined, token?: string | null): Role {
        return this.asRole(role) ?? this.roleFromToken(token) ?? 'student';
    }

    private asRole(value: string | null | undefined): Role | null {
        const role = value?.trim().toLowerCase();
        if (role === 'admin' || role === 'teacher' || role === 'student') {
            return role;
        }
        return null;
    }

    private roleFromToken(token: string | null | undefined): Role | null {
        if (!token) {
            return null;
        }

        try {
            const payload = token.split('.')[1];
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            const claims = JSON.parse(json) as Record<string, unknown>;
            const claim = claims['role']
                ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            return typeof claim === 'string' ? this.asRole(claim) : null;
        } catch {
            return null;
        }
    }

    private getSessionStorage(): Storage | null {
        if (!this.isBrowser || typeof sessionStorage === 'undefined') {
            return null;
        }
        return sessionStorage;
    }

}
