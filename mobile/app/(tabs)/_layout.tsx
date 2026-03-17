import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '@/constants/theme';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'הגדרות',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'מפה',
          tabBarIcon: ({ color }) => <TabIcon emoji="🗺️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'מועדפים',
          tabBarIcon: ({ color }) => <TabIcon emoji="⭐" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'בית',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
    </Tabs>
  );
}
