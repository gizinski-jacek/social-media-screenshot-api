import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class EndDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, service, endDate } = body;
    if (!discordId) {
      throw new HttpException('Provide discordId.', HttpStatus.BAD_REQUEST);
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
    if (!endDate) {
      throw new HttpException('Provide date.', HttpStatus.BAD_REQUEST);
    }
    const newEndDate = new Date(endDate);
    if (
      Object.prototype.toString.call(newEndDate) !== '[object Date]' &&
      isNaN(newEndDate.getTime())
    ) {
      throw new HttpException('Incorrect date.', HttpStatus.BAD_REQUEST);
    }
    return { ...body, endDate: newEndDate, startDate: null };
  }
}

export default EndDatePipe;
