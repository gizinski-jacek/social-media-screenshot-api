import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class UserPipe implements PipeTransform {
  transform(body: UserBody): UserBody {
    const { discordId, social } = body;
    if (!discordId) {
      throw new HttpException('Provide discordId.', HttpStatus.BAD_REQUEST);
    }
    if (social) {
      const supportedService = supportedServicesData[social];
      if (!supportedService) {
        throw new HttpException(
          'Unsupported social media service.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return {
      discordId: discordId,
      social: social,
    };
  }
}

export default UserPipe;
