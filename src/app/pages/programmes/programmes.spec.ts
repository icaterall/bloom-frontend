import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Programmes } from './programmes';

describe('Programmes', () => {
  let component: Programmes;
  let fixture: ComponentFixture<Programmes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Programmes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Programmes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
