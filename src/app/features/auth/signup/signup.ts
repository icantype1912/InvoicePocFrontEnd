import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  email: string = '';
  password: string = ''
  confirmPassword: string = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  signup() {
    this.auth.signup({
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (res) => {
        console.log('Signup success', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        if (err.status === 400) {
          alert('Not Valid');
        }
      }
    });
  }
}