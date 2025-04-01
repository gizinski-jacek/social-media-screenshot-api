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
import { ScreenshotData, UserBody, UserBodyPiped } from './user.interface';
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    const { discordId, service } = data;
    const user: User = await this.userModel.findOne({
      discordId: discordId,
    });
    let links: Screenshot[] = [];
    if (service) {
      const arrayName = this.getArrayFieldName(service);
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
      throw new HttpException('No screenshots found.', HttpStatus.BAD_REQUEST);
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
    const { discordId, service } = data;
    const user: UserDocument = await this.userModel.findOne({
      discordId: discordId,
    });
    if (!user) {
      throw new HttpException(
        'Failed to find user data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    let links: ScreenshotDocument[] = [];
    if (service) {
      const arrayName = this.getArrayFieldName(service);
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
        HttpStatus.BAD_REQUEST,
      );
    }
    const newest = links.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    )[0];
    const arrayName = this.getArrayFieldName(newest.service);
    await this.userModel.findByIdAndUpdate(user._id, {
      $pull: { [arrayName]: { _id: newest._id } },
    });
    await this.cloudinaryService.deleteFromCloud(newest.public_id);
    return {
      url: newest.screenshotUrl,
      service: newest.service,
      userHandle: newest.userHandle,
      timestamp: newest.timestamp.toISOString(),
    };
  }

  async deleteSpecificScreenshot(data: UserBody): Promise<ScreenshotData> {
    const { discordId, screenshotId } = data;
    const stripExtension = screenshotId.slice(0, screenshotId.lastIndexOf('.'));
    const [service, userHandle, uid, cd, timestamp] =
      stripExtension.split('__');
    const arrayName = this.getArrayFieldName(service);
    const user: UserDocument = await this.userModel.findOne({
      discordId: discordId,
    });
    if (!user) {
      throw new HttpException(
        'Failed to find user data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.userModel.findOneAndUpdate(user._id, {
      $pull: {
        [arrayName]: {
          public_id: screenshotId.slice(0, screenshotId.lastIndexOf('.')),
        },
      },
    });
    const publicId = `${user.cloudinaryId}/${service}/${screenshotId}`;
    await this.cloudinaryService.deleteFromCloud(publicId);
    return {
      url: screenshotId,
      service: service,
      userHandle: userHandle,
      timestamp: timestamp,
    };
  }

  async getScreenshotsStartToEndDate(
    data: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const { discordId, service, startDate, endDate } = data;
    const user: UserDocument = await this.userModel.findOne({
      discordId: discordId,
    });
    if (!user) {
      throw new HttpException(
        'Failed to find user data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    let links: ScreenshotDocument[] = [];
    if (service) {
      const arrayName = this.getArrayFieldName(service);
      links = user[arrayName];
    } else {
      links = [
        ...user.blueskyScreenshots,
        ...user.facebookScreenshots,
        ...user.instagramScreenshots,
        ...user.twitterScreenshots,
      ];
    }
    const filtered = links
      .filter(
        (data) =>
          data.timestamp.getTime() <= endDate.getTime() &&
          data.timestamp.getTime() >= startDate.getTime(),
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    if (filtered.length === 0) {
      throw new HttpException(
        'No screenshots found in this date range.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const mapped = filtered.map((data) => {
      return {
        url: data.screenshotUrl,
        service: data.service,
        userHandle: data.userHandle,
        timestamp: data.timestamp.toISOString(),
      };
    });
    return mapped;
  }

  async getScreenshotsEndDate(data: UserBodyPiped): Promise<ScreenshotData[]> {
    const { discordId, service, endDate } = data;
    const user: User = await this.userModel.findOne({ discordId: discordId });
    let links: ScreenshotDocument[] = [];
    if (service) {
      const arrayName = this.getArrayFieldName(service);
      links = user[arrayName];
    } else {
      links = [
        ...user.blueskyScreenshots,
        ...user.facebookScreenshots,
        ...user.instagramScreenshots,
        ...user.twitterScreenshots,
      ];
    }
    const filtered = links
      .filter((data) => data.timestamp.getTime() <= endDate.getTime())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const mapped = filtered.map((data) => {
      return {
        url: data.screenshotUrl,
        service: data.service,
        userHandle: data.userHandle,
        timestamp: data.timestamp.toISOString(),
      };
    });
    return mapped;
  }

  async getScreenshotsStartDate(
    data: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const { discordId, service, startDate } = data;
    const user: User = await this.userModel.findOne({ discordId: discordId });
    let links: ScreenshotDocument[] = [];
    if (service) {
      const arrayName = this.getArrayFieldName(service);
      links = user[arrayName];
    } else {
      links = [
        ...user.blueskyScreenshots,
        ...user.facebookScreenshots,
        ...user.instagramScreenshots,
        ...user.twitterScreenshots,
      ];
    }
    const filtered = links
      .filter((data) => data.timestamp.getTime() >= startDate.getTime())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const mapped = filtered.map((data) => {
      return {
        url: data.screenshotUrl,
        service: data.service,
        userHandle: data.userHandle,
        timestamp: data.timestamp.toISOString(),
      };
    });
    return mapped;
  }
}
