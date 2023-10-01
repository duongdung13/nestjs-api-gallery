import { SettingsService } from './../settings/settings.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose';
import { Image, ImageDocument } from './schemas/image.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LEXICA_CRAWL_CURSOR } from 'src/common/const';
import * as superagent from 'superagent';
import { parseNested } from 'src/common/function';
import * as mongoose from 'mongoose';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @NestInjectModel(Image.name)
    private readonly imageModel: SoftDeleteModel<ImageDocument>,
    private readonly settingsService: SettingsService,
  ) {}

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

  @Cron(CronExpression.EVERY_10_MINUTES)
  async cronCrawlLexica() {
    this.logger.debug('>>> Start crawl lexica.art');

    const { CRAWL_CURSOR } = LEXICA_CRAWL_CURSOR;
    const crawlCursor = await this.settingsService.getSettingByName(
      CRAWL_CURSOR,
    );
    console.log('>>> crawlCursor', crawlCursor);

    const response = await superagent
      .post(`https://lexica.art/api/infinite-prompts`)
      .set(
        'Cookie',
        '__Host-next-auth.csrf-token=d412928e6269b3a60908aea274f560a305696dbf9291a0e0f98ac75b08009447%7C12a74b05d79bd3ccc66d7f8b7051d05cff35af4dfc3894df47c29da188c651cc; __Secure-next-auth.callback-url=https%3A%2F%2Flexica.art',
      )
      .set('content-type', 'application/json')
      .send({
        text: '',
        searchMode: 'images',
        source: 'search',
        cursor: 1734,
        model: 'lexica-aperture-v2',
      });
    console.log('>> response ', response);

    console.log('>> parseNested response ', parseNested(response.text));
    //return parseNested(response.text);
  }
}
