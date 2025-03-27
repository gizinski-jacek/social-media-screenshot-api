import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class StartDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, service, fromDate } = body;
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
    if (!fromDate) {
      throw new HttpException('Provide date.', HttpStatus.BAD_REQUEST);
    }
    const newFromDate = new Date(fromDate);
    if (
      Object.prototype.toString.call(newFromDate) !== '[object Date]' &&
      isNaN(newFromDate.getTime())
    ) {
      throw new HttpException('Incorrect date.', HttpStatus.BAD_REQUEST);
    }
    return { ...body, fromDate: newFromDate, toDate: null };
  }
}

export default StartDatePipe;
