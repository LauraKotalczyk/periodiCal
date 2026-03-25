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
import { log } from '@/utils/logger';

export const unstable_settings = {
  anchor: '(tabs)',
};

export async function addUserToDb(db: any) {
  await db.insert(schema.users).values({
    userId: uuidv4(),
    name: "test-user",
    age: 23,
    weight: null
  });
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { success, error: migrationError } = useMigrations(db, migrations);
  useDrizzleStudio(expo_sqlite);

  if (success) {
    log.info("Connection to the Database established successfully.");
  } 
  else {
    // Todo: Figure out what to do
    log.error("Connection to the Database failed.");
  }

  if (migrationError) {
    log.error("Migration Error: ", migrationError);
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen 
          name="screens/LogPeriodScreen" // relative file path from the app folder
          options={{ 
            presentation: 'modal', // Slide up from bottom (instead of right)
            headerTitle: 'Log Period',
            headerShown: true // Shows a "Close" button or title bar on the pop-up
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}

