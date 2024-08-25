import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import axios from 'axios';

const AfroQuotesGenerator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [showModal, setShowModal] = useState(true);


  const fetchRandomQuote = async () => {
    try {
      const response = await axios.get('https://zenquotes.io/api/quotes?search=');
      const quotes = response.data;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote.q);
      setAuthor(randomQuote.a);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setQuote('Failed to fetch a quote. Please try again later.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios.get('http://localhost:3001/api/auth/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          setIsLoggedIn(response.data.isAuthenticated);
        })
        .catch(error => console.error('Error checking authentication status:', error));
    }
  }, []);

  // Signup and Login functions (
  const handleSignup = async (username, email, password) => {
    try {
      // this is a call to backend for user signup
      const response = await axios.post('http://localhost:3001/api/signup', { username, email, password });
      const data = response.data;
      console.log('Signup successful:', data);
      setIsLoggedIn(true);
      setUser(data.user);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      // this is a call to the backend for userLogin
      const response = await axios.post('http://localhost:3001/api/login', { usernameOrEmail, password });
      const data = response.data;
      setIsLoggedIn(true);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSaveFavorite = async (quoteId) => {
    if (!isLoggedIn) {
      console.error('User needs to be logged in to save favorites');
      return;
    }

    // this is a call to the backend to save the favorite quote
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:3001/api/favorites', { quoteId }, { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data;
      setFavoriteQuotes([...favoriteQuotes, quoteId]);
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return (
    <View style={styles.container}>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Username/Email" placeholderTextColor="gray" />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="gray" />
            <Button title="Login" onPress={handleLogin} />
            <Button title="Signup" onPress={handleSignup} />
          </View>
        </View>
      </Modal>

      {isLoggedIn ? (
        <>
          <Text>Welcome, {user.username}</Text>
          <TouchableOpacity onPress={() => handleSaveFavorite(quote)}>
            <Text>Save as Favorite</Text>
          </TouchableOpacity>
          {/* Display list of favorite quotes (implement logic) */}
        </>
      ) : (
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text>Login/Signup</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.authorText}>- {author}</Text>
      <TouchableOpacity style={styles.button} onPress={fetchRandomQuote}>
        <Text style={styles.buttonText}>Get New Quote</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  form: {
    backgroundColor: 'gold',
    padding: 100,
    borderRadius: 65,
  },
  input: {
    height: 60,
    borderColor: 'black',
    borderWidth: 5,
    marginBottom: 10,
    padding: 10,
    color: 'black',
  },
  quoteText: {
    fontSize: 24,
    color: 'gold',
    textAlign: 'center',
  },
  authorText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'gold',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default AfroQuotesGenerator;