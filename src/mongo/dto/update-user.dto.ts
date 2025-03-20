import { Link } from '../schemas/link.schema';

export class UpdateUserDto {
  readonly discordId: string;
  readonly postScreenshotData?: Link;
}
