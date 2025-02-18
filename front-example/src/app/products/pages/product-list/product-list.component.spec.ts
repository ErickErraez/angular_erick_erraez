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
      getProducts: jest.fn(),
      deleteProduct: jest.fn(),
    };

    await TestBed.configureTestingModule({
      // Para componentes standalone, importamos el componente directamente
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
    const mockProducts: Product[] = [
      { id: '1', name: 'Prod1', description: 'Desc1', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
      { id: '2', name: 'Prod2', description: 'Desc2', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
    ];
    productServiceMock.getProducts.mockReturnValue(of({ data: mockProducts }));

    component.loadProducts();

    expect(productServiceMock.getProducts).toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
    expect(component.products.length).toBe(2);
    expect(component.filteredProducts.length).toBe(2);
    expect(component.message).toBeNull();
    expect(component.isError).toBeFalsy();
  });

  it('debería manejar error si loadProducts falla', () => {
    productServiceMock.getProducts.mockReturnValue(throwError('Error simulado'));

    component.loadProducts();

    expect(component.isLoading).toBeFalsy();
    expect(component.isError).toBeTruthy();
    expect(component.message).toBe('No se pudieron cargar los productos. Intente más tarde.');
  });

  it('applyFilter() sin texto debe resetear filteredProducts', () => {
    component.products = [
      { id: '1', name: 'Prod1', description: 'Desc1', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
      { id: '2', name: 'Prod2', description: 'Desc2', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
    ];
    component.searchText = '';
    component.applyFilter();
    expect(component.filteredProducts.length).toBe(2);
  });

  it('applyFilter() con texto debe filtrar', () => {
    component.products = [
      { id: '1', name: 'Prod1', description: 'Alpha', logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
      { id: '2', name: 'Prod2', description: 'Beta',  logo: '', date_release: '2025-01-01', date_revision: '2026-01-01' },
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
    component.selectedProduct = { id: '1', name: 'Test', logo: '', description: '', date_release: '', date_revision: '' } as Product;
    component.products = [component.selectedProduct, { id: '2', name: 'Prod2', logo: '', description: '', date_release: '', date_revision: '' } as Product];
    productServiceMock.deleteProduct.mockReturnValue(of({ message: null }));

    component.onConfirmDelete();

    expect(productServiceMock.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.products.length).toBe(1);
    expect(component.message).toBeNull();
  });

  it('onConfirmDelete() debe manejar error', () => {
    component.selectedProduct = { id: '1', name: 'Test', logo: '', description: '', date_release: '', date_revision: '' } as Product;
    component.products = [component.selectedProduct];
    productServiceMock.deleteProduct.mockReturnValue(throwError('Error x'));

    component.onConfirmDelete();

    expect(component.isError).toBeTruthy();
    expect(component.message).toContain('Error al eliminar el producto');
    expect(component.showModal).toBeFalsy();
  });

  it('onCancelDelete() debe cerrar modal sin eliminar', () => {
    component.showModal = true;
    component.onCancelDelete();
    expect(component.showModal).toBeFalsy();
  });

  it('toggleDropdown() debe alternar valor en isDropdownOpen[index]', () => {
    component.isDropdownOpen = [false, false];
    component.toggleDropdown(0);
    expect(component.isDropdownOpen[0]).toBeTruthy();
    component.toggleDropdown(0);
    expect(component.isDropdownOpen[0]).toBeFalsy();
  });
});
