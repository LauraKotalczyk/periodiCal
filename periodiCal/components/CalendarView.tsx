import React from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { CalendarDay } from '@/types/calendar';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - 48) / 7;

interface CalendarViewProps {
  days: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  currentDate: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  days, 
  onSelectDay, 
  onPrevMonth, 
  onNextMonth, 
  currentDate 
}) => {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>{"<"}</ThemedText>
        </Pressable>
        <ThemedText style={styles.monthTitle}>{monthName} {year}</ThemedText>
        <Pressable onPress={onNextMonth} style={styles.navButton}>
          <ThemedText style={styles.navButtonText}>{">"}</ThemedText>
        </Pressable>
      </View>
      
      <View style={styles.weekHeader}>
        {weekDays.map((day, index) => (
          <ThemedText key={index} style={styles.weekDayText}>{day}</ThemedText>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((day) => (
          <Pressable
            key={day.date}
            style={[
              styles.dayContainer,
              day.isPeriodDay && styles.periodDay,
              !day.isCurrentMonth && styles.notCurrentMonth,
              day.isToday && styles.todayMarker
            ]}
            onPress={() => onSelectDay(day)}
          >
            <ThemedText 
              style={[
                styles.dayText,
                day.isPeriodDay && styles.periodDayText,
                !day.isCurrentMonth && styles.notCurrentMonthText
              ]}
            >
              {day.dayOfMonth}
            </ThemedText>
            {day.isPeriodDay && <View style={styles.periodIndicator} />}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE + 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  periodDay: {
    backgroundColor: '#FF4D4D',
    borderRadius: 12,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  periodDayText: {
    color: '#FFF',
    fontWeight: '700',
  },
  notCurrentMonth: {
    opacity: 0.3,
  },
  notCurrentMonthText: {
    color: '#CCC',
  },
  todayMarker: {
    borderWidth: 2,
    borderColor: '#FF4D4D',
    borderRadius: 12,
  },
  periodIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
    marginTop: 2,
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  }
});
