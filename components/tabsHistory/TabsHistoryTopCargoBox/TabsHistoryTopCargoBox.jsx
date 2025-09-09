import { View } from 'react-native';
import { Chip } from 'react-native-paper';

function TabsHistoryTopCargoBox({ setCargoId, topCargoList }) {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {topCargoList.map(c => (
                <Chip key={c.id} icon="history" onPress={() => setCargoId(c.id)} style={{ flex: 1 }}>
                    {c.cargoName}
                </Chip>
            ))}
        </View>
    );
}

export default TabsHistoryTopCargoBox;