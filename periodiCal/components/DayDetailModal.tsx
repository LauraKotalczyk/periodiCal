import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarDay } from '@/types/calendar';

interface DayDetailModalProps {
  day: CalendarDay | null;
  visible: boolean;
  onClose: () => void;
  onSave: (day: CalendarDay) => void;
}

const INTENSITIES = [
  { label: 'Spotting', value: 0 },
  { label: 'Low', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'High', value: 3 },
];

const COMMON_SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Acne', 'Fatigue', 'Mood Swings'];

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ day, visible, onClose, onSave }) => {
  const [isPeriod, setIsPeriod] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Initialize state when day changes
  React.useEffect(() => {
    if (day) {
      setIsPeriod(day.isPeriodDay || false);
      setIntensity(day.intensity ?? null);
      setSelectedSymptoms(day.symptoms || []);
    }
  }, [day]);

  if (!day) return null;

  const handleSave = () => {
    onSave({
      ...day,
      isPeriodDay: isPeriod,
      intensity: isPeriod ? intensity : null,
      symptoms: selectedSymptoms,
    });
    onClose();
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{day.date}</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText style={styles.closeButton}>Cancel</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea}>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Menstruation</ThemedText>
              <Pressable 
                style={[styles.toggleButton, isPeriod && styles.activeToggle]} 
                onPress={() => setIsPeriod(!isPeriod)}
              >
                <ThemedText style={[styles.toggleText, isPeriod && styles.activeToggleText]}>
                  {isPeriod ? "Period Day" : "Not a Period Day"}
                </ThemedText>
              </Pressable>
            </View>

            {isPeriod && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Flow Intensity</ThemedText>
                <View style={styles.intensityContainer}>
                  {INTENSITIES.map((opt) => (
                    <Pressable 
                      key={opt.value}
                      style={[styles.chip, intensity === opt.value && styles.activeChip]}
                      onPress={() => setIntensity(opt.value)}
                    >
                      <ThemedText style={[styles.chipText, intensity === opt.value && styles.activeChipText]}>
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Symptoms</ThemedText>
              <View style={styles.symptomsGrid}>
                {COMMON_SYMPTOMS.map((s) => (
                  <Pressable 
                    key={s}
                    style={[styles.chip, selectedSymptoms.includes(s) && styles.activeSymptomChip]}
                    onPress={() => toggleSymptom(s)}
                  >
                    <ThemedText style={[styles.chipText, selectedSymptoms.includes(s) && styles.activeChipText]}>
                      {s}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    color: '#666',
    fontSize: 16,
  },
  scrollArea: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#FF4D4D',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeToggleText: {
    color: '#FFF',
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF4D4D',
  },
  activeSymptomChip: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF4D4D',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  activeChipText: {
    color: '#FF4D4D',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
