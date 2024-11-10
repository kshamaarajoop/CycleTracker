import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CycleInsights = ({ data, predictions }) => {
  const calculateAverageCycleLength = () => {
    if (data.length < 2) return 'Not enough data';
    
    let totalDays = 0;
    let cycles = 0;
    
    for (let i = 1; i < data.length; i++) {
      const currentDate = new Date(data[i].date);
      const prevDate = new Date(data[i-1].date);
      const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        totalDays += diffDays;
        cycles++;
      }
    }
    
    return cycles > 0 ? Math.round(totalDays / cycles) : 'Not enough data';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cycle Insights</Text>
      
      <View style={styles.insightCard}>
        <Text style={styles.label}>Average Cycle Length:</Text>
        <Text style={styles.value}>{calculateAverageCycleLength()} days</Text>
      </View>
      
      <View style={styles.insightCard}>
        <Text style={styles.label}>Next Predicted Cycle:</Text>
        <Text style={styles.value}>
          {predictions.length > 0 ? predictions[0].date : 'Not enough data'}
        </Text>
      </View>
      
      <View style={styles.insightCard}>
        <Text style={styles.label}>Total Tracked Cycles:</Text>
        <Text style={styles.value}>{data.length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default CycleInsights;