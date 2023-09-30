import { IsNotEmpty } from 'class-validator';

export class CreateImageDto {
  @IsNotEmpty({
    message: 'Url khong duoc de trong',
  })
  url: string;

  @IsNotEmpty({
    message: 'Name khong duoc de trong',
  })
  name: string;

  image_id: string;

  @IsNotEmpty({
    message: 'Prompt khong duoc de trong',
  })
  prompt: string;

  dimension: string;
  timestamp: string;
}
