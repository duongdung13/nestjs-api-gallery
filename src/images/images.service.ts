import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ImagesService {
  constructor(
    @NestInjectModel(Image.name)
    private imageModel: SoftDeleteModel<ImageDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);

    return hashSync(password, salt);
  };

  async create(createImageDto: CreateImageDto) {
    let image = await this.imageModel.create(createImageDto);

    return {
      _id: image._id,
      createdAt: image.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.imageModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.imageModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) return `Not found image`;

    let image = await this.imageModel.findOne({ _id: id });
    return image;
  }
}
