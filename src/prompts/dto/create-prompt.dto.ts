import { IsNotEmpty } from 'class-validator';

export class CreatePromptDto {
  @IsNotEmpty({
    message: 'Url khong duoc de trong',
  })
  url: string;

  @IsNotEmpty({
    message: 'Name khong duoc de trong',
  })
  name: string;

  prompt_id: string;

  @IsNotEmpty({
    message: 'Prompt khong duoc de trong',
  })
  prompt: string;

  dimension: string;
  timestamp: string;
}
