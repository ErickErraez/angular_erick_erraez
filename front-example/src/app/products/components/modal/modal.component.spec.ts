import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir confirm al llamar onConfirm()', () => {
    spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('debería emitir cancel al llamar onCancel()', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('debería mostrar message en plantilla', () => {
    component.title = 'Eliminar producto'; // ¡Clave!
    component.message = 'Producto XYZ';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const question = compiled.querySelector('.modal-question')?.textContent;
    expect(question).toContain('¿Estás seguro de eliminar');
    expect(question).toContain('Producto XYZ');
  });
});
