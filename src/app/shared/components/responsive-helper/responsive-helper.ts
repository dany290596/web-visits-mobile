import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-responsive-helper',
  imports: [],
  templateUrl: './responsive-helper.html',
  styleUrl: './responsive-helper.css',
})
export class ResponsiveHelper implements OnInit {
  public env: any = environment;

  ngOnInit(): void { }
}