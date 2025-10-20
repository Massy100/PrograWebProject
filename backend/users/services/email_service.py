import os
import logging
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_welcome_email(user_email, username):
        """
        Send welcome email to newly registered user
        """
        try:
            # Debug: Check if API key is available
            api_key = os.getenv('SENDGRID_API_KEY')
            from_email = os.getenv('SENDGRID_FROM_EMAIL')
            
            print(f"DEBUG - API Key exists: {bool(api_key)}")
            print(f"DEBUG - From Email: {from_email}")
            print(f"DEBUG - Sending to: {user_email}")
            
            if not api_key:
                logger.error("SendGrid API Key not found in environment variables")
                return False
            
            if not from_email:
                logger.error("SendGrid FROM EMAIL not found in environment variables")
                return False

            subject = "Welcome to Our Trading Platform!"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #2c3e50; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; border-radius: 5px; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Our Trading Platform!</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>{username}</strong>,</p>
                        <p>Your account has been successfully created and activated on our trading platform.</p>
                        <p>We're excited to have you on board and can't wait to see you start trading!</p>
                        <p><strong>What you can do now:</strong></p>
                        <ul>
                            <li>Explore available stocks</li>
                            <li>View market trends</li>
                            <li>Start building your portfolio</li>
                            <li>Monitor your investments</li>
                        </ul>
                        <p>If you have any questions or need assistance, our support team is here to help.</p>
                        <p>Happy trading!<br><strong>The Trading Platform Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Trading Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            plain_content = f"""
            Welcome to Our Trading Platform!
            
            Hello {username},
            
            Your account has been successfully created and activated on our trading platform.
            
            We're excited to have you on board and can't wait to see you start trading!
            
            What you can do now:
            - Explore available stocks
            - View market trends
            - Start building your portfolio
            - Monitor your investments
            
            If you have any questions or need assistance, our support team is here to help.
            
            Happy trading!
            The Trading Platform Team
            
            © 2024 Trading Platform. All rights reserved.
            """
            
            message = Mail(
                from_email=from_email,
                to_emails=user_email,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )
            
            sg = SendGridAPIClient(api_key)
            response = sg.send(message)
            
            print(f"DEBUG - Email sent successfully. Status: {response.status_code}")
            logger.info(f"Welcome email sent to {user_email}. Status: {response.status_code}")
            return True
            
        except Exception as e:
            print(f"DEBUG - Email sending failed: {str(e)}")
            logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
            return False