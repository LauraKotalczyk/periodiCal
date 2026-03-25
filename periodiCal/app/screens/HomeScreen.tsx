import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CalendarView from "@/components/CalendarView"; // Adjust path
import { Button } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Pass the selectedDate and the setter to the Calendar */}
      <CalendarView
        userId="test-user-66"
        selectedDate={selectedDate} 
        onDayPress={(date: string) => setSelectedDate(date)} 
      />

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push({
          pathname: "/screens/LogPeriodScreen",
          params: { selectedDate, userId: "test-user-66" }
        })}
      >
        <Text style={styles.addButtonText}>Log Period</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f3f4f6',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#eb258f', // pink
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});