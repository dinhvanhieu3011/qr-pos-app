import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { dragonBallStyles } from '../theme';

import { useAuth } from '../contexts/AuthContext';
import { Checkbox } from 'react-native-paper';

// Hardcoded password as per requirements (kept for reference, but AuthContext handles it)
const PASSWORD = 'hieu1970';

const LoginScreen = () => {
  const { login, savedPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  
  const theme = useTheme();

  React.useEffect(() => {
    if (savedPassword) {
      setPassword(savedPassword);
      setSavePassword(true);
    }
  }, [savedPassword]);

  const handleLogin = async () => {
    const success = await login(password, savePassword, keepLoggedIn);
    if (!success) {
      Alert.alert('Lỗi', 'Mật khẩu không đúng. Vui lòng thử lại.');
    }
    // If success, the AuthProvider will update state and AppNavigator will switch screens automatically
  };

  return (
    <SafeAreaProvider>
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

          <View style={styles.checkboxContainer}>
            <View style={styles.checkboxItem}>
              <Checkbox.Android
                status={savePassword ? 'checked' : 'unchecked'}
                onPress={() => setSavePassword(!savePassword)}
                color={theme.colors.primary}
                uncheckedColor={theme.colors.primary}
              />
              <Text onPress={() => setSavePassword(!savePassword)}>Lưu mật khẩu</Text>
            </View>
            <View style={styles.checkboxItem}>
              <Checkbox.Android
                status={keepLoggedIn ? 'checked' : 'unchecked'}
                onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                color={theme.colors.primary}
                uncheckedColor={theme.colors.primary}
              />
              <Text onPress={() => setKeepLoggedIn(!keepLoggedIn)}>Duy trì đăng nhập</Text>
            </View>
          </View>
          
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
    </SafeAreaProvider>
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
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  }
});

export default LoginScreen;
