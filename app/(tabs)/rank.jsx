import { StyleSheet, Text, View } from 'react-native';

export default function RankScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Rank Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    text: {
        color: '#fff',
    },
});
