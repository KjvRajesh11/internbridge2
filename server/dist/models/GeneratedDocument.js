import mongoose, { Schema } from 'mongoose';
const generatedDocumentSchema = new Schema({
    _id: { type: String, required: true },
    student_id: { type: String, required: true, ref: 'User' },
    application_id: { type: String, ref: 'Application' },
    doc_type: {
        type: String,
        enum: ['cover_letter', 'tailored_resume', 'qa_answers', 'prep_sheet'],
        required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    approved: { type: Boolean, default: false },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
generatedDocumentSchema.index({ student_id: 1, created_at: -1 });
generatedDocumentSchema.virtual('id').get(function () {
    return this._id;
});
export const GeneratedDocument = mongoose.model('GeneratedDocument', generatedDocumentSchema);
