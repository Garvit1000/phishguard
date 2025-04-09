export default [
    {
      id: 1,
      sender: 'security@amaz0n-support.com',
      subject: 'Your Amazon account has been suspended',
      content: 'Dear Customer, We have detected unusual activity on your account. Your account has been temporarily suspended. Click here to verify your information and restore your account immediately.',
      isPhishing: true,
      explanation: 'This is a phishing attempt. Note the misspelled domain (amaz0n-support.com instead of amazon.com), the urgent tone, and the vague "unusual activity" claim.'
    },
    {
      id: 2,
      sender: 'notifications@paypal.com',
      subject: 'Receipt for your payment to Netflix',
      content: 'Thank you for your payment to Netflix. If you did not authorize this transaction, please log in to your PayPal account to view details and file a dispute if necessary.',
      isPhishing: false,
      explanation: 'This is a legitimate email. The sender domain is correct, it doesn\'t ask you to click links, and it directs you to log in to your account directly (not via a provided link).'
    },
    {
      id: 3,
      sender: 'support@bank-secure-center.com',
      subject: 'URGENT: Your account access will be terminated',
      content: 'Dear valued customer, Due to failure to update your account information, your online banking access will be terminated in 24 hours. Click the secure link below to update your information now.',
      isPhishing: true,
      explanation: 'This is a phishing attempt. Banks don\'t use generic greetings like "valued customer," the domain is suspicious, and it creates false urgency with threats of account termination.'
    },
    {
      id: 4,
      sender: 'no-reply@dropbox.com',
      subject: 'John shared a document with you',
      content: 'John Smith has shared a document with you on Dropbox. Click here to view the document. If you don\'t want to receive these notifications, log in to your Dropbox account and adjust your notification settings.',
      isPhishing: false,
      explanation: 'This appears to be legitimate. The sender domain is correct, and it mentions specific actions you can take within your account to manage notifications.'
    },
    {
      id: 5,
      sender: 'helpdesk@microsoft365.net',
      subject: 'Your Microsoft password will expire today',
      content: 'Your Microsoft Office 365 password will expire in 3 hours. To keep your account active, please verify your identity now by confirming your password. Failure to do so will result in account suspension.',
      isPhishing: true,
      explanation: 'This is a phishing attempt. Microsoft uses microsoft.com domains, not microsoft365.net. Also, legitimate password expiration notices don\'t ask you to "verify your identity" by confirming your current password.'
    }
  ];