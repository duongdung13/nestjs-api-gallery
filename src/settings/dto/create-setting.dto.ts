import { IsNotEmpty } from 'class-validator';

export class CreateSettingDto {
  @IsNotEmpty({
    message: 'Key Name khong duoc de trong',
  })
  key_name: string;

  @IsNotEmpty({
    message: 'Key Value khong duoc de trong',
  })
  key_value: string;
}
