import { ScrollView } from "react-native";

function TabLayout({ children }) {
    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {children}
        </ScrollView>
    );
}

export default TabLayout;