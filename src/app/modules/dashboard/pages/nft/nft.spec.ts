import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nft } from './nft';

describe('Nft', () => {
  let component: Nft;
  let fixture: ComponentFixture<Nft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nft],
    }).compileComponents();

    fixture = TestBed.createComponent(Nft);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
