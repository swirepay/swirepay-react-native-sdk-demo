import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {Appbar, Text, Button} from 'react-native-paper';
import FailedImg from '../assets/images/failed.png';

const Failed = props => {
  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Appbar.Header style={{backgroundColor: '#0A2D77'}}>
            <Appbar.Content title="Payment Failed" style={{fontSize: 16}} />
            <Appbar.Action />
            <Appbar.Action />
            <Appbar.Action />
          </Appbar.Header>
        </ScrollView>
      </SafeAreaView>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{fontWeight: '700', fontSize: 24, marginBottom: 10}}>
          Sorry
        </Text>
        <Text style={{fontWeight: '600', fontSize: 20, marginBottom: 20}}>
          Payment Failed
        </Text>
        <Image source={FailedImg} />
        <Text
          style={{
            fontWeight: '400',
            fontSize: 13,
            marginTop: 20,
            color: '#858585',
          }}>
          Due to some unknown issues your payment is failed.
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Button
          mode="contained"
          style={{backgroundColor: '#3E8BFF'}}
          onPress={() => props.navigation.navigate('Payment')}>
          Try Again
        </Button>
        <TouchableOpacity onPress={() => props.navigation.navigate('Payment')}>
          <Text
            style={{
              fontWeight: '400',
              fontSize: 14,
              color: '#3E8BFF',
              marginTop: 20,
            }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Failed;
