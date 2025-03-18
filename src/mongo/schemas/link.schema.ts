import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Link {
  @Prop({ required: true })
  service: string;

  @Prop({ required: true })
  originalPostUrl: string;

  @Prop({ required: true })
  screenshotUrl: string;

  @Prop({ required: true })
  userHandle: string;

  @Prop({ required: true })
  postOwnerProfileLink: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  commentsDepth: number;

  @Prop()
  type?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);

export type LinkDocument = HydratedDocument<Link>;
