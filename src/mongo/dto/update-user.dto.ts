import { Screenshot } from '../schemas/screenshot.schema';

export class UpdateUserDto {
  readonly discordId: string;
  readonly postScreenshotData?: Screenshot;
}
