// src/screens/signup/index.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import { Button } from '../../components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme'; // ← ADD THIS

type SignupResponse = { message: string };

export default function SignupScreen() {
  const router = useRouter();
   const { primary, isDark } = useTheme(); 
    const bgColor = isDark ? "#000" : "#fff";

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateInputs = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      alert('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (mobile.length < 10 || !/^\d+$/.test(mobile)) {
      alert('Mobile number must be 10 digits');
      return false;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) return;

    try {
      const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
      const res = await axios.post<SignupResponse>(`${BASE_URL}/api/auth/signup`, {
        firstName,
        lastName,
        email,
        mobile,
        password,
      });

      if (res.data.message) {
        await AsyncStorage.setItem("userStatus", "verification");
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("isNewUser", "true");
        router.replace('/verification');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: primary }]}>Sign Up</Text>

      <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input placeholder="Mobile" value={mobile} onChangeText={setMobile} keyboardType="number-pad" maxLength={10} />

      {/* Password with eye toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor={primary} // ← DYNAMIC
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.passwordInput, { color: primary }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color={primary} // ← DYNAMIC
          />
        </TouchableOpacity>
      </View>

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.loginText}>
        Already registered?{' '}
        <Text
          style={[styles.loginLink, { color: primary }]}
          onPress={() => router.push('/login')}
        >
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000', // ← Hardcoded
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#ccc', // ← Hardcoded
  },
  loginLink: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
});