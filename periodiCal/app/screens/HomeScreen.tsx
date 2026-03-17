import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Dimensions, FlatList } from 'react-native';
import { CalendarView } from '@/components/CalendarView';
import { getDaysInMonth } from '@/utils/build-calendar';
import { CalendarService } from '@/services/calendar-service';
import { CalendarDay } from '@/types/calendar';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { DayDetailModal } from '@/components/DayDetailModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [months, setMonths] = useState<{ date: Date; days: CalendarDay[] }[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const userId = 'user-123';
  
  const flatListRef = useRef<FlatList>(null);

  // Generate a range of months (e.g., 12 months before and after today)
  useEffect(() => {
    const today = new Date();
    const initialMonths = [];
    for (let i = -12; i <= 12; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        initialMonths.push({ date: d, days: [] });
    }
    setMonths(initialMonths);
  }, []);

  const loadMonthData = useCallback(async (index: number) => {
    if (!months[index]) return;
    
    const { date } = months[index];
    const month = date.getMonth();
    const year = date.getFullYear();
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

      setMonths(prev => {
          const newMonths = [...prev];
          newMonths[index] = { ...newMonths[index], days: mergedDays };
          return newMonths;
      });
    } catch (error) {
      console.error('Failed to load month data:', error);
      setMonths(prev => {
          const newMonths = [...prev];
          newMonths[index] = { ...newMonths[index], days: baseDays.map(d => ({ ...d })) };
          return newMonths;
      });
    }
  }, [months, userId]);

  const handleSelectDay = (day: CalendarDay) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const handleSaveDayData = async (updatedDay: CalendarDay) => {
    try {
      await CalendarService.updateDayData(userId, updatedDay.date, {
        isPeriodDay: updatedDay.isPeriodDay || false,
        intensity: updatedDay.intensity ?? null,
        symptoms: updatedDay.symptoms || [],
      });
      
      // Refresh only the affected months
      // Finding the index of the month that contains the updated day
      const date = new Date(updatedDay.date);
      const monthIndex = months.findIndex(m => 
        m.date.getMonth() === date.getMonth() && m.date.getFullYear() === date.getFullYear()
      );
      if (monthIndex !== -1) loadMonthData(monthIndex);
      
    } catch (error) {
      console.error('Failed to save day data:', error);
    }
  };

  const renderMonth = ({ item, index }: { item: typeof months[0], index: number }) => {
      // Lazy load data if not present
      if (item.days.length === 0) {
          loadMonthData(index);
          return (
              <View style={[styles.calendarWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                  <ThemedText>Loading...</ThemedText>
              </View>
          );
      }
      
      return (
          <View style={styles.calendarWrapper}>
              <CalendarView 
                days={item.days} 
                onSelectDay={handleSelectDay} 
                currentDate={item.date}
              />
          </View>
      );
  };

  return (
    <ThemedView style={styles.container}>
        <View style={styles.heroSection}>
          <ThemedText style={styles.greeting}>Hello!</ThemedText>
          <ThemedText style={styles.subtitle}>Track your cycle with periodiCal</ThemedText>
        </View>

        <FlatList
            ref={flatListRef}
            data={months}
            renderItem={renderMonth}
            keyExtractor={(item) => item.date.toISOString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={12} // Start at "Today"
            getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
            })}
        />

        <View style={styles.legend}>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#FF4D4D' }]} />
                <ThemedText style={styles.legendText}>Period</ThemedText>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#FFF', borderColor: '#FF4D4D', borderWidth: 2 }]} />
                <ThemedText style={styles.legendText}>Today</ThemedText>
            </View>
        </View>

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
    paddingTop: 60,
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
  calendarWrapper: {
    width: width,
    paddingTop: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 40,
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
