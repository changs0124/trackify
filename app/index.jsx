import { Redirect } from 'expo-router';

function index() {
    return <Redirect href="/(tabs)" />;
}

export default index;