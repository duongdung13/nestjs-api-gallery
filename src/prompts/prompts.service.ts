import { SettingsService } from '../settings/settings.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose';
import { Prompt, PromptDocument } from './schemas/prompt.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LEXICA_CRAWL_CURSOR } from 'src/common/const';
import * as superagent from 'superagent';
import { parseNested } from 'src/common/function';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PromptsService {
  private readonly logger = new Logger(PromptsService.name);

  constructor(
    @NestInjectModel(Prompt.name)
    private readonly promptModel: SoftDeleteModel<PromptDocument>,
    private readonly settingsService: SettingsService,
    private configService: ConfigService,
  ) {}

  async create(createPromptDto: CreatePromptDto) {
    let prompt = await this.promptModel.create(createPromptDto);

    return {
      _id: prompt._id,
      createdAt: prompt.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.promptModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.promptModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) return `Not found prompt`;

    let prompt = await this.promptModel.findOne({ _id: id });
    return prompt;
  }

  async findByPromptId(prompt_id: string) {
    let prompt = await this.promptModel.findOne({ prompt_id: prompt_id });
    return prompt;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cronCrawlLexica() {
    this.logger.debug('>>>>>> Start crawl lexica.art');

    const { CRAWL_CURSOR } = LEXICA_CRAWL_CURSOR;
    const crawlCursor = await this.settingsService.getSettingByName(
      CRAWL_CURSOR,
    );
    console.log('>>> cursor', crawlCursor.key_value);

    const dataCrawl = await superagent
      .post(this.configService.get<string>('LEXICA_API'))
      .set(
        'Cookie',
        '__Host-next-auth.csrf-token=' +
          this.configService.get<string>('LEXICA_TOKEN') +
          '; __Secure-next-auth.callback-url=https%3A%2F%2Flexica.art',
      )
      .set('content-type', 'application/json')
      .send({
        text: '',
        searchMode: 'images',
        source: 'search',
        cursor: +crawlCursor.key_value,
        model: 'lexica-aperture-v2',
      });

    const prompts = parseNested(dataCrawl.text);

    for (const item of prompts.prompts) {
      const existPrompt = await this.findByPromptId(item.id);
      if (!existPrompt) {
        const promptItem: CreatePromptDto = {
          url:
            this.configService.get<string>('LEXICA_BASE_IMAGE') +
            '/' +
            item.images[0]['id'],
          name: item.prompt,
          prompt_id: item.id,
          prompt: item.prompt,
          dimension: item.width + 'x' + item.height,
          timestamp: item.timestamp,
        };
        this.create(promptItem);
        this.logger.debug('>>> Save prompt id ', item.id);
      } else {
        this.logger.debug('>>> Exist prompt id ', item.id);
      }
    }

    const newCursor = +crawlCursor.key_value + 50;
    this.settingsService.updateByKeyName(CRAWL_CURSOR, newCursor.toString());

    this.logger.debug('>>>>>> Finish crawl lexica.art');
  }
}
