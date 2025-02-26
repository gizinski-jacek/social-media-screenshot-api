import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Link, LinkSchema } from './link.schema';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  discordId: string;

  @Prop({ type: [LinkSchema], default: [] })
  blueskyScreenshots: Link[];

  @Prop({ type: [LinkSchema], default: [] })
  twitterScreenshots: Link[];

  @Prop({ type: [LinkSchema], default: [] })
  facebookScreenshots: Link[];

  @Prop({ type: [LinkSchema], default: [] })
  instagramScreenshots: Link[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & Link;
};

export type UserDocument = HydratedDocument<User, UserDocumentOverride>;
