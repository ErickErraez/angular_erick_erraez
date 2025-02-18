import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../core/services/product.service';
import { of, throwError } from 'rxjs';
import { Product } from '../../../core/models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: any;

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jasmine.createSpy('getProducts'),
      deleteProduct: jasmine.createSpy('deleteProduct'),
    };

    await TestBed.configureTestingModule({
      // En Angular 14+ con standalone, debes importar el componente en imports
      imports: [ProductListComponent],
      providers: [{ provide: ProductService, useValue: productServiceMock }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar productos en loadProducts()', () => {
    const mockProducts = [
      { id: '1', name: 'Prod1', description: 'Desc1' } as Product,
      { id: '2', name: 'Prod2', description: 'Desc2' } as Product,
    ];
    productServiceMock.getProducts.and.returnValue(of({ data: mockProducts }));

    component.loadProducts();

    expect(productServiceMock.getProducts).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
    expect(component.message).toBeNull();
    expect(component.isError).toBeFalse();
  });

  it('debería manejar error si loadProducts falla', () => {
    productServiceMock.getProducts.and.returnValue(
      throwError('Error simulado')
    );

    component.loadProducts();

    expect(component.isLoading).toBeFalse();
    expect(component.isError).toBeTrue();
    expect(component.message).toBe(
      'No se pudieron cargar los productos. Intente más tarde.'
    );
  });

  it('applyFilter() sin texto debe resetear filteredProducts', () => {
    component.products = [
      { id: '1', name: 'Prod1', description: 'Desc1' } as Product,
      { id: '2', name: 'Prod2', description: 'Desc2' } as Product,
    ];
    component.searchText = '';
    component.applyFilter();
    expect(component.filteredProducts.length).toBe(2);
  });

  it('applyFilter() con texto debe filtrar', () => {
    component.products = [
      { id: '1', name: 'Prod1', description: 'Alpha' } as Product,
      { id: '2', name: 'Prod2', description: 'Beta' } as Product,
    ];
    component.searchText = 'alpha';
    component.applyFilter();
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('1');
  });

  it('onRecordsChange() debe cambiar el recordsPerPage', () => {
    component.onRecordsChange('10');
    expect(component.recordsPerPage).toBe(10);
  });

  it('debería eliminar producto en onConfirmDelete()', () => {
    component.selectedProduct = { id: '1', name: 'Test' } as Product;
    component.products = [component.selectedProduct, { id: '2' } as Product];
    productServiceMock.deleteProduct.and.returnValue(of({ message: null }));

    component.onConfirmDelete();

    expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.products.length).toBe(1);
    expect(component.message).toBeNull(); // res.message || null
  });

  it('onConfirmDelete() debe manejar error', () => {
    component.selectedProduct = { id: '1', name: 'Test' } as Product;
    component.products = [component.selectedProduct];
    productServiceMock.deleteProduct.and.returnValue(throwError('Error x'));

    component.onConfirmDelete();

    expect(component.isError).toBeTrue();
    expect(component.message).toContain('Error al eliminar el producto');
    expect(component.showModal).toBeFalse();
  });

  it('onCancelDelete() debe cerrar modal sin eliminar', () => {
    component.showModal = true;
    component.onCancelDelete();
    expect(component.showModal).toBeFalse();
  });

  it('toggleDropdown() debe alternar valor en isDropdownOpen[index]', () => {
    component.isDropdownOpen = [false, false];
    component.toggleDropdown(0);
    expect(component.isDropdownOpen[0]).toBeTrue();
    component.toggleDropdown(0);
    expect(component.isDropdownOpen[0]).toBeFalse();
  });
});
