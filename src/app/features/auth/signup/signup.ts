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
  company: string = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  signup() {

  if (this.password !== this.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  this.auth.signup({
    email: this.email,
    password: this.password,
    companyName: this.company
  }).subscribe({
    next: () => {
      console.log('Signup success');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error('Signup failed', err);
      if (err.status === 400) {
        alert('Invalid signup data');
      }
    }
  });
}

}