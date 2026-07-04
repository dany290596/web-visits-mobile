import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MessageService } from 'primeng/api';

import { AccountService } from '../protected/account/services/account.service';

@Component({
  selector: 'app-account',
  imports: [
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './account.html',
  styleUrl: './account.css',
  providers: [MessageService]
})
export class Account {
  private srvAccount = inject(AccountService);

  accountData: any | null = null;

  ngOnInit(): void {
    this.accountInfo();
  }

  accountInfo() {
    this.srvAccount.getAccountInfo().subscribe((resp: any) => {
      if (resp.respuesta === true) {
        this.accountData = resp.data;
        console.log('DATA ::: ', JSON.stringify(resp.data));
      }
    });
  }
}