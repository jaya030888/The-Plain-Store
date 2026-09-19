exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, orderId, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const inquiry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      orderId: orderId ? orderId.trim() : null,
      subject: subject ? subject.trim() : 'Customer Support Inquiry',
      message: message.trim(),
      receivedAt: new Date().toISOString()
    };

    console.log('[Contact Inquiry Received]:', inquiry);

    res.status(200).json({
      success: true,
      message: 'Thank you for reaching out to The Plain Store. Our support team will get back to you within 24 to 48 business hours.',
      inquiryId: `TPS-INQ-${Date.now().toString().slice(-6)}`
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    res.status(500).json({ message: 'Failed to process inquiry. Please try again or email us directly.' });
  }
};
