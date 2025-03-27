import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class FromToDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, social, fromDate, toDate } = body;
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
    if (!fromDate || !toDate) {
      throw new HttpException(
        'Provide From and To dates.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newFromDate = new Date(fromDate);
    const newToDate = new Date(toDate);
    if (
      (Object.prototype.toString.call(newFromDate) !== '[object Date]' &&
        isNaN(newFromDate.getTime())) ||
      (Object.prototype.toString.call(newToDate) !== '[object Date]' &&
        isNaN(newToDate.getTime()))
    ) {
      throw new HttpException('Incorrect dates.', HttpStatus.BAD_REQUEST);
    }
    if (newFromDate.getTime() > newToDate.getTime()) {
      throw new HttpException(
        'From date can not be newer than To date.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { ...body, fromDate: newFromDate, toDate: newToDate };
  }
}

export default FromToDatePipe;
