import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { UserBody, UserBodyPiped } from 'src/mongo/users/user.interface';
import { supportedServicesData } from 'src/utils/data';

class StartToEndDatePipe implements PipeTransform {
  transform(body: UserBody): UserBodyPiped {
    const { discordId, service, startDate, endDate } = body;
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
    if (!startDate || !endDate) {
      throw new HttpException(
        'Provide Start and End dates.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    if (
      (Object.prototype.toString.call(newStartDate) !== '[object Date]' &&
        isNaN(newStartDate.getTime())) ||
      (Object.prototype.toString.call(newEndDate) !== '[object Date]' &&
        isNaN(newEndDate.getTime()))
    ) {
      throw new HttpException('Incorrect dates.', HttpStatus.BAD_REQUEST);
    }
    if (newStartDate.getTime() >= newEndDate.getTime()) {
      throw new HttpException(
        'Start date can not be equal to or newer than End date.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { ...body, startDate: newStartDate, endDate: newEndDate };
  }
}

export default StartToEndDatePipe;
