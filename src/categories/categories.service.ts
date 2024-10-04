import { Injectable } from '@nestjs/common';
import { CategoryRepository } from './categories.repository';
import { CategoryListDto } from './dto/categories.dto';
import { CategoryData } from './type/categories-data.type';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAllCategories(): Promise<CategoryListDto> {
    const categories: CategoryData[] = await this.categoryRepository.findAllCategories();

    return CategoryListDto.from(categories);
  }
}