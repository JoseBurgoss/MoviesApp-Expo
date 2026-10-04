import { TMDB_API_KEY } from '../config/tmdb';
import { StyleSheet, Text, View, Image, ScrollView, Pressable, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import FavoritesContext from '../context/FavoritesContext';
import AuthContext from '../context/AuthContext';
import Stars from '../shared/Stars';

export default function SeriesDetailScreen({ route }) {
  const { title, overview, releaseDate, backdropPath, seriesId, voteAverage, genreIds, director } = route.params;
  const [heartPressed, setHeartPressed] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewList, setReviewList] = useState([]);
  const [actors, setActors] = useState([]);
  const { user } = useContext(AuthContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    checkIfFavorite();
    getReviewList();
    fetchActors();
  }, []);

  const checkIfFavorite = () => {
    const isFavorite = favorites.some((fav) => fav.seriesId === seriesId);
    setHeartPressed(isFavorite);
  };

  const handleContainerPress = () => {
    Keyboard.dismiss();
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!heartPressed) {
      setHeartPressed(true);
      await addFavorite({
        seriesId,
        title,
        imgPath: `https://image.tmdb.org/t/p/w500/${backdropPath}`,
        overview,
        userId: user.uid,
      });
    } else {
      setHeartPressed(false);
      await removeFavorite(seriesId);
    }
  };

  const fetchActors = async () => {
    try {
      const API_KEY = TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/tv/${seriesId}/credits?api_key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setActors(data.cast);
    } catch (error) {
      console.error('Error fetching actors:', error);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review || rating === 0) {
      alert('Please write a review and select a rating.');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        seriesId: seriesId,
        userId: user.uid,
        comment: review,
        rating: rating,
        timestamp: new Date(),
      });
      alert('Review submitted successfully!');
      setReview('');
      setRating(0);
      getReviewList(); // Refresh the review list
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    }
  };

  const getReviewList = async () => {
    try {
      const q = query(collection(db, "reviews"), where("seriesId", "==", seriesId));
      const data = await getDocs(q);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setReviewList(filteredData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleStarPress = (value) => {
    setRating(value);
  };

  return (
    <ScrollView>
      <View style={styles.container} onPress={handleContainerPress}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500/${backdropPath}` }}
          style={styles.poster}
        />
        <Text style={styles.Headertext}>{title}</Text>
        <Text style={styles.text}>{overview}</Text>
        <Pressable style={styles.heart} onPress={handleFavorite}>
          {heartPressed ? (
            <Fontisto name="heart" size={24} color="red" />
          ) : (
            <FontAwesome6 name="heart" size={24} color="red" />
          )}
        </Pressable>

        <Text style={styles.sectionTitle}>Actors</Text>
        <View style={styles.actorsContainer}>
          <ScrollView horizontal>
            {actors.length > 0 ? (
              actors.map((actor, index) => (
                <View key={index} style={styles.actorItem}>
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w500/${actor.profile_path}` }}
                    style={styles.actorImage}
                  />
                  <Text style={styles.actorName}>{actor.name}</Text>
                  <Text style={styles.actorCharacter}>as {actor.character}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.text}>No actors found.</Text>
            )}
          </ScrollView>
        </View>

        <Text style={styles.reviewHeader}>Add Review</Text>
        <TextInput
          placeholder="Add Your Review"
          multiline
          numberOfLines={10}
          value={review}
          onChangeText={setReview}
          style={styles.input}
        />
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => handleStarPress(value)}>
              <Fontisto
                name={value <= rating ? "star" : "star-outline"}
                size={24}
                color={value <= rating ? "#FFD700" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Pressable title="Submit Review" onPress={handleReview} style={styles.button}>
          <Text style={styles.inputText}>Submit Review</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, flexDirection: 'column', marginTop: 50, marginBottom: 40 }}>
        <Text style={styles.reviewText}>{`Series Reviews for: ${title}`}</Text>
        {reviewList &&
          reviewList.map((review, index) => (
            <View style={styles.review} key={index}>
              <Text style={styles.reviewContent}>{user.displayName}:</Text>
              <Text>{review.comment}</Text>
              <Stars title="Rating" rating={review.rating} />
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  poster: {
    resizeMode: 'cover',
    width: '100%',
    height: 200,
  },
  Headertext: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  text: { width: '100%', marginTop: 10, textAlign: 'center' },
  heart: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  actorsContainer: {
    width: '100%',
    height: 200,
  },
  actorItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 20,
  },
  actorImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  actorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actorCharacter: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  reviewHeader: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    marginBottom: 20,
    width: '70%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    top: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 50,
    minWidth: '70%',
    textAlign: 'center',
    justifyContent: 'center',
    height: 50,
    color: '#fff',
  },
  inputText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  review: {
    marginTop: 20,
    flexDirection: 'column',
    marginLeft: 10,
  },
  reviewText: { marginTop: 0, fontWeight: 'bold', paddingLeft: 20, bottom: 50 },
  reviewContent: {
    fontWeight: 'bold',
    marginRight: 10,
    paddingHorizontal: 15,
  },
});