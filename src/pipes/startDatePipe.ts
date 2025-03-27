import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class StartDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, service, startDate } = body;
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
    if (!startDate) {
      throw new HttpException('Provide date.', HttpStatus.BAD_REQUEST);
    }
    const newStartDate = new Date(startDate);
    if (
      Object.prototype.toString.call(newStartDate) !== '[object Date]' &&
      isNaN(newStartDate.getTime())
    ) {
      throw new HttpException('Incorrect date.', HttpStatus.BAD_REQUEST);
    }
    return { ...body, startDate: newStartDate, endDate: null };
  }
}

export default StartDatePipe;
