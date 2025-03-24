import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class ToDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, social, toDate } = body;
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
    if (!toDate) {
      throw new HttpException('Provide date.', HttpStatus.BAD_REQUEST);
    }
    const newToDate = new Date(toDate);
    if (
      Object.prototype.toString.call(newToDate) !== '[object Date]' &&
      isNaN(newToDate.getTime())
    ) {
      throw new HttpException('Incorrect date.', HttpStatus.BAD_REQUEST);
    }
    return { ...body, toDate: newToDate, fromDate: null };
  }
}

export default ToDatePipe;
