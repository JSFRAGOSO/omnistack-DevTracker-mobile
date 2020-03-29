import React from 'react';
import Routes from './src/routes';
import { KeyboardAvoidingView,YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket'
])
export default function App() {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"} >
      <Routes/>
    </KeyboardAvoidingView>
    
  );
}
