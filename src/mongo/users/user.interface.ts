export interface UserBody {
  discordId: string;
  fromDate?: string | number;
  toDate?: string | number;
  screenshotId?: string;
  service?: string;
}

export interface UserBodyPiped {
  discordId: string;
  fromDate?: Date;
  toDate?: Date;
  service?: string;
}

export interface ScreenshotData {
  url: string;
  service: string;
  userHandle: string;
  timestamp: string;
}
