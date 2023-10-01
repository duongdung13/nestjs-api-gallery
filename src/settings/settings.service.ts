import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectModel as NestInjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SettingsService {
  constructor(
    @NestInjectModel(Setting.name)
    private settingModel: SoftDeleteModel<SettingDocument>,
  ) {}

  async getSettingByName(key_name: string) {
    let setting = await this.settingModel.findOne({ key_name: key_name });
    return setting;
  }

  async create(createSettingDto: CreateSettingDto) {
    let setting = await this.settingModel.create(createSettingDto);
    console.log('>>> setting create ', setting);
    return {
      _id: setting._id,
    };
  }

  async findOne(id: string) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) return `Not found Setting`;

    let user = await this.settingModel.findOne({ _id: id });
    return user;
  }

  async update(updateSettingDto: UpdateSettingDto) {
    return await this.settingModel.updateOne(
      {
        _id: updateSettingDto._id,
      },
      {
        ...updateSettingDto,
      },
    );
  }
}
