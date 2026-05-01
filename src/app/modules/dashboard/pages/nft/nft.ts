import { Component, OnInit } from '@angular/core';

export class NftModel {
  id: any;
  title: any;
  last_bid?: any;
  price: any;
  creator?: any;
  avatar?: any;
  instant_price?: any;
  ending_in?: any;
  image: any;
}

@Component({
  selector: 'app-nft',
  standalone: true,
  imports: [],
  templateUrl: './nft.html',
  styleUrl: './nft.css',
})
export class Nft implements OnInit {
  nft: Array<NftModel>;

  constructor() {
    this.nft = [
      {
        id: 34356771,
        title: 'Girls of the Cartoon Universe',
        creator: 'Jhon Doe',
        instant_price: 4.2,
        price: 187.47,
        ending_in: '06h 52m 47s',
        last_bid: 0.12,
        image: './assets/images/img-01.jpg',
        avatar: './assets/avatars/avt-01.jpg',
      },
      {
        id: 34356772,
        title: 'Pupaks',
        price: 548.79,
        last_bid: 0.35,
        image: './assets/images/img-02.jpg',
      },
      {
        id: 34356773,
        title: 'Seeing Green collection',
        price: 234.88,
        last_bid: 0.15,
        image: './assets/images/img-03.jpg',
      },
    ];
  }

  ngOnInit(): void { }
}