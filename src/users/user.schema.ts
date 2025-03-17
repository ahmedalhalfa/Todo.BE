import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: 'hashed_password_string',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  @Prop()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  @Prop()
  lastName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add transform to convert MongoDB ObjectIds to strings
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
}); 