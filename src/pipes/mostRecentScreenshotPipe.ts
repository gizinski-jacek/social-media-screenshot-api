import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class MostRecentScreenshotPipe implements PipeTransform {
  transform(body: UserBody): UserBody {
    const { discordId, service } = body;
    if (!discordId) {
      throw new HttpException('Provide discord Id.', HttpStatus.BAD_REQUEST);
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
    return body;
  }
}

export default MostRecentScreenshotPipe;
