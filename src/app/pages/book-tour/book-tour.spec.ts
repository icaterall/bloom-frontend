import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTour } from './book-tour';

describe('BookTour', () => {
  let component: BookTour;
  let fixture: ComponentFixture<BookTour>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTour]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookTour);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
