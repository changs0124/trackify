import { SegmentedButtons } from 'react-native-paper';

function TabsIndexFilterButton({filter, setFilter}) {
    return (
        <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            buttons={[
                { value: "all", label: "All", labelStyle: { opacity: 0.8, fontSize: 16, fontWeight: "600" } },
                { value: "stable", label: "Stable", labelStyle: { opacity: 0.8, fontSize: 16, fontWeight: "600" } },
                { value: "working", label: "Working", labelStyle: { opacity: 0.8, fontSize: 16, fontWeight: "600" } },
            ]}
            style={{ opacity: 0.8 }}
        />
    );
}

export default TabsIndexFilterButton;