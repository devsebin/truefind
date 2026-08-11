export const authSessionResponse = (session: any): any => ({
  id: session._id,

  user: session.userId
    ? {
        id: session.userId._id,
        first_name: session.userId.first_name,
        last_name: session.userId.last_name,
        email: session.userId.email,
        phone: session.userId.phone,
      }
    : null,

  device: {
    id: session.deviceId,
    name: session.deviceName,
    type: session.device?.deviceType,
    browser: session.device?.browser,
    os: session.device?.os,
    user_agent: session.device?.userAgent,
  },

  location: {
    country: session.location?.country,
    city: session.location?.city,
    ip_address: session.ipAddress,
  },

  status: session.isRevoked ? "revoked" : "active",

  is_revoked: session.isRevoked,

  expires_at: session.expiresAt,
  last_used_at: session.lastUsedAt,

  created_at: session.createdAt,
  updated_at: session.updatedAt,
});

export const authSessionListResponse = (sessions: any[]): any[] =>
  sessions.map((session) => authSessionResponse(session));
