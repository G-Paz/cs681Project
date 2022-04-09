import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindGameComponent } from './find-game.component';

describe('FindGameComponent', () => {
  let component: FindGameComponent;
  let fixture: ComponentFixture<FindGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
