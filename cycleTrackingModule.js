import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text,
  ActivityIndicator
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import CycleEntryForm from './components/CycleEntryForm';
import CycleInsights from './components/CycleInsights';
import { cycleTrackingService } from '../api/services/cycleTrackingService';

const CycleTrackingFeature = ({ userId }) => {
  const [showEntryForm, setShowEntryForm] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [cycleData, setCycleData] = React.useState([]);
  const [predictions, setPredictions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Load initial data
  const loadCycleData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [cycleEntries, cyclePredictions] = await Promise.all([
        cycleTrackingService.getUserCycleData(userId),
        cycleTrackingService.getCyclePredictions(userId)
      ]);
      
      setCycleData(cycleEntries);
      setPredictions(cyclePredictions);
    } catch (err) {
      setError('Failed to load cycle data. Please try again.');
      console.error('Error loading cycle data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadCycleData();
  }, [loadCycleData]);

  const handleSaveEntry = async (entryData) => {
    try {
      setError(null);
      const savedEntry = await cycleTrackingService.addCycleEntry(userId, {
        ...entryData,
        date: selectedDate
      });
      
      setCycleData(prev => [...prev, savedEntry]);
      
      // Refresh predictions after new entry
      const newPredictions = await cycleTrackingService.getCyclePredictions(userId);
      setPredictions(newPredictions);
      
      setShowEntryForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save entry. Please try again.');
      console.error('Error saving cycle data:', err);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      setError(null);
      await cycleTrackingService.deleteCycleEntry(userId, entryId);
      setCycleData(prev => prev.filter(entry => entry.id !== entryId));
      
      // Refresh predictions after deletion
      const newPredictions = await cycleTrackingService.getCyclePredictions(userId);
      setPredictions(newPredictions);
    } catch (err) {
      setError('Failed to delete entry. Please try again.');
      console.error('Error deleting cycle entry:', err);
    }
  };

  const handleUpdateEntry = async (entryId, updatedData) => {
    try {
      setError(null);
      const updated = await cycleTrackingService.updateCycleEntry(userId, entryId, updatedData);
      setCycleData(prev => prev.map(entry => 
        entry.id === entryId ? updated : entry
      ));
      
      // Refresh predictions after update
      const newPredictions = await cycleTrackingService.getCyclePredictions(userId);
      setPredictions(newPredictions);
      
      setShowEntryForm(false);
    } catch (err) {
      setError('Failed to update entry. Please try again.');
      console.error('Error updating cycle entry:', err);
    }
  };

  const getMarkedDates = () => {
    const marked = {};
    
    // Mark recorded dates
    cycleData.forEach(entry => {
      marked[entry.date] = {
        marked: true,
        dotColor: '#FF69B4',
        selected: selectedDate === entry.date
      };
    });

    // Mark predicted dates
    predictions.forEach(prediction => {
      if (!marked[prediction.date]) {
        marked[prediction.date] = {
          marked: true,
          dotColor: '#FFA6C9', // Lighter pink for predictions
        };
      }
    });

    return marked;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={day => {
            setSelectedDate(day.dateString);
            setShowEntryForm(true);
          }}
          markedDates={getMarkedDates()}
          theme={{
            selectedDayBackgroundColor: '#FF69B4',
            todayTextColor: '#FF69B4',
            arrowColor: '#FF69B4',
          }}
        />
      </View>

      {showEntryForm && (
        <CycleEntryForm
          date={selectedDate}
          onSave={handleSaveEntry}
          onUpdate={handleUpdateEntry}
          onDelete={handleDeleteEntry}
          onCancel={() => setShowEntryForm(false)}
          existingData={cycleData.find(entry => entry.date === selectedDate)}
        />
      )}

      <CycleInsights data={cycleData} predictions={predictions} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE4E1',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
  }
});

export default CycleTrackingFeature;