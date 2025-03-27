import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class SpecificScreenshotPipe implements PipeTransform {
  transform(body: UserBody): UserBody {
    const { discordId, screenshotId, service } = body;
    if (!discordId) {
      throw new HttpException('Provide discord Id.', HttpStatus.BAD_REQUEST);
    }
    if (!screenshotId) {
      throw new HttpException('Provide screenshot Id.', HttpStatus.BAD_REQUEST);
    }
    if (service) {
      const supportedService = supportedServicesData[service];
      if (!supportedService) {
        throw new HttpException(
          'Unsupported social media service.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    throw new Error();
    return body;
  }
}

export default SpecificScreenshotPipe;
