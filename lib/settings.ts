// Site-wide settings stored in the app_settings table (server-only).
// Add a new setting by giving it a default here; missing rows fall back to the default.
import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const SETTING_DEFAULTS = {
  /** Email subscribers when a new tour package is published */
  customerNotifications: true,
};

export type AppSettings = typeof SETTING_DEFAULTS;
export type SettingKey = keyof AppSettings;

export async function getSettings(): Promise<AppSettings> {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: Object.keys(SETTING_DEFAULTS) } } });
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...SETTING_DEFAULTS, ...stored } as AppSettings;
}

export async function getSetting<K extends SettingKey>(key: K): Promise<AppSettings[K]> {
  const row = await prisma.appSetting.findUnique({ where: { key } });
  return (row?.value ?? SETTING_DEFAULTS[key]) as AppSettings[K];
}

/** Save the given settings; unknown keys and wrongly-typed values are ignored. */
export async function updateSettings(input: Record<string, unknown>): Promise<AppSettings> {
  const updates = (Object.keys(SETTING_DEFAULTS) as SettingKey[]).filter(
    (key) => key in input && typeof input[key] === typeof SETTING_DEFAULTS[key],
  );
  await prisma.$transaction(
    updates.map((key) =>
      prisma.appSetting.upsert({
        where: { key },
        create: { key, value: input[key] as Prisma.InputJsonValue },
        update: { value: input[key] as Prisma.InputJsonValue },
      }),
    ),
  );
  return getSettings();
}
