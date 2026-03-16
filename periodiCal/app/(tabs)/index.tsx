import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { CalendarView } from '@/components/CalendarView';
import { getDaysInMonth } from '@/utils/build-calendar';
import { CalendarService } from '@/services/calendar-service';
import { CalendarDay } from '@/types/calendar';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { DayDetailModal } from '@/components/DayDetailModal';

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const userId = 'user-123'; // Temporary hardcoded user ID

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const baseDays = getDaysInMonth(year, month);
    
    const startDate = baseDays[0].date;
    const endDate = baseDays[baseDays.length - 1].date;

    try {
      const dbData = await CalendarService.getDays(userId, startDate, endDate);
      
      const mergedDays = baseDays.map(day => {
        const matchingDbDay = dbData.find(d => d.date === day.date);
        return {
          ...day,
          isPeriodDay: matchingDbDay?.isPeriodDay || false,
          intensity: matchingDbDay?.intensity,
          symptoms: matchingDbDay?.symptoms || [],
        };
      });

      setCalendarDays(mergedDays);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setCalendarDays(baseDays.map(d => ({ ...d })));
    }
  };

  const handleSelectDay = (day: CalendarDay) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSaveDayData = async (updatedDay: CalendarDay) => {
    try {
      await CalendarService.updateDayData(userId, updatedDay.date, {
        isPeriodDay: updatedDay.isPeriodDay || false,
        intensity: updatedDay.intensity ?? null,
        symptoms: updatedDay.symptoms || [],
      });
      await loadCalendarData(); // Refresh UI
    } catch (error) {
      console.error('Failed to save day data:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <ThemedText style={styles.greeting}>Hello!</ThemedText>
          <ThemedText style={styles.subtitle}>Track your cycle with periodiCal</ThemedText>
        </View>
        
        <CalendarView 
          days={calendarDays} 
          onSelectDay={handleSelectDay} 
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          currentDate={currentDate}
        />

        <View style={styles.legend}>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
                <ThemedText style={styles.legendText}>Period</ThemedText>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#FFE5E5', borderColor: '#FF4D4D', borderWidth: 1 }]} />
                <ThemedText style={styles.legendText}>Predicted</ThemedText>
            </View>
        </View>
      </ScrollView>

      <DayDetailModal 
        visible={modalVisible}
        day={selectedDay}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveDayData}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  }
});
