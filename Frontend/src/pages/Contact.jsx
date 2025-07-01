import React, { useState } from 'react';
import PageTransitionNoLoading from '../components/PageTransitionNoLoading';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
    // Here you could send the form data to your backend or an email service
  };

  return (
    <PageTransitionNoLoading>
      <div className="contact-container">
        <h1>Contact Us</h1>
        {submitted ? (
          <p className="success-message">Thank you for reaching out! We'll get back to you soon.</p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Your Name" value={form.name} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
            <textarea name="message" placeholder="Your Message" value={form.message} onChange={handleChange} required />
            <button type="submit">Send Message</button>
          </form>
        )}
        <div className="contact-details">
          <p>Email: support@alumnet.com</p>
          <p>Phone: +91-12345-67890</p>
        </div>
      </div>
    </PageTransitionNoLoading>
  );
};

export default Contact;
