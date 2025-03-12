import { View, Text, StyleSheet } from 'react-native';

export default function InvoicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoices</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
});
