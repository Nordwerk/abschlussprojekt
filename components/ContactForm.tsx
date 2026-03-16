'use client';

import { useState, useEffect } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Erfolgs- und Fehlermeldung nach 5 Sekunden automatisch ausblenden
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontakt" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
          Unverbindliche <span className="text-nordwerk-orange">Anfrage</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-6 bg-white p-5 sm:p-6 md:p-8 rounded-2xl shadow-xl"
        >
          <input
            name="name"
            placeholder="Ihr Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 sm:p-3.5 border rounded-lg text-sm sm:text-base"
          />

          <input
            type="email"
            name="email"
            placeholder="Ihre E-Mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 sm:p-3.5 border rounded-lg text-sm sm:text-base"
          />

          <input
            name="phone"
            placeholder="Ihre Telefonnummer"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 sm:p-3.5 border rounded-lg text-sm sm:text-base"
          />

          <textarea
            name="message"
            placeholder="Beschreiben Sie Ihre Anfrage..."
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-3 sm:p-3.5 border rounded-lg text-sm sm:text-base resize-y"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nordwerk-orange text-black p-3 sm:p-3.5 rounded-2xl text-base sm:text-lg font-semibold hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Wird gesendet...' : 'Anfrage senden'}
          </button>

          {success && (
            <p className="text-green-600 text-center text-sm sm:text-base">
              Ihre Anfrage wurde erfolgreich gesendet!
            </p>
          )}

          {error && (
            <p className="text-red-600 text-center text-sm sm:text-base">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}