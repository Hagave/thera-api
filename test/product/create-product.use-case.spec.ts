import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { ProductAlreadyExistsException } from '@domain/product/exceptions/product-already-exists.exception';
import { CreateProductUseCase } from '@application/usecases/product/create/create-product.use-case';
import { InMemoryProductRepository } from '@infrastructure/repositories/in-memory/in-memory.product.repository';

let productRepository: InMemoryProductRepository;
let useCase: CreateProductUseCase;

beforeEach(() => {
  productRepository = new InMemoryProductRepository();
  useCase = new CreateProductUseCase(productRepository);
});

describe('CreateProductUseCase', () => {
  it('should create a product successfully', async () => {
    const input = {
      name: 'Produto Teste',
      category: 'Categoria A',
      description: 'Descrição',
      price: 100,
      stock: 10,
    };

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.category).toBe(input.category);
    expect(result.price).toBe(input.price);
    expect(result.stock).toBe(input.stock);
  });

  it('should throw when product already exists', async () => {
    const input = {
      name: 'Produto Duplicado',
      category: 'Categoria B',
      description: 'Descrição',
      price: 50,
      stock: 5,
    };

    await useCase.execute(input);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(ProductAlreadyExistsException);
  });

  it('should throw when price is zero or negative', async () => {
    await expect(
      useCase.execute({
        name: 'Produto Preço Inválido',
        category: 'Categoria C',
        description: '',
        price: 0,
        stock: 5,
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw when stock is negative', async () => {
    await expect(
      useCase.execute({
        name: 'Produto Estoque Negativo',
        category: 'Categoria C',
        description: '',
        price: 100,
        stock: -1,
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });
});
