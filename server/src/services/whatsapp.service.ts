/**
 * Mock WhatsApp Service
 * Simulates sending WhatsApp messages by logging to the console.
 * In production, this would integrate with a provider like Twilio or Meta API.
 */
export const whatsappService = {
    /**
     * Send a welcome message with verification/magic link
     */
    sendWelcomeMessage: async (to: string, userName: string, role: string, sipId: string) => {
        // In a real app, we would use an environment variable for the frontend URL
        const frontendUrl = 'http://localhost:5173';
        const magicLink = `${frontendUrl}/profile?welcome=true`;

        const message = `
================================================================
[Mock WhatsApp] Sending to ${to}
================================================================
Hi ${userName}! 👋

Congratulations! Your registration as ${role} is complete.
Your SIP ID is: *${sipId}*

Click here to view your profile and claim your account:
${magicLink}
================================================================
        `;

        console.log(message);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    }
};
