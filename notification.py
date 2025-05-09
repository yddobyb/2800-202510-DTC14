import smtplib
from email.message import EmailMessage

def send_email(recipient, subject, body):
    msg = EmailMessage()
    msg['From'] = 'parksmart@gmail.com'
    msg['To'] = recipient
    msg['Subject'] = subject
    msg.set_content(body)

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login('parksmart@gmail.com', '#### #### #### ####')
        smtp.send_message(msg)


def main():
    recipient = "johnpork@gmail.com"
    subject = "Your Parking Will Expire!"
    body = "Dear [Username], This is a reminder that your parking session at [Parking Lot Name] will"
    "expire in [X time]. To avoid any interruptions or potential fines, please renew your parking promptly. You can extend your session by clicking the link below:
    "[Renew Parking Link] Thank you for using ParkSmart!"
    send_email(recipient, subject, body)


if name == "main":
    main()