import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
        default: '',
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
});

export default mongoose.model('AuditLog', auditLogSchema);
