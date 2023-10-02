import { IsNotEmpty } from 'class-validator';
export class UpdateSettingDto {
  @IsNotEmpty({
    message: '_id khong duoc de trong',
  })
  _id: string;
}
