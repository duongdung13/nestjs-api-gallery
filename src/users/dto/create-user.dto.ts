import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateUserDto {
  @IsNotEmpty({
    message: 'Name khong duoc de trong',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email khong dung dinh dang',
    },
  )
  @IsNotEmpty({
    message: 'Email khong duoc de trong',
  })
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty({
    message: 'Age khong duoc de trong',
  })
  age: string;

  @IsNotEmpty({
    message: 'Address khong duoc de trong',
  })
  address: string;

  gender: string;

  @IsNotEmpty({
    message: 'Role khong duoc de trong',
  })
  role: string;

  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({
    message: 'Name khong duoc de trong',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'Email khong dung dinh dang',
    },
  )
  @IsNotEmpty({
    message: 'Email khong duoc de trong',
  })
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty({
    message: 'Age khong duoc de trong',
  })
  age: string;

  gender: string;

  address: string;
}
