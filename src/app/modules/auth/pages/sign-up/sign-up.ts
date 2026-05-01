import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, RouterLink, AngularSvgIconModule, Button],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp implements OnInit {
  ngOnInit(): void { }
}