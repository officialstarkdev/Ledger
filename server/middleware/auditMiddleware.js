import AuditLog from '../models/AuditLog.js';

const auditLogger = async (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        res.on('finish', async () => {
            try {
                if (req.user) {
                    await AuditLog.create({
                        userId: req.user._id,
                        action: `${req.method} ${req.originalUrl}`,
                        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                        details: {
                            statusCode: res.statusCode,
                            body: req.method === 'DELETE' ? {} : { ...req.body, password: undefined },
                        },
                    });
                }
            } catch (err) {
                console.error('Audit log error:', err.message);
            }
        });
    }
    next();
};

export default auditLogger;
