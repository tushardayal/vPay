import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MakerCheckerDetailsComponent } from './maker-checker-details.component';

describe('MakerCheckerDetailsComponent', () => {
  let component: MakerCheckerDetailsComponent;
  let fixture: ComponentFixture<MakerCheckerDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakerCheckerDetailsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MakerCheckerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
