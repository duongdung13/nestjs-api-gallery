import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromptDocument = HydratedDocument<Prompt>;

@Schema({ timestamps: true })
export class Prompt {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  prompt_id: string;

  @Prop({ required: true })
  prompt: string;

  @Prop()
  dimension: string;

  @Prop()
  timestamp: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt);
