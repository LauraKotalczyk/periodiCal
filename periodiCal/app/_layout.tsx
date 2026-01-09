import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// DB
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db, expo_sqlite } from "../db/client";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import migrations from "@/drizzle/migrations";
import * as schema from "@/db/schema";
import { v4 as uuidv4 } from 'uuid';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export async function addUserToDb(db: any) {
  await db.insert(schema.users).values({
    userId: uuidv4(),
    name: "test-user",
    age: 22,
    weight: null
  });
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { success, error: migrationError } = useMigrations(db, migrations);
  useDrizzleStudio(expo_sqlite);

    if (success) {
      // addUserToDb(db);
    }

  

  if (migrationError) {
    console.error("Migration Error: ", migrationError);
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

