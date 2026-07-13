import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Map, Users, ClipboardList, LayoutDashboard } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerenciador de atividades",
  description: "Gestão de equipe de levantamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="layout">
          <aside className="sidebar">
            <div className="logo">
              <h2 style={{ fontSize: "1.2rem" }}>Gerenciador de atividades</h2>
            </div>
            <nav className="nav">
              <Link href="/" className="nav-item">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link href="/units" className="nav-item">
                <Map size={20} /> Unidades
              </Link>
              <Link href="/team" className="nav-item">
                <Users size={20} /> Equipe
              </Link>
              <Link href="/assignments" className="nav-item">
                <ClipboardList size={20} /> Atribuições
              </Link>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
