import { SafeAreaView, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { install } from 'react-native-quick-crypto';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Wallet from './Wallet';
import Social from './Social';
import Browser from './Browser';

install();
const Tab = createBottomTabNavigator();

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  };

  return (
    <NavigationContainer>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Tab.Navigator>
          <Tab.Screen name="Browser" component={Browser} />
          <Tab.Screen name="Wallet" component={Wallet} />
          <Tab.Screen name="Social" component={Social} />
        </Tab.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

