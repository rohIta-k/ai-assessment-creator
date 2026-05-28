import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    picture: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>

export const User = model('User', userSchema)
