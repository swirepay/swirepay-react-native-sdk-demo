import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {
  List,
  Appbar,
  TextInput,
  Text,
  Button,
  Checkbox,
  ActivityIndicator,
} from 'react-native-paper';
import union from '../assets/images/Union.png';
import card from '../assets/images/Card.png';
import netBanking from '../assets/images/Bank.png';
import cardList from '../assets/images/cardLIst.png';
import swirepay from '../assets/images/swirepay.png';

const styles = StyleSheet.create({
  container: {
    textAlign: 'center',
    justifyContent: 'center',
  },
  scrollViewStyle: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  headingStyle: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 40,
  },
  payButton: {
    backgroundColor: '#3E8BFF',
    marginLeft: 50,
    marginRight: 50,
    fontWeight: 'bold',
    marginBottom: 20,
    fontSize: 18,
  },
  listItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'thistle',
    borderRadius: 10,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 18,
  },
});

const Payment = props => {
  const [checked, setChecked] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('');
  const [hasCardErrors, setHasCardErrors] = React.useState(false);
  const [expiry, setExpiry] = React.useState('');
  const [hasExpiryErrors, setHasExpiryErrors] = React.useState(false);
  const [cvv, setCvv] = React.useState('');
  const [hasCvvError, setCvvHasError] = React.useState(false);
  const [cardType, setCardType] = React.useState('');
  const [cardLength, setCardLength] = React.useState(16);
  const [loading, setLoading] = React.useState(false);

  const getEndpoints = function (test) {
    if (test) {
      return {
        gateway: 'https://staging-backend.swirepay.com',
      };
    }
    return {
      gateway: 'https://api.swirepay.com',
    };
  };

  const findCustomer = async (apiKey, email, name, phone, test) => {
    const gateway = getEndpoints(test).gateway;
    let url = `${gateway}/v1/customer`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    };

    let firstQuery = true;
    if (name || email || phone) {
      if (name) {
        url += `?name.EQ=${name}`;
        firstQuery = false;
      }
      if (email) {
        if (firstQuery) {
          url += `?email.EQ=${email}`;
          firstQuery = false;
        } else {
          url += `&email.EQ=${email}`;
        }
      }
      if (phone) {
        if (firstQuery) {
          url += `?phoneNumber.EQ=${phone}`;
          firstQuery = false;
        } else {
          url += `&phoneNumber.EQ=${phone}`;
        }
      }
    }
    const response = await fetch(url, config);
    return await response.json();
  };

  const createCustomer = async (apiKey, name, email, phone, test) => {
    const gateway = getEndpoints(test).gateway;
    let url = `${gateway}/v1/customer`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        name,
        email,
        phoneNumber: phone,
      }),
    };
    const response = await fetch(url, config);
    return await response.json();
  };

  const saveCard = async (apiKey, currencyCode, paymentMethodGid, test) => {
    const gateway = getEndpoints(test).gateway;
    let url = `${gateway}/v1/setup-session`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        currencyCode: currencyCode || null,
        statementDescriptor: null || 'Swirepay',
        paymentMethodType: ['CARD'],
        paymentMethodGid,
      }),
    };
    const response = await fetch(url, config);
    return await response.json();
  };

  const createCard = async (
    apiKey,
    name,
    cvv,
    number,
    expiryMonth,
    expiryYear,
    customerGid,
    save,
    test,
  ) => {
    const gateway = getEndpoints(test).gateway;
    let url = `${gateway}/v1/payment-method`;
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        card: {
          cvv,
          number,
          expiryMonth,
          expiryYear,
          name,
        },
        type: 'CARD',
        customerGid,
      }),
    };
    const response = await fetch(url, config);
    const result = await response.json();
    const gid = result && result.entity && result.entity.gid;
    const currencyCode =
      result &&
      result.entity &&
      result.entity.card &&
      result.entity.card.currency.name;
    if (save) {
      await saveCard(apiKey, currencyCode, gid, checked);
    }
    return await result;
  };

  const makePayment = async () => {
    if (!cardNumber) {
      setHasCardErrors(true);
    }
    if (!expiry) {
      setHasExpiryErrors(true);
    }
    if (!cvv) {
      setCvvHasError(true);
    }
    if (
      !hasCardErrors &&
      !hasExpiryErrors &&
      !hasCvvError &&
      cardNumber &&
      expiry &&
      cvv
    ) {
      try {
        setLoading(true);
        const month = expiry.split('/')[0];
        const year = expiry.split('/')[1];
        let customerGid;
        const test = props.paymentInfo.test;
        const name = props.paymentInfo.name;
        const email = props.paymentInfo.email;
        const phone = props.paymentInfo.phone;
        const apiKey = props.paymentInfo.publicKey;
        const gateway = getEndpoints(test).gateway;
        const amount = props.paymentInfo.amount;
        const data = await findCustomer(apiKey, name, email, phone, test);
        if (data.entity.content[0] && data.entity.content[0].gid) {
          customerGid = data.entity.content[0].gid;
        } else {
          const customerData = await createCustomer(
            apiKey,
            name,
            email,
            phone,
            test,
          );
          customerGid = customerData.entity && customerData.entity.gid;
        }
        let result = await createCard(
          apiKey,
          name,
          cvv,
          cardNumber.replace(/\s/g, ''),
          month,
          year,
          customerGid,
          checked,
          test,
        );
        const gid = result && result.entity && result.entity.gid;
        const receiptEmail =
          result.entity.card &&
          result.entity.card.customer &&
          result.entity.card.customer.email;
        const receiptSms =
          result.entity.card &&
          result.entity.card.customer &&
          result.entity.card.customer.phoneNumber;
        const currencyCode =
          result &&
          result.entity &&
          result.entity.card &&
          result.entity.card.currency.name;
        const postData = {
          amount,
          captureMethod: 'AUTOMATIC',
          confirmMethod: 'AUTOMATIC',
          currencyCode: 'INR',
          description: 'Online Payment',
          paymentMethodGid: gid,
          paymentMethodType: ['CARD'],
          receiptEmail: receiptEmail || null,
          receiptSms: receiptSms || null,
          statementDescriptor: 'IND Test Payment',
        };
        const url = `${gateway}/v1/payment-session`;
        const config = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify(postData),
        };
        const res = await fetch(url, config);
        props.navigation.navigate('Success', {data: await res.json()});
      } catch (error) {
        props.navigation.navigate('Failed', {error});
      } finally {
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setHasCardErrors(false);
        setHasExpiryErrors(false);
        setCvvHasError(false);
        setLoading(false);
      }
    }
  };

  const formatCardDate = input => {
    const text = input
      .replace(
        /[^0-9]/g,
        '', // To allow only numbers
      )
      .replace(
        /^([2-9])$/g,
        '0$1', // To handle 3 > 03
      )
      .replace(
        /^(1{1})([3-9]{1})$/g,
        '0$1/$2', // 13 > 01/3
      )
      .replace(
        /^0{1,}/g,
        '0', // To handle 00 > 0
      )
      .replace(
        /^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g,
        '$1/$2', // To handle 113 > 11/3
      );
    setExpiry(text);
    if (text.length === 5) {
      setHasExpiryErrors(false);
    }
  };
  const validateCvv = text => {
    var sample = text.replace(/[^\d]/g, '');
    var maxLength = sample.substring(0, 3);
    setCvv(maxLength);
    if (maxLength.length === 3) {
      setCvvHasError(false);
    }
  };

  const validateCard = text => {
    var sample = text.replace(/[^\d]/g, '');
    var maxLength = sample.substring(0, cardLength);
    var visaCard = ['4'];
    var masterCard = ['51', '52', '53', '54', '55'];
    var dinersCard = ['36', '38', '54', '55'];
    var cartCard = ['300', '301', '302', '303', '304', '305'];
    var amexCard = ['34', '37'];
    var discoverCard = ['60', '62', '64', '65'];
    var jcbCard = ['35'];
    var enRouteCard = ['2014', '2149'];
    var soloCard = ['6334', '6767'];
    var masteroCard = [
      '5018',
      '5020',
      '5038',
      '6304',
      '6759',
      '6761',
      '6762',
      '6763',
    ];
    var visaElectronCard = ['4026', '417500', '4508', '4844', '4913', '4917'];
    var laserCard = ['6304', '6706', '6771', '6709'];
    if (maxLength.length > 0) {
      let joy = maxLength.match(/.{1,4}/g);
      setCardNumber(joy.join(' '));
    } else {
      setCardNumber('');
      setCardType('');
      setHasCardErrors(false);
    }

    if (
      (maxLength.length === 13 || maxLength.length === 16) &&
      visaCard.includes(maxLength.substring(0, 1))
    ) {
      setCardType('VISA');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 16 &&
      masterCard.includes(maxLength.substring(0, 2))
    ) {
      setCardType('MASTER');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      (maxLength.length === 14 || maxLength.length === 16) &&
      dinersCard.includes(maxLength.substring(0, 2))
    ) {
      setCardType('DINERS CLUB');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 14 &&
      cartCard.includes(maxLength.substring(0, 3))
    ) {
      setCardType('CARTE BLANCHE');
      setCardLength(14);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 15 &&
      amexCard.includes(maxLength.substring(0, 2))
    ) {
      setCardType('AMEX');
      setCardLength(15);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 16 &&
      discoverCard.includes(maxLength.substring(0, 2))
    ) {
      setCardType('DISCOVER');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 16 &&
      jcbCard.includes(maxLength.substring(0, 2))
    ) {
      setCardType('JCB');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 15 &&
      enRouteCard.includes(maxLength.substring(0, 4))
    ) {
      setCardType('ENROUTE');
      setCardLength(15);
      setHasCardErrors(false);
    } else if (
      (maxLength.length === 16 ||
        maxLength.length === 18 ||
        maxLength.length === 19) &&
      soloCard.includes(maxLength.substring(0, 4))
    ) {
      setCardType('SOLO');
      setCardLength(19);
      setHasCardErrors(false);
    } else if (
      (maxLength.length === 12 ||
        maxLength.length === 13 ||
        maxLength.length === 14 ||
        maxLength.length === 15 ||
        maxLength.length === 16 ||
        maxLength.length === 18 ||
        maxLength.length === 19) &&
      masteroCard.includes(maxLength.substring(0, 4))
    ) {
      setCardType('MAESTRO');
      setCardLength(19);
      setHasCardErrors(false);
    } else if (
      maxLength.length === 16 &&
      visaElectronCard.includes(maxLength.substring(0, 4))
    ) {
      setCardType('VISA ELECTRON');
      setCardLength(16);
      setHasCardErrors(false);
    } else if (
      (maxLength.length === 16 ||
        maxLength.length === 18 ||
        maxLength.length === 19) &&
      laserCard.includes(maxLength.substring(0, 4))
    ) {
      setCardType('LASER CARD');
      setCardLength(19);
      setHasCardErrors(false);
    } else if (maxLength.length > 1) {
      setCardType('');
      setHasCardErrors(true);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator animating={true} color="#3E8BFF" />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Appbar.Header style={{backgroundColor: '#0A2D77'}}>
            <Appbar.Content title="Order" style={{fontSize: 16}} />
            <Appbar.Action />
            <Appbar.Action />
            <Appbar.Action />
            <Appbar.Content title={props.paymentInfo.amount.toFixed(2)} />
          </Appbar.Header>
          <List.Section
            title="Select Payment Metod"
            style={{fontSize: 13, color: '#999999'}}>
            <List.AccordionGroup>
              <List.Accordion
                title="UPI"
                id="1"
                left={props => <List.Icon {...props} icon={union} />}
                style={styles.listItem}>
                <List.Item title="UPI Payment" />
              </List.Accordion>
              <List.Accordion
                title="Card"
                id="2"
                left={props => <List.Icon {...props} icon={card} />}
                style={styles.listItem}>
                <Text
                  style={{
                    fontSize: 13,
                    marginLeft: -40,
                    marginBottom: 20,
                    backgroundColor: '#F5F5F5',
                    padding: 10,
                  }}>
                  Debit card, Credit card and Corporate credit card are
                  supported.
                </Text>
                <TextInput
                  mode="outlined"
                  label="Card Number"
                  placeholder="XXXX XXXX XXXX XXXX"
                  right={<TextInput.Affix text={cardType} />}
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    marginBottom: hasCardErrors ? 0 : 20,
                    backgroundColor: 'white',
                  }}
                  onChangeText={text => validateCard(text)}
                  value={cardNumber}
                  error={hasCardErrors}
                />
                {hasCardErrors && (
                  <Text
                    style={{
                      marginBottom: hasCardErrors ? 16 : 0,
                      marginLeft: -52,
                      color: '#FF4B51',
                    }}>
                    Invalid Card Number
                  </Text>
                )}
                <View style={{flexDirection: 'row', marginLeft: -63}}>
                  <View style={{flex: 1}}>
                    <TextInput
                      mode="outlined"
                      label="Expiry"
                      placeholder="MM/YYYY"
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: hasExpiryErrors ? 0 : 20,
                        backgroundColor: 'white',
                      }}
                      onChangeText={text => formatCardDate(text)}
                      value={expiry}
                      error={hasExpiryErrors}
                    />
                    {hasExpiryErrors && (
                      <Text
                        style={{
                          marginBottom: hasCardErrors ? 16 : 0,
                          color: '#FF4B51',
                          marginLeft: 12,
                        }}>
                        Invalid Expiry Date
                      </Text>
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <TextInput
                      mode="outlined"
                      label="CVV"
                      placeholder="***"
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: hasCvvError ? 0 : 20,
                        backgroundColor: 'white',
                      }}
                      onChangeText={text => validateCvv(text)}
                      value={cvv}
                      error={hasCvvError}
                    />
                    {hasCvvError && (
                      <Text
                        style={{
                          marginBottom: hasCvvError ? 16 : 0,
                          color: '#FF4B51',
                          marginLeft: 12,
                        }}>
                        Invalid CVV
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={{marginLeft: -63, marginBottom: 20}}
                  onPress={() => {
                    setChecked(!checked);
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Checkbox.Android
                      status={checked ? 'checked' : 'unchecked'}
                    />
                    <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                      Save this Card
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={{fontSize: 11, marginLeft: -50, marginBottom: 20}}>
                  We dont store CVV. You can remove all the saved card later.
                </Text>
                <Image
                  source={cardList}
                  style={{marginLeft: 65, marginBottom: 20}}
                />
                <Button
                  mode="contained"
                  onPress={() => makePayment()}
                  style={styles.payButton}>
                  PAY {props.paymentInfo.amount.toFixed(2)}
                </Button>
              </List.Accordion>
              <List.Accordion
                title="Net Banking"
                id="3"
                left={props => <List.Icon {...props} icon={netBanking} />}
                style={styles.listItem}>
                <List.Item title="Net Banking" />
              </List.Accordion>
            </List.AccordionGroup>
          </List.Section>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              marginTop: 80,
            }}>
            <Image source={swirepay} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Payment;
