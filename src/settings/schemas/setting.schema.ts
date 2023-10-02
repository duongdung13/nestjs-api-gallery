import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting {
  @Prop({ required: true })
  key_name: string;

  @Prop({ required: true })
  key_value: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
