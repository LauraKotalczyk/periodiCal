import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { fillCalendarGridWithDatabaseResults } from "@/services/calendar-service";
import { CalendarDay, CalendarViewProps } from "@/types/calendar-types";
import { DayCell } from "./DayCell"; // Make sure DayCell is also updated to use View/Text!

export default function CalendarView({ userId, selectedDate, onDayPress }: CalendarViewProps) {
  const [viewingDate, setViewingDate] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initCalendar = useCallback(async () => {
    setIsLoading(true);
    const data = await fillCalendarGridWithDatabaseResults(viewingDate, userId);
    setDays(data);
    setIsLoading(false);
  }, [viewingDate, userId]);

  useFocusEffect(
    useCallback(() => {
      initCalendar();
    }, [initCalendar])
  );

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={{ marginTop: 10 }}>Loading Calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {viewingDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Weekday Labels Row */}
      <View style={styles.weekdayLabelsRow}>
        {weekdays.map(wd => (
          <View key={wd} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.grid}>
        {days.map(day => (
          <DayCell key={day.dateString} day={day} 
          isSelected={day.dateString === selectedDate}
          onPress={() => onDayPress(day.dateString)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 12,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // More transparent for "Liquid Glass"
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle highlight edge
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Android Shadow
    elevation: 3,
  },
  loadingContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'System',
    letterSpacing: 0.35,
  },
  weekdayLabelsRow: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  weekdayCell: {
    width: '14.285%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8e8e93', // Apple secondary label color
    textTransform: 'none',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
});
