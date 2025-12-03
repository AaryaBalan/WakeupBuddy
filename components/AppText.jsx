
import { Text } from 'react-native';

export default function AppText({ children, style, ...props }) {
    return (
        <Text
            style={[{ fontFamily: 'Montserrat_400Regular' }, style]}
            allowFontScaling={false}
            {...props}
        >
            {children}
        </Text>
    );
}
