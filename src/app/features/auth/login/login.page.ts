import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedMaterialModule } from '../../../shared/shared-material.module';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  standalone: true,
  selector: 'app-login.page',
  styleUrl: './login.page.scss',
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  form = this.formBuilder.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = false;
  hidePassword = true;
  sessionExpiredMessage = false;

  ngOnInit(): void {
    //Detectar redirección por sesión expirada (authInterceptor)
    this.route.queryParams.subscribe(params => {
      this.sessionExpiredMessage = params['expired'] === 'true';
    });

    //si ya está autenticado, redigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.authService.homeRoute()]);
    }

  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const { userName, password } = this.form.value;
    this.authService.login({userName: userName!, password: password!}).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.authService.homeRoute()]);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const message =
          err.status === 400 || err.status === 401 ? 'Usuario o contraseña incorrectos' : 'Error al iniciar sesión';
        this.notificationService.error(message);
      }
    });
  }




}
