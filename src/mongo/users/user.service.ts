import { Model } from 'mongoose';
import {
  Injectable,
  Dependencies,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { getModelToken, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { GetOrCreateUserDto } from '../dto/get-or-create-user.dto';
import { supportedServicesData } from 'src/utils/data';
import { Screenshot, ScreenshotDocument } from '../schemas/screenshot.schema';
import { ScreenshotData, UserBody } from './user.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
@Dependencies(getModelToken(User.name), CloudinaryService)
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.userModel = userModel;
  }

  async getOrCreateUser(getOrCreateUser: GetOrCreateUserDto): Promise<User> {
    try {
      const userExists = await this.userModel.findOne({
        discordId: getOrCreateUser.discordId,
      });
      if (!userExists) {
        const cloudinaryId = uuidv4();
        const newUser = await this.userModel.create({
          discordId: getOrCreateUser.discordId,
          cloudinaryId: cloudinaryId,
        });
        return newUser;
      } else {
        return userExists;
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error saving screenshot data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(upsertUserDto: UpdateUserDto): Promise<void> {
    try {
      const arrayName = this.getArrayFieldName(
        upsertUserDto.postScreenshotData.service,
      );
      await this.userModel.findOneAndUpdate(
        { discordId: upsertUserDto.discordId },
        { $push: { [arrayName]: upsertUserDto.postScreenshotData } },
        { new: true },
      );
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

  async getMostRecentScreenshot(data: UserBody): Promise<ScreenshotData> {
    const { discordId, social } = data;
    const user: User = await this.userModel.findOne({
      discordId: discordId,
    });
    let links: Screenshot[] = [];
    if (social) {
      const arrayName = this.getArrayFieldName(social);
      links = user[arrayName];
    } else {
      links = [
        ...user.blueskyScreenshots,
        ...user.facebookScreenshots,
        ...user.instagramScreenshots,
        ...user.twitterScreenshots,
      ];
    }
    if (links.length === 0) {
      throw new HttpException(
        'No screenshots found.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const newest = links.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )[0];
    return {
      url: newest.screenshotUrl,
      service: newest.service,
      userHandle: newest.userHandle,
      timestamp: newest.timestamp.toISOString(),
    };
  }

  async deleteMostRecentScreenshot(data: UserBody): Promise<ScreenshotData> {
    const { discordId, social } = data;
    const user: UserDocument = await this.userModel.findOne({
      discordId: discordId,
    });
    let links: ScreenshotDocument[] = [];
    if (social) {
      const arrayName = this.getArrayFieldName(social);
      links = user[arrayName];
    } else {
      links = [
        ...user.blueskyScreenshots,
        ...user.facebookScreenshots,
        ...user.instagramScreenshots,
        ...user.twitterScreenshots,
      ];
    }
    if (links.length === 0) {
      throw new HttpException(
        'No screenshots to delete.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const newest = links.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )[0];
    const arrayName = this.getArrayFieldName(newest.service);
    await this.userModel.findOneAndUpdate(
      { discordId: discordId },
      { $pull: { [arrayName]: { _id: newest._id } } },
    );
    await this.cloudinaryService.deleteFromCloud(newest.public_id);
    return {
      url: newest.screenshotUrl,
      service: newest.service,
      userHandle: newest.userHandle,
      timestamp: newest.timestamp.toISOString(),
    };
  }
}
