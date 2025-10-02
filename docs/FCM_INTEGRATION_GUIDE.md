# Firebase Cloud Messaging (FCM) Integration Guide

## Overview

This guide explains how to properly integrate Firebase Cloud Messaging (FCM) with the SafeHorizon police dashboard to ensure tourists receive broadcast notifications.

## Current Issues and Solutions

### 1. FCM Configuration Issues

**Problem**: Tourists may not receive broadcast notifications due to improper FCM setup.

**Solution**: 
- Ensure `google-services.json` is properly configured
- Verify FCM server key is set in backend environment variables
- Test FCM token registration and delivery

### 2. Device Token Management

**Problem**: Device tokens may not be properly registered or updated.

**Solution**:
- Implement proper token refresh handling
- Store tokens securely in database
- Handle token expiration gracefully

### 3. Notification Delivery Verification

**Problem**: No way to verify if notifications are actually delivered to tourists.

**Solution**:
- Implement delivery receipts
- Add notification acknowledgment tracking
- Create delivery status monitoring

## Implementation Steps

### Backend Configuration

1. **Environment Variables**:
```bash
FCM_SERVER_KEY=your_fcm_server_key_here
FCM_PROJECT_ID=your_project_id_here
```

2. **FCM Service Implementation**:
```python
# backend/services/fcm_service.py
import firebase_admin
from firebase_admin import credentials, messaging
import os

class FCMService:
    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate("path/to/google-services.json")
            firebase_admin.initialize_app(cred)
    
    def send_notification(self, device_tokens, title, body, data=None):
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            tokens=device_tokens
        )
        
        response = messaging.send_multicast(message)
        return {
            'success_count': response.success_count,
            'failure_count': response.failure_count,
            'responses': [
                {
                    'success': resp.success,
                    'message_id': resp.message_id,
                    'error': str(resp.exception) if resp.exception else None
                }
                for resp in response.responses
            ]
        }
```

### Frontend Integration

1. **Device Registration**:
```javascript
// Register device on login
async function registerDevice() {
  try {
    const token = await getFCMToken();
    await mobileNotificationAPI.registerDevice({
      device_token: token,
      device_type: 'web',
      device_name: navigator.userAgent,
      app_version: '1.0.0'
    });
  } catch (error) {
    console.error('Failed to register device:', error);
  }
}
```

2. **Notification Handling**:
```javascript
// Handle incoming notifications
messaging.onMessage((payload) => {
  console.log('Message received:', payload);
  
  // Show notification
  showNotification(payload.notification.title, payload.notification.body);
  
  // Handle broadcast acknowledgment
  if (payload.data.type === 'broadcast') {
    handleBroadcastNotification(payload.data);
  }
});
```

### Testing FCM Integration

Use the NotificationTester component in the Broadcast page:

1. **Device Registration Test**:
   - Enter a valid FCM device token
   - Click "Test Device" to register the device
   - Verify registration success

2. **Broadcast Delivery Test**:
   - Click "Test Broadcasts" to send test notifications
   - Check if notifications are received on registered devices
   - Verify delivery statistics

3. **End-to-End Test**:
   - Register a device with a real FCM token
   - Send a broadcast from the police dashboard
   - Verify the notification appears on the device

## Troubleshooting

### Common Issues

1. **"Invalid registration token"**:
   - Token may be expired or invalid
   - Re-register the device
   - Check token format

2. **"MismatchSenderId"**:
   - FCM server key doesn't match project
   - Verify server key configuration
   - Check project ID

3. **Notifications not appearing**:
   - Check browser notification permissions
   - Verify service worker is active
   - Check FCM token validity

### Debug Steps

1. **Check FCM Token**:
```javascript
// Get current FCM token
const token = await messaging.getToken();
console.log('FCM Token:', token);
```

2. **Verify Registration**:
```javascript
// Check if device is registered
const devices = await mobileNotificationAPI.listDevices();
console.log('Registered devices:', devices);
```

3. **Test Notification**:
```javascript
// Send test notification
await broadcastAPI.sendAllBroadcast({
  title: 'Test Notification',
  message: 'This is a test message',
  severity: 'low',
  alert_type: 'test',
  action_required: 'none'
});
```

## Monitoring and Analytics

### Delivery Metrics

Track the following metrics:
- Total notifications sent
- Successful deliveries
- Failed deliveries
- Acknowledgment rates
- Device registration counts

### Error Tracking

Monitor these error types:
- Invalid tokens
- Network failures
- Server errors
- Permission denials

## Best Practices

1. **Token Management**:
   - Refresh tokens periodically
   - Handle token expiration gracefully
   - Store tokens securely

2. **Notification Content**:
   - Keep titles under 50 characters
   - Keep messages under 200 characters
   - Use appropriate severity levels

3. **Delivery Optimization**:
   - Batch notifications when possible
   - Implement retry logic for failures
   - Monitor delivery rates

4. **User Experience**:
   - Request notification permissions politely
   - Provide clear opt-out options
   - Handle offline scenarios

## Security Considerations

1. **Token Security**:
   - Never expose FCM server key in frontend
   - Validate tokens on backend
   - Implement rate limiting

2. **Data Privacy**:
   - Only send necessary data in notifications
   - Respect user privacy preferences
   - Comply with data protection regulations

## Testing Checklist

- [ ] FCM project configured correctly
- [ ] Server key set in environment variables
- [ ] Device registration working
- [ ] Notifications being sent
- [ ] Notifications being received
- [ ] Acknowledgment system working
- [ ] Error handling implemented
- [ ] Delivery metrics tracked
- [ ] Security measures in place

## Support

For FCM-related issues:
1. Check Firebase Console for delivery statistics
2. Review browser console for errors
3. Test with Firebase Console messaging tool
4. Verify backend logs for FCM responses
5. Check network connectivity and CORS settings
