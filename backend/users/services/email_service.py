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

            subject = "Welcome to Finova Trading Platform!"
            
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
            Welcome to Finova!
            
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
            The Finova Team
            
            © 2025 FINOVA. All rights reserved.
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
        
    @staticmethod
    def send_account_approved_email(user_email, username):
        """
        Send account approved notification email using Twilio SendGrid
        """
        try:
            # Debug: Check if API key is available
            api_key = os.getenv('SENDGRID_API_KEY')
            from_email = os.getenv('SENDGRID_FROM_EMAIL')
            
            print(f"DEBUG - Sending account approved email to: {user_email}")
            
            if not api_key:
                logger.error("SendGrid API Key not found in environment variables")
                return False
            
            if not from_email:
                logger.error("SendGrid FROM EMAIL not found in environment variables")
                return False

            subject = "Your Account Has Been Approved! - Trading Platform"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #27ae60; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                    .content {{ padding: 20px; background: #f9f9f9; border-radius: 0 0 5px 5px; }}
                    .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                    .features {{ background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .feature-item {{ margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Account Approved!</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>{username}</strong>,</p>
                        <p>Great news! Your account has been <strong>approved</strong> by our Finova team.</p>
                        
                        <div class="features">
                            <p><strong>You now have access to:</strong></p>
                            <div class="feature-item">✅ <strong>Full trading capabilities</strong></div>
                            <div class="feature-item">✅ <strong>Portfolio management</strong></div>
                            <div class="feature-item">✅ <strong>Real-time market data</strong></div>
                            <div class="feature-item">✅ <strong>Investment tracking</strong></div>
                            <div class="feature-item">✅ <strong>Advanced analytics</strong></div>
                        </div>
                        
                        <p>You can now log in to your account and start exploring all the features our platform has to offer.</p>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Log in to your account</li>
                            <li>Complete your profile setup</li>
                            <li>Explore available stocks and markets</li>
                            <li>Start building your investment portfolio</li>
                        </ul>
                        
                        <p>If you have any questions or need assistance getting started, don't hesitate to contact our support team.</p>
                        
                        <p>Happy investing!<br>
                        <strong>The Trading Platform Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Trading Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            plain_content = f"""
            Account Approved - Trading Platform
            
            Hello {username},
            
            Great news! Your account has been approved by our administration team.
            
            You now have access to:
            ✅ Full trading capabilities
            ✅ Portfolio management
            ✅ Real-time market data
            ✅ Investment tracking
            ✅ Advanced analytics
            
            You can now log in to your account and start exploring all the features our platform has to offer.
            
            Next Steps:
            • Log in to your account
            • Complete your profile setup
            • Explore available stocks and markets
            • Start building your investment portfolio
            
            If you have any questions or need assistance getting started, don't hesitate to contact our support team.
            
            Happy investing!
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
            
            print(f"DEBUG - Account approved email sent successfully. Status: {response.status_code}")
            logger.info(f"Account approved email sent to {user_email}. Status: {response.status_code}")
            return True
            
        except Exception as e:
            print(f"DEBUG - Account approved email sending failed: {str(e)}")
            logger.error(f"Failed to send account approved email to {user_email}: {str(e)}")
            return False