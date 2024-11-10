import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CycleEntryForm = ({ date, onSave, onUpdate, onDelete, onCancel, existingData }) => {
  const [flowIntensity, setFlowIntensity] = useState(existingData?.flow_intensity || 'none');
  const [symptoms, setSymptoms] = useState(existingData?.symptoms || {});
  const [notes, setNotes] = useState(existingData?.notes || '');

  const handleSubmit = () => {
    const entryData = {
      date,
      flow_intensity: flowIntensity,
      symptoms,
      notes
    };

    if (existingData) {
      onUpdate(existingData.id, entryData);
    } else {
      onSave(entryData);
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={flowIntensity}
        onValueChange={setFlowIntensity}
        style={styles.picker}
      >
        <Picker.Item label="None" value="none" />
        <Picker.Item label="Light" value="light" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Heavy" value="heavy" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={handleSubmit} />
        <Button title="Cancel" onPress={onCancel} color="gray" />
        {existingData && (
          <Button title="Delete" onPress={() => onDelete(existingData.id)} color="red" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default CycleEntryForm;