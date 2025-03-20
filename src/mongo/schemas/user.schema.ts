import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Link, LinkDocument, LinkSchema } from './link.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  discordId: string;

  @Prop({ required: true })
  cloudinaryId: string;

  @Prop({ type: [LinkSchema], default: [] })
  blueskyScreenshots: LinkDocument[];

  @Prop({ type: [LinkSchema], default: [] })
  twitterScreenshots: LinkDocument[];

  @Prop({ type: [LinkSchema], default: [] })
  facebookScreenshots: LinkDocument[];

  @Prop({ type: [LinkSchema], default: [] })
  instagramScreenshots: LinkDocument[];

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & Link;
};

export type UserDocument = HydratedDocument<User, UserDocumentOverride>;
