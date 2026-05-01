import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  public year: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void { }
}