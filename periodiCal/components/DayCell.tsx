import { CalendarDay } from '@/types/calendar-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // Added TouchableOpacity

interface DayCellProps {
  day: CalendarDay;
  isSelected: boolean;   // Added
  onPress: () => void;   // Added
}

export function DayCell({ day, isSelected, onPress }: DayCellProps) { // Removed 'any'
  const isOuterMonth = !day.isCurrentMonth;
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={[
        styles.cell,
        // 1. Add background circle/highlight if this day is selected
        isSelected && styles.selectedCell 
      ]}
    >
      <Text style={[
        styles.dayText,
        isOuterMonth && styles.outerMonthText,
        day.isItToday && styles.todayText,
        // 2. Change text color if selected (e.g., to white)
        isSelected && styles.selectedDayText 
      ]}>
        {day.dayNumber}
      </Text>
      
      {/* 3. Keep your period dot, but hide it or change color if selected */}
      {day.isPeriodDay && (
        <View style={[
          styles.periodDot, 
          isOuterMonth && styles.outerMonthDot,
          isSelected && { backgroundColor: '#fff' } // White dot on selection background
        ]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '14.285%',
    height: 55,
    marginVertical: 2, // Added a tiny bit of vertical space
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,    // Added rounding for the selection highlight
  },
  // 4. Style for the selection circle/box
  selectedCell: {
    backgroundColor: '#eb258f', // Your pink theme color
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  dayText: {
    fontSize: 17,
    color: '#1a1a1a', 
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'System',
  },
  outerMonthText: {
    color: '#ccc',
    opacity: 0.6,
  },
  todayText: {
    color: '#e91e63',
    fontWeight: '800', 
  },
  periodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e91e63',
    position: 'absolute',
    bottom: 8,
  },
  outerMonthDot: {
    opacity: 0.3,
  }
});