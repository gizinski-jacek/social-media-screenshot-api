import { Model } from 'mongoose';
import { Injectable, Dependencies } from '@nestjs/common';
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
    const arrayName = this.getArrayFieldName(
      upsertUserDto.postScreenshotData.service,
    );
    await this.userModel.findOneAndUpdate(
      { discordId: upsertUserDto.discordId },
      { $push: { [arrayName]: upsertUserDto.postScreenshotData } },
      { upsert: true, new: true },
    );
    return;
  }

  getArrayFieldName(service: string): string {
    return supportedServicesData[service].dbArrayFieldName;
  }
}
