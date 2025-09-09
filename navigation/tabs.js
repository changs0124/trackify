import { Ionicons } from "@expo/vector-icons";

export const TABS_META = {
    index: { title: "Home", icon: "home", iconOutline: "home-outline" },
    history: { title: "History", icon: "time", iconOutline: "time-outline" },
    job: { title: "Job", icon: "play-circle", iconOutline: "play-circle-outline" },
    info: { title: "Info", icon: "information-circle", iconOutline: "information-circle-outline" },
};

export function renderTabIcon(routeName) {
    return ({ color, size, focused }) => {
        const meta = TABS_META[routeName];
        return <Ionicons name={focused ? meta.icon : meta.iconOutline} size={size} color={color} />;
    };
}