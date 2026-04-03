import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchDayDetails, fetchPeriod, insertNewPeriodDayIntoDaysTable, insertNewPeriodDayIntoPeriodDaysTable, insertNewPeriodIntoPeriodsTable, setEndDate } from "@/db/calendar-queries";
import { log } from '@/utils/logger';
import { useEffect, useState } from 'react';
import { PeriodEntry } from '@/types/calendar-types';
import { INTENSITY_OPTIONS } from '@/types/ui-style-constants';
import { convertISOStringDateToPrintableDate } from '../../utils/utils';

export default function LogPeriodScreen() {
  const router = useRouter();
  // 'date' and 'userId' come from the Home screen via the URL
  const { selectedDate, userId } = useLocalSearchParams<{ selectedDate: string, userId: string }>();

  // states
  const [isSaving, setIsSaving] = useState(false);
  const [periodEntry, setEntry] = useState<PeriodEntry>({
    intensity: null,
    symptoms: [],
    notes: "",
  });

  // retrieve day details to visualize currently logged details in LogPeriodScreen
  useEffect(() => {
    async function loadData() {
      const data = await fetchDayDetails(userId, selectedDate);
      
      if (data) {
        setEntry({
          // Access nested data through the relation names
          intensity: data.periodDayInfo?.intensity ?? null,
          
          // Map the symptoms array to just a list of names/IDs
          symptoms: data.symptoms.map(s => s.symptom),
          
          // Get the first note if it exists (assuming one note per day)
          notes: data.notes[0]?.note ?? "",
        });
      }
    }
    loadData();
  }, [selectedDate, userId]);

  const updateIntensity = (val: any) => {
    setEntry(prev => ({ ...prev, intensity: val }));
  };

  const isItemSelected = (type: 'intensity' | 'symptom', value: any) => {
    if (type === 'intensity') return periodEntry.intensity === Number(value);
    if (type === 'symptom') return periodEntry.symptoms.includes(value);
    return false;
  }

  console.log("SelectedDate is: ", selectedDate);
  async function addPeriodEntry() {
    if (isSaving || !periodEntry.intensity) {
      alert("Please select an intensity first!");
      log.warn("No intensity selected. Unable to create periodEntry.");
      return;
    }
    setIsSaving(true);

    try {
       const [periodId, startDate] = await fetchPeriod(selectedDate, userId);

       if (!periodId) {
        // no active period, create a new one
        const resultPeriodsTable = await insertNewPeriodIntoPeriodsTable(userId, selectedDate);
        const insertedPeriodEntry = resultPeriodsTable?.at(0);

        if (!insertedPeriodEntry) { log.error("Insertion of new periodEntry to periods Table failed."); throw new Error("Insert failed"); }
        await insertNewPeriodDayIntoDaysTable(userId, selectedDate);
        await insertNewPeriodDayIntoPeriodDaysTable(userId, selectedDate, insertedPeriodEntry.periodId, periodEntry.intensity);
    
       } else {
        // there is an active period, add new periodEntry to current period, if period already had an endDate, update endDate to selectedDate
        await setEndDate(userId, periodId, selectedDate);
        await insertNewPeriodDayIntoDaysTable(userId, selectedDate);
        await insertNewPeriodDayIntoPeriodDaysTable(userId, selectedDate, periodId, periodEntry.intensity);
       }

       router.back(); // Close the modal when done
    } catch (e) {
       log.error("Failed to log period:", e);
       alert("Could not save entry. Please try again.");
       setIsSaving(false); // Reset so user can try again
    }
  }

  // separate container for each section --> one View per section 
  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER WITH CANCEL */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Current Period Entry</Text>
            <Text style={styles.dateSubtitle}>{convertISOStringDateToPrintableDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>


        {/* INTENSITY OPTIONS */}
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityTitle}>Flow Intensity</Text>
          <View style={styles.intensityDotsRow}>
            {INTENSITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => updateIntensity(opt.value)}
                disabled={isSaving}
                style={[
                  styles.intensityButton,
                  { backgroundColor: opt.color },
                  isItemSelected('intensity', opt.value) && styles.activeButton,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.intensityButtonText}>{opt.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER SAVE BUTTON */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={() => addPeriodEntry()}
          disabled={isSaving}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#ffffffaf' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 30 
  },
  title: { fontSize: 24, fontWeight: '700' },
  cancelText: { color: '#007AFF', fontSize: 16, marginTop: 6 },
  dateSubtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  intensityContainer: {
    backgroundColor: '#f0f0f4',
    padding: 12,
    borderRadius: 24,
    alignSelf: 'stretch',
    marginHorizontal: -8,
  },
  intensityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    marginBottom: 14,
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  intensityDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityButton: {
    height: 70,
    width: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    height: 50,
    width: 200,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  activeButton: {
    borderWidth: 4,
    borderColor: '#000',
  },
});
