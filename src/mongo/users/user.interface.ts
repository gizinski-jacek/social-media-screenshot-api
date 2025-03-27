export interface UserBody {
  discordId: string;
  startDate?: string | number;
  endDate?: string | number;
  screenshotId?: string;
  service?: string;
}

export interface UserBodyPiped {
  discordId: string;
  startDate?: Date;
  endDate?: Date;
  service?: string;
}

export interface ScreenshotData {
  url: string;
  service: string;
  userHandle: string;
  timestamp: string;
}
