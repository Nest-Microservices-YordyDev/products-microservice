import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
    // throw new Error('Method not implemented.');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPage = await this.product.count( {where : {available:true}});

    const lastPage = Math.ceil(totalPage / limit);

    console.log(totalPage);

    return {
      data: this.product.findMany({
        skip: (page - 1) * limit, //esto es para saber desde que registro comenzará
        take: limit, //limite de items por page
        where:{available:true}
      }),
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const productSearch: Product = await this.product.findFirst({
      where: { id: id, available:true },
    });

    if (!productSearch)
      throw new NotFoundException(`Not found product with id ${id}`);

    return productSearch;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id: __, ...data}= updateProductDto;

    await this.findOne(id);

    if (Object.keys(updateProductDto).length === 0)
      throw new BadRequestException(`Body Request Void`);

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: {id},
      data:{
        available: false
      }
    })
    return product;
    // return this.product.delete({
    //   where: { id },
    // })
    ;
  }
}
