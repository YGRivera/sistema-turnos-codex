import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Turnia — Atención sin esperas", description: "Sistema moderno de gestión de turnos y atención al cliente." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
