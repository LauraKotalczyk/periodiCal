import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { fetchPeriod, insertNewPeriodDayIntoDaysTable, insertNewPeriodDayIntoPeriodDaysTable, insertNewPeriodIntoPeriodsTable, setEndDate } from "@/db/calendar-queries";
import { log } from '@/utils/logger';
import { useState } from 'react';

export default function LogPeriodScreen() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // 'date' and 'userId' come from the Home screen via the URL
  const { selectedDate, userId } = useLocalSearchParams<{ selectedDate: string, userId: string }>();
  console.log("SelectedDate is: ", selectedDate);
  async function addPeriodEntry(intensity: number) {
    if (isSaving) return; // Prevent double taps
    setIsSaving(true);

    try {
       const [periodId, startDate] = await fetchPeriod(selectedDate, userId);

       if (!periodId) {
        // no active period, create a new one
        const resultPeriodsTable = await insertNewPeriodIntoPeriodsTable(userId, selectedDate);
        const insertedPeriodEntry = resultPeriodsTable?.at(0);

        if (!insertedPeriodEntry) { log.error("Insertion of new periodEntry to periods Table failed."); throw new Error("Insert failed"); }
        await insertNewPeriodDayIntoDaysTable(userId, selectedDate);
        await insertNewPeriodDayIntoPeriodDaysTable(userId, selectedDate, insertedPeriodEntry.periodId, intensity);
    
       } else {
        // there is an active period, add new periodEntry to current period, if period already had an endDate, update endDate to selectedDate
        await setEndDate(userId, periodId, selectedDate);
        await insertNewPeriodDayIntoDaysTable(userId, selectedDate);
        await insertNewPeriodDayIntoPeriodDaysTable(userId, selectedDate, periodId, intensity);
       }

       router.back(); // Close the modal when done
    } catch (e) {
       log.error("Failed to log period:", e);
       alert("Could not save entry. Please try again.");
       setIsSaving(false); // Reset so user can try again
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER WITH CANCEL */}
      <View style={styles.header}>
        <Text style={styles.title}>Log Flow</Text>
        <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateSubtitle}>Date: {selectedDate}</Text>

      {/* INTENSITY OPTIONS */}
      <View style={styles.buttonContainer}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity 
            key={opt.value}
            onPress={() => addPeriodEntry(opt.value)}
            disabled={isSaving}
            style={[styles.button, { backgroundColor: opt.color }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{opt.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// 3. UI STYLE CONSTANTS
const OPTIONS = [
  { label: 'Spotting', value: 1, color: '#f8bbd0' },
  { label: 'Light', value: 2, color: '#f06292' },
  { label: 'Medium', value: 3, color: '#e91e63' },
  { label: 'Heavy', value: 4, color: '#880e4f' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700' },
  cancelText: { color: '#007AFF', fontSize: 16 },
  dateSubtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  buttonContainer: { gap: 12 },
  button: { 
    height: 60, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});