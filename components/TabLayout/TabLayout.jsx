import { ScrollView } from "react-native-gesture-handler";

function TabLayout({ children }) {
    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {children}
        </ScrollView>
    );
}

export default TabLayout;