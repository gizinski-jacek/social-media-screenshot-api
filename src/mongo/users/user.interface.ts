export interface UserBody {
  discordId: string;
  fromDate?: string | number;
  toDate?: string | number;
  social?: string;
}

export interface UserBodyPiped {
  discordId: string;
  fromDate?: Date;
  toDate?: Date;
  social?: string;
}

export interface ScreenshotData {
  url: string;
  service: string;
  userHandle: string;
  timestamp: string;
}
