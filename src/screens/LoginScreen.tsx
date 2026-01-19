import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dragonBallStyles } from '../theme';

// Hardcoded password as per requirements
const PASSWORD = 'hieu1970';

const LoginScreen = ({ navigation }: any) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const handleLogin = () => {
    if (password === PASSWORD) {
      // Navigate to Main and reset stack to prevent going back to login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      Alert.alert('Lỗi', 'Mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-lock" size={80} color={theme.colors.primary} />
        </View>
        
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          Đăng nhập
        </Text>
        
        <Surface style={[styles.card, dragonBallStyles.card]} elevation={4}>
          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            onSubmitEditing={handleLogin}
          />
          
          <Button 
            mode="contained" 
            onPress={handleLogin}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Vào Bán Hàng
          </Button>
        </Surface>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: 'bold',
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  }
});

export default LoginScreen;
