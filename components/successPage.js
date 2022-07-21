import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {Appbar, Text} from 'react-native-paper';
import SuccessImg from '../assets/images/success.png';

const Success = props => {
  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Appbar.Header style={{backgroundColor: '#0A2D77'}}>
            <Appbar.Content title="Payment Successful" style={{fontSize: 16}} />
            <Appbar.Action />
            <Appbar.Action />
            <Appbar.Action />
          </Appbar.Header>
        </ScrollView>
      </SafeAreaView>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{fontWeight: '700', fontSize: 24, marginBottom: 10}}>
          Thanks
        </Text>
        <Text style={{fontWeight: '600', fontSize: 20, marginBottom: 20}}>
          Payment of {props.route.params.data.entity.amount} Successful. Receipt
          is {props.route.params.data.entity.receiptNumber}
        </Text>
        <Image source={SuccessImg} />
        <Text
          style={{
            fontWeight: '400',
            fontSize: 13,
            marginTop: 20,
            color: '#858585',
          }}>
          Please wait while we redirect...
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Payment')}>
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: '#3E8BFF',
            }}>
            Click here if not automatically redirected
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Success;
