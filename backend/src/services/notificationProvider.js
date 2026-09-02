/** Provider interfaces for future external notification channels. */

export class NotificationProvider {
  async send() {
    throw new Error('Notification provider is not configured');
  }
}

export class InAppNotificationProvider extends NotificationProvider {
  async send(notification) {
    return { status: 'DELIVERED', notificationId: notification.id };
  }
}

export class EmailNotificationProvider extends NotificationProvider {
  async send() {
    return { status: 'PENDING', reason: 'Email provider integration is not configured' };
  }
}

export class HubtelSmsNotificationProvider extends NotificationProvider {
  async send() {
    return { status: 'PENDING', reason: 'Hubtel notification integration is separate from OTP and not configured' };
  }
}

export class PushNotificationProvider extends NotificationProvider {
  async send() {
    return { status: 'PENDING', reason: 'FCM push integration is not configured' };
  }
}
