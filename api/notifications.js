import express from 'express';
import cron from 'node-cron';

/**
 * This codebase includes a collaborative effort from an external source ChatGPT 4o.
 * Main collaboration from ChatGPT 4o involved database query refinement, identififying missing functionality, error handling, and implementing time constraints.
 * 
 */

const router = express.Router();

let notificationJob = null;

export default function createNotificationRouter(database, sendCodeEmail) {

    // Get users who need parking notifications
    async function checkParkingNotifications() {
        try {
            console.log('Checking parking notifications...');

            const [users] = await database.execute(`
                SELECT user_id, email, notification_preference 
                FROM users 
                WHERE notifications_enabled = 1 
                AND notification_preference IS NOT NULL
                AND notification_last_sent < DATE_SUB(NOW(), INTERVAL 1 HOUR)
            `);

            for (const user of users) {
                console.log(`Checking notifications for user ${user.user_id}`);
            }

        } catch (error) {
            console.error('Notification check error:', error);
        }
    }

    router.post('/start-service', (req, res) => {
        if (notificationJob) {
            return res.json({ message: 'Notification service already running' });
        }

        // Check every 5 minutes
        notificationJob = cron.schedule('*/5 * * * *', checkParkingNotifications);
        notificationJob.start();

        res.json({ message: 'Notification service started' });
    });

    router.post('/stop-service', (req, res) => {
        if (notificationJob) {
            notificationJob.stop();
            notificationJob = null;
        }
        res.json({ message: 'Notification service stopped' });
    });

    router.post('/check-parking', async (req, res) => {
        try {
            const { endTime, location, vehicleNumber } = req.body;

            if (!req.session.user) {
                return res.status(401).json({ error: 'Not logged in' });
            }

            const userId = req.session.user.id;

            // Get user notification preference
            const [users] = await database.execute(
                'SELECT email, notification_preference, notifications_enabled FROM users WHERE user_id = ?',
                [userId]
            );

            if (users.length === 0 || !users[0].notifications_enabled) {
                return res.json({ shouldNotify: false });
            }

            const user = users[0];
            const notificationMinutes = parseInt(user.notification_preference);
            const parkingEndTime = new Date(endTime);
            const now = new Date();
            const notificationTime = new Date(parkingEndTime.getTime() - (notificationMinutes * 60 * 1000));

            if (now >= notificationTime && now < parkingEndTime) {
                const timeRemaining = Math.floor((parkingEndTime - now) / (60 * 1000));

                await sendParkingNotification(
                    user.email,
                    location || 'Your parking location',
                    vehicleNumber || '',
                    timeRemaining,
                    parkingEndTime
                );

                // Update last sent time
                await database.execute(
                    'UPDATE users SET notification_last_sent = NOW() WHERE user_id = ?',
                    [userId]
                );

                return res.json({
                    shouldNotify: true,
                    message: 'Notification sent',
                    timeRemaining
                });
            }

            res.json({ shouldNotify: false });

        } catch (error) {
            console.error('Notification check error:', error);
            res.status(500).json({ error: 'Failed to check notifications' });
        }
    });

    // Email template and send function
    async function sendParkingNotification(email, location, vehicle, minutesRemaining, endTime) {
        try {
            const timeText = minutesRemaining > 60
                ? `${Math.floor(minutesRemaining / 60)} hour(s) and ${minutesRemaining % 60} minute(s)`
                : `${minutesRemaining} minute(s)`;

            const endTimeText = endTime.toLocaleString();

            await sendCodeEmail(
                email,
                'ParkSmart - Parking Expiring Soon!',
                `
                <div style="font-family: Arial, sans-serif; max-width: 500px;">
                    <h2 style="color: #2553e9;">🚗 Parking Reminder</h2>
                    <p><strong>Your parking is expiring soon!</strong></p>
                    <p><strong>Location:</strong> ${location}</p>
                    ${vehicle ? `<p><strong>Vehicle:</strong> ${vehicle}</p>` : ''}
                    <p><strong>Time Remaining:</strong> ${timeText}</p>
                    <p><strong>Expires At:</strong> ${endTimeText}</p>
                    <p>Open the ParkSmart app to extend your parking if needed.</p>
                    <p>Thanks,<br>ParkSmart Team</p>
                </div>
                `
            );

            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            return false;
        }
    }

    return router;
}