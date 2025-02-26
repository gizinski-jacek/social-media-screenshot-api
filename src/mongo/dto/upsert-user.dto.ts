import { Link } from '../schemas/link.schema';

export class UpsertUserDto {
  readonly discordId: string;
  readonly postScreenshotData?: Link;
}
