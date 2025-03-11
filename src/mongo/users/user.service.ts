import { Model } from 'mongoose';
import {
  Injectable,
  Dependencies,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { getModelToken, InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { UpsertUserDto } from '../dto/upsert-user.dto';
import { supportedServicesData } from 'src/utils/data';

@Injectable()
@Dependencies(getModelToken(User.name))
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
    this.userModel = userModel;
  }

  async upsertUser(upsertUserDto: UpsertUserDto): Promise<void> {
    try {
      const arrayName = this.getArrayFieldName(
        upsertUserDto.postScreenshotData.service,
      );
      await this.userModel.findOneAndUpdate(
        { discordId: upsertUserDto.discordId },
        { $push: { [arrayName]: upsertUserDto.postScreenshotData } },
        { upsert: true, new: true },
      );
      return;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error saving screenshot data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getArrayFieldName(service: string): string {
    return supportedServicesData[service].dbArrayFieldName;
  }
}
