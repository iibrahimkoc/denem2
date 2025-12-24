import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import BootSplash from "react-native-bootsplash";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TempHomeScreen from './src/screens/HomeScreen/TempHomeScreen';

import { OneSignal, LogLevel } from 'react-native-onesignal';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import useDataStore from './src/store/useDataStore';

const ONESIGNAL_IOS_APP_ID= "4603bf1b-e304-480b-80b2-58594d103984"
const ONESIGNAL_ANDROID_APP_ID= "a14e4c59-0a37-4709-918e-824ad92b6540"


const Stack = createNativeStackNavigator();

const App = () => {

  const {setOneSignalId} = useDataStore();

  useEffect(() => {
    initializeOneSignal();
  }, []);

  const initializeOneSignal = async () => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);

      OneSignal.initialize(
        Platform.OS === 'android' ? ONESIGNAL_ANDROID_APP_ID : ONESIGNAL_IOS_APP_ID
      );

      await new Promise(resolve => setTimeout(resolve, 1500));

      OneSignal.Notifications.requestPermission(true);

      let subscriptionId = null;
      let attempts = 0;

      while (!subscriptionId && attempts < 10) {
        subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
        if (!subscriptionId) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (subscriptionId) {
        setOneSignalId(subscriptionId);
        console.log("subscriptionId:",subscriptionId)
      }

    } catch (error) {
      console.error('OneSignal error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer
        onReady={() => {
          BootSplash.hide();
        }}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="HomeScreen"
        >
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              animation: "fade",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default App
