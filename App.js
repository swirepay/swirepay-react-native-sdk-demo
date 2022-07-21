import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';

import Payment from '@swirepay/swirepay-react-native-sdk/components/paymentPage';
import Success from '@swirepay/swirepay-react-native-sdk/components/successPage';
import Failed from '@swirepay/swirepay-react-native-sdk/components/failedPage';

const paymentInfo = {
  amount: 101,
  email: 'test@mail.com',
  name: 'test',
  phone: '+919940274492',
  publicKey: 'sk_test_9xNkBiAf87Dlg3Vn1KfeGpDAtmgxzxlj',
  test: true,
};

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Payment">
          <Stack.Screen name="Payment" options={{title: 'Payment'}}>
            {props => <Payment {...props} paymentInfo={paymentInfo} />}
          </Stack.Screen>
          <Stack.Screen name="Success" component={Success} />
          <Stack.Screen name="Failed" component={Failed} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
