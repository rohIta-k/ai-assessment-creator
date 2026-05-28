import { Schema, model, Types } from 'mongoose'

export interface AssignmentDocument {
  _id: Types.ObjectId
  id: string
  userId: Types.ObjectId
  title: string
  instructions: string
  dueDate: string
  uploadedMaterial: string
  uploadedMaterialDataUrl: string
  questionTypes: unknown[]
  generatedPaper: unknown
  metadata: Record<string, unknown>
  saved: boolean
}

const assignmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    uploadedMaterial: { type: String, default: '' },
    uploadedMaterialDataUrl: { type: String, default: '' },
    questionTypes: { type: [Schema.Types.Mixed], default: [] },
    generatedPaper: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    saved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

export const Assignment = model<AssignmentDocument>('Assignment', assignmentSchema)
