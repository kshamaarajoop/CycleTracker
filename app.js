import React from 'react';
import { View, StyleSheet } from 'react-native';
import cycleTrackingModule from './cycleTrackingModule';

const App = () => {
  // Mock user ID for testing - you would normally get this from authentication
  const mockUserId = "test-user-1";

  return (
    <View style={styles.container}>
      <CycleTrackingFeature userId={mockUserId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50, // Add some padding at the top for better spacing
  },
});

export default App;