import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAssistantComponent } from './ai-assistant';

describe('AiAssistantComponent', () => {
  let component: AiAssistantComponent;
  let fixture: ComponentFixture<AiAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAssistantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistantComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
