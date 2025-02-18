import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../core/services/product.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockProductService = {
      addProduct: jasmine.createSpy('addProduct'),
      updateProduct: jasmine.createSpy('updateProduct'),
      verifyProductId: jasmine
        .createSpy('verifyProductId')
        .and.returnValue(of(false)),
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    mockActivatedRoute = {
      // Simula que no hay :id en la ruta => modo creación
      params: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ProductFormComponent, // standalone
      ],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario en modo creación (isEditMode = false)', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.productForm).toBeDefined();
    // Campo ID habilitado
    expect(component.productForm.get('id')?.disabled).toBeFalse();
  });

  it('submit() con formulario inválido no llama servicio', () => {
    // Forzamos el formulario a ser inválido
    component.productForm.patchValue({
      id: '', // Requerido
      name: 'abc', // minLength(5)
      description: '', // requerido
      logo: '',
      date_release: '',
    });

    component.onSubmit();
    // No se debería llamar a add ni update
    expect(mockProductService.addProduct).not.toHaveBeenCalled();
    expect(mockProductService.updateProduct).not.toHaveBeenCalled();
  });

  it('submit() en modo creación debe llamar addProduct', () => {
    // Llenamos datos válidos
    component.productForm.patchValue({
      id: 'PROD1',
      name: 'Producto largo',
      description: 'desc con más de 10 caracteres',
      logo: 'some-logo.jpg',
      date_release: '2025-02-18', // fecha futura
    });
    component.isEditMode = false;

    mockProductService.addProduct.and.returnValue(of({ message: 'Creado ok' }));
    component.onSubmit();

    expect(mockProductService.addProduct).toHaveBeenCalled();
    expect(component.isError).toBeFalse();
    expect(component.message).toBe('Creado ok');
    // Debería navegar tras 1s => no testeamos el setTimeout,
    // pero podríamos si quisiéramos usar fakeAsync/tick
  });

  it('submit() en modo edición llama a updateProduct', () => {
    component.isEditMode = true;
    component.productId = '123'; // la ruta simula { id: '123' }
    component.productForm.patchValue({
      id: 'NO-EDIT', // Deshabilitado, no se pasa en getRawValue
      name: 'Producto Edit',
      description: 'desc con más de 10 caracteres',
      logo: 'some-logo.jpg',
      date_release: '2025-02-18',
    });

    mockProductService.updateProduct.and.returnValue(
      of({ message: 'Actualizado ok' })
    );
    component.onSubmit();

    expect(mockProductService.updateProduct).toHaveBeenCalledWith(
      '123',
      jasmine.any(Object)
    );
    expect(component.isError).toBeFalse();
    expect(component.message).toBe('Actualizado ok');
  });

  it('debería manejar error en updateProduct', () => {
    component.isEditMode = true;
    component.productId = '123';
    component.productForm.patchValue({
      name: 'Producto Edit',
      description: 'desc con más de 10 caracteres',
      logo: 'some-logo.jpg',
      date_release: '2025-02-18',
    });
    mockProductService.updateProduct.and.returnValue(
      throwError('Error simulado')
    );

    component.onSubmit();
    expect(component.isError).toBeFalse();
    expect(component.message).toBeNull();
  });

  it('onReset() en modo creación debe resetear formulario', () => {
    component.isEditMode = false;
    component.productForm.patchValue({
      id: 'AAA',
      name: 'Nombre',
      description: 'Desc',
      logo: 'logo.jpg',
      date_release: '2025-01-01',
    });

    component.onReset();
    // Angular reset => cada control vuelve a null (por defecto)
    expect(component.productForm.value.id).toBeNull();
    expect(component.productForm.value.name).toBeNull();
  });

  it('onReset() en modo edición navega a /products/add', () => {
    component.isEditMode = true;
    component.onReset();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/add']);
  });

  it('debería recalcular date_revision cuando cambia date_release', () => {
    const dateReleaseCtrl = component.productForm.get('date_release');
    const dateRevisionCtrl = component.productForm.get('date_revision');

    dateReleaseCtrl?.setValue('2025-02-18');
    fixture.detectChanges();
    // Esperamos que date_revision sea un año después => 2026-02-18
    const revValue = dateRevisionCtrl?.value;
    expect(revValue).toBe('2026-02-18');
  });

  it('Validador dateValidator: date_release < hoy => invalidReleaseDate', () => {
    const today = new Date();
    const past = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
    );
    const isoPast = past.toISOString().split('T')[0];

    component.productForm.patchValue({
      date_release: isoPast,
      date_revision: isoPast,
    });

    // Forzamos la validación
    const errors = component.productForm.errors;
    expect(errors?.['invalidReleaseDate']).toBeTrue();
  });
});
