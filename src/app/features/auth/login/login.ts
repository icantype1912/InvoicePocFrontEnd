import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(
  private auth: Auth,
  private router: Router
) {}

  email = '';
  password = '';

  login() {
  console.log('Login method called');
  console.log('Email:', this.email);
  console.log('Password:', this.password);
  
  this.auth.login({
    email: this.email,
    password: this.password,
  }).subscribe({
    next: (res) => {
      console.log('Login success', res);
      this.auth.setToken(res.accessToken);
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
        console.error('Login failed', err);

        if (err.status === 400) {
          alert('Invalid email or password');
        }
      }

  });
}

}
