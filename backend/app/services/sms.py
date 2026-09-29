import os
import logging
from twilio.rest import Client

# MVP Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "mock_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "mock_token")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")

logger = logging.getLogger(__name__)

def send_sms_alert(to_phone: str, message: str):
    if TWILIO_ACCOUNT_SID == "mock_sid":
        logger.info(f"[MOCK SMS] To {to_phone}: {message}")
        return {"status": "mocked"}
    
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        msg = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        return {"status": "sent", "sid": msg.sid}
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return {"status": "error", "error": str(e)}
