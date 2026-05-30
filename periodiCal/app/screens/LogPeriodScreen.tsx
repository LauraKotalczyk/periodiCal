import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deletePeriodDay, fetchDayDetails, fetchPeriod, insertNewPeriodDayIntoDaysTable, insertNewPeriodDayIntoPeriodDaysTable, insertNewPeriodIntoPeriodsTable, setEndDate } from "@/services/db-query-service";
import { log } from '@/utils/logger';
import { useEffect, useState } from 'react';
import { PeriodEntry } from '@/types/calendar-types';
import { INTENSITY_OPTIONS, SYMPTOMS_OPTIONS } from '@/types/ui-style-constants';
import { convertISOStringDateToPrintableDate } from '../../utils/utils';
import { CircleCheckBig } from 'lucide-react-native';

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
          symptoms: data.symptoms.map((s: any) => s.symptom),

          // Get the first note if it exists (assuming one note per day)
          notes: data.notes[0]?.note ?? "",
        });
      }
    }
    loadData();
  }, [selectedDate, userId]);

  const updateIntensity = (val: any) => {
    setEntry(prev => ({ ...prev, intensity: prev.intensity === val ? null : val }));
  };

  const updateSymptom = (val: any) => {
    let updatedSymptomsList; 

    if (periodEntry.symptoms.includes(val)) {
      // If it's already there, create a list WITHOUT this value
      updatedSymptomsList = periodEntry.symptoms.filter(s => s !== val);
    } else {
      // If it's NOT there, create a list WITH this value added
      updatedSymptomsList = [...periodEntry.symptoms, val];
    }

    // Tell React to update the state so the screen refreshes
    setEntry({
      ...periodEntry,
      symptoms: updatedSymptomsList
    });
  };

  const isItemSelected = (type: 'intensity' | 'symptom', value: any) => {
    if (type === 'intensity') return periodEntry.intensity === Number(value);
    if (type === 'symptom') return periodEntry.symptoms.includes(value);
    return false;
  }

  console.log("SelectedDate is: ", selectedDate);
  async function addPeriodEntry() {
    if (isSaving) return;
    
    setIsSaving(true);

    try {
      if (!periodEntry.intensity) {
        // If intensity is null, we want to remove the period day entry
        await deletePeriodDay(userId, selectedDate);
        
        router.back();
        return;
      }

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
            {INTENSITY_OPTIONS.map((opt) => {
              const isSelected = isItemSelected('intensity', opt.value);
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => updateIntensity(opt.value)}
                  disabled={isSaving}
                  style={[
                    styles.intensityButton,
                    { backgroundColor: opt.color },
                    isSelected && styles.activeButton,
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      {isSelected && (
                        <View style={[styles.checkIconBadge, { borderColor: opt.color }]}>
                          <CircleCheckBig size={16} color={opt.color} strokeWidth={4}/>
                        </View>
                      )}
                      <Text style={styles.intensityButtonText}>{opt.label}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SYMPTOMS */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.symptomTitle}>Symptoms</Text>
          <View style={styles.symptomsDotsGrid}>
            {SYMPTOMS_OPTIONS.map((opt) => {
              const isSelected = isItemSelected('symptom', opt.value);
             return (<TouchableOpacity
                key={opt.value}
                onPress={() => updateSymptom(opt.value)}
                disabled={isSaving}
                style={[
                  styles.symptomButton,
                  { backgroundColor: opt.color },
                  isSelected && styles.activeSymptomButton,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    {isSelected && (
                      <View style={[styles.checkIconBadge, { borderColor: opt.color }]}>
                        <CircleCheckBig size={16} color={opt.color} strokeWidth={4}/>
                      </View>
                    )}
                    <Text style={styles.symptomButtonText}>{opt.label}</Text>
                  </>
                )}
              </TouchableOpacity>
             );
          })}
          </View>
        </View>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { 
    flex: 1, 
    backgroundColor: '#ffffffaf',
  },
  scrollContent: { 
    padding: 24, 
    paddingBottom: 100,
    gap: 20
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 30 
  },
  title: { fontSize: 24, fontWeight: '700' },
  cancelText: { color: '#007AFF', fontSize: 17, marginTop: 6 },
  dateSubtitle: { fontSize: 17, color: '#666', marginTop: 4 },
  intensityContainer: {
    backgroundColor: '#f0f0f4',
    padding: 12,
    borderRadius: 24,
    alignSelf: 'stretch',
    marginHorizontal: -8,
  },
  intensityTitle: {
    fontSize: 16,
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
    position: 'relative',
  },
  intensityButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    elevation: 4,
  },
  symptomsContainer: {
    backgroundColor: '#f0f0f4',
    padding: 12,
    borderRadius: 24,
    alignSelf: 'stretch',
    marginHorizontal: -8,
  },
  symptomsDotsGrid: {
    flexDirection: 'row', // Horizontal layout
    flexWrap: 'wrap',     // Allows jumping to the next line
    gap: 10,
    flexGrow: 1,
    position: 'relative',
  },
  symptomButton: {
    flexGrow: 1,          // This tells the bubble to expand to fill empty space
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28%',      // Ensures at least 3 items per row usually
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative', // Added for absolute positioning of checkmark
  },
  symptomButtonText: {
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  activeSymptomButton: {
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)', // Soft dark overlay
    elevation: 4,
  },
  checkIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff', // White background for a softer, cleaner look
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
    borderWidth: 2,
  },
   symptomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    marginBottom: 14,
    marginLeft: 6,
    letterSpacing: 0.8,
  },
});
