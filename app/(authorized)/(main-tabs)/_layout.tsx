import { Tabs } from 'expo-router';
import TabBar from 'components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Nearby',
          title: 'Nearby Places',
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          tabBarLabel: 'Invoices',
          title: 'My Invoices',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          title: 'My Profile',
        }}
      />
    </Tabs>
  );
}
