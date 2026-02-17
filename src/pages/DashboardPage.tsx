import React, { useContext } from "react";
import { motion } from "framer-motion";
import { Card, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconClock, IconUsers, IconSettings, IconFileInvoice } from "@tabler/icons-react";
import { AuthContext } from "../auth/AuthContext";

const modules = [
  { title: "Zeiterfassung", description: "Arbeitszeiten erfassen, bearbeiten und auswerten.", icon: IconClock, href: "/zeiterfassung" },
  { title: "Benutzerverwaltung", description: "Benutzer anlegen, Rollen verwalten und Berechtigungen steuern.", icon: IconUsers, href: "/benutzerverwaltung" },
  { title: "Einstellungen", description: "Systemweite Konfigurationen und Präferenzen festlegen.", icon: IconSettings, href: "/einstellungen" },
  { title: "Lieferscheinerstellung", description: "Lieferscheine erstellen, bearbeiten und exportieren.", icon: IconFileInvoice, href: "/lieferscheine" }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Dashboard</h1>
          <Text className="text-gray-600 mt-2 text-base">
            Hallo {user?.employeeFirstname ?? ""}, wähle ein Modul, um direkt in den jeweiligen Funktionsbereich zu springen.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div key={module.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                <Card shadow="sm" padding="lg" radius="md" className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1" onClick={() => navigate(module.href)}>
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                      {Icon && <Icon size={26} className="text-blue-600" />}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold">{module.title}</h2>
                      <Text className="text-sm text-gray-600 leading-relaxed">{module.description}</Text>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}