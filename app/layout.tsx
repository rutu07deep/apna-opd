import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ApnaOPD',
  description: 'Doctor Appointment Booking System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}