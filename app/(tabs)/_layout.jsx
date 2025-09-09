import { Tabs } from 'expo-router';
import StompProvider from 'lib/StompProvider';
import { renderTabIcon, TABS_META } from 'navigation/tabs';

function _layout() {
    return (
        <StompProvider>
            <Tabs
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarActiveTintColor: "#3b82f6",
                    tabBarInactiveTintColor: "gray",
                    tabBarStyle: { backgroundColor: "white" },
                    tabBarLabelStyle: { fontSize: 12 },
                    tabBarHideOnKeyboard: true,
                    tabBarIcon: renderTabIcon(route.name),
                })}
            >
                {Object.entries(TABS_META).map(([name, meta]) => (
                    <Tabs.Screen key={name} name={name} options={{ title: meta.title }} />
                ))}
            </Tabs>
        </StompProvider>
    );
}

export default _layout;