import React, { useState, useEffect, useRef, ReactNode } from "react";
import { View, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import Map, { PROVIDER_DEFAULT, Marker, Callout } from "react-native-maps";
import { AntDesign, Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useQuery, useMutation, gql, useLazyQuery } from "@apollo/client";
import Ripple from "react-native-material-ripple";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

interface Point {
  latitude: number;
  longitude: number;
}

const findClosestPoint = (points: Point[], currentLocation: Point) => {
  if (!points || points.length === 0) return null;

  // If there's only one point, return it
  if (points.length === 1) return points[0];

  // Calculate distance for each point and find the minimum
  let closestPoint = points[0];
  let minDistance = calculateDistance(currentLocation.latitude, currentLocation.longitude, points[0].latitude, points[0].longitude);

  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, points[i].latitude, points[i].longitude);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = points[i];
    }
  }

  return closestPoint;
};

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
  <Text
    style={{
      color: props.color ?? Colors.secondary,
      fontSize: props.size,
      fontWeight: "bold",
      lineHeight: props.size + 7.5,
    }}
  >
    {props.children}
  </Text>
);

export const getCurrentLocation = async () => {
  try {
    const serviceEnabled = await Location.hasServicesEnabledAsync();
    if (!serviceEnabled) {
      console.log("Location services are not enabled");
      return {
        latitude: 53.7701,
        longitude: 20.4862,
        error: null,
      };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission not granted, using default location");
      return {
        latitude: 53.7701,
        longitude: 20.4862,
        error: null,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      error: null,
    };
  } catch (error) {
    console.log("Location error, using default location");
    return {
      latitude: 53.7701,
      longitude: 20.4862,
      error: null,
    };
  }
};

const MapPicker = (props: Pick<ExpenseType, "location"> & { id: string }) => {
  const [location, setLocation] = useState({
    latitude: 53.7701,
    longitude: 20.4862,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const map = useRef<Map>(null);

  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  useEffect(() => {
    getCurrentLocation().then((coords) => {
      if (coords.latitude && coords.longitude) {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.05,
        });

        map.current?.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
          },
          1000
        );
      }
    });
  }, []);

  const [assignedMarker, setAssignedMarker] = useState(props.location || null);
  const [editMode, setEditMode] = useState(false);

  const [queryLocation, { data: points }] = useLazyQuery(gql`
    query ($query: String) {
      locations(query: $query) {
        id
        name
        kind
        latitude
        longitude
      }
    }
  `);

  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    if (locationQuery) {
      const timeout = setTimeout(() => {
        (async () => {
          const { data } = await queryLocation({
            variables: {
              query: locationQuery,
              latitude: location.latitude,
              longitude: location.longitude,
            },
          });

          const points = data.locations;

          // Find the closest point to current location
          if (points && points.length > 0) {
            const closestPoint = findClosestPoint(points, location);

            // Animate map to the closest point
            map.current?.animateToRegion(
              {
                latitude: closestPoint!.latitude,
                longitude: closestPoint!.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        })();
      }, 750);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [locationQuery]);

  const [createMarker] = useMutation(gql`
    mutation ($input: CreateLocationDto!) {
      createLocation(input: $input) {
        id
        name
        kind
        latitude
        longitude
      }
    }
  `);

  const [assignLocation] = useMutation(gql`
    mutation ($expenseId: ID!, $locationId: ID!) {
      addExpenseLocation(expenseId: $expenseId, locationId: $locationId)
    }
  `);

  const handleAssignLocation = async (locationId: string) => {
    try {
      await assignLocation({
        variables: {
          expenseId: props.id,
          locationId: locationId,
        },
      });
      const newAssignedLocation = points.locations.find((loc: any) => loc.id === locationId);
      setAssignedMarker(newAssignedLocation);
      Alert.alert("Success", "Location assigned successfully!");
    } catch (error) {
      console.error("Error assigning location:", error);
      Alert.alert("Error", "Failed to assign location");
    }
  };

  return (
    <View style={{ padding: 15, marginBottom: 40 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Txt size={20} color={"#fff"}>
          Location {assignedMarker?.name}
        </Txt>

        <View style={{ flexDirection: "row", gap: 25 }}>
          <Ripple
            onPress={() => {
              Alert.prompt("Location Search", "Enter location name:", (name) => {
                if (name) {
                  setLocationQuery(name);
                }
              });
            }}
          >
            <AntDesign name="search1" size={20} color="#fff" />
          </Ripple>
          <Ripple onPress={() => setEditMode((p) => !p)}>
            <Feather name="edit-2" size={20} color={editMode ? Colors.secondary : "#fff"} />
          </Ripple>
        </View>
      </View>
      <Map
        ref={map}
        style={{ width: Layout.screen.width - 30, height: 200, borderRadius: 10, marginTop: 25 }}
        provider={PROVIDER_DEFAULT}
        showsPointsOfInterest
        region={location}
        toolbarEnabled
        onPress={async (e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          if (editMode) {
            Alert.prompt("Location name", "Enter location name:", async (name) => {
              if (name) {
                const { data } = await createMarker({
                  variables: {
                    input: { kind: "custom", name, latitude, longitude },
                  },
                });

                const newLocation = {
                  id: data.createLocation.id,
                  name: data.createLocation.name,
                  kind: data.createLocation.kind,
                  latitude: data.createLocation.latitude,
                  longitude: data.createLocation.longitude,
                };

                setAssignedMarker(newLocation);

                await assignLocation({
                  variables: {
                    expenseId: props.id,
                    locationId: data.createLocation.id,
                  },
                });

                setEditMode(false);
              }
            });
          }
        }}
      >
        {/* Display all locations from points with blue markers */}
        {points?.locations?.map((item: any) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            title={item.name}
            description={item.kind}
            pinColor="blue" // Blue markers for all fetched locations
            onPress={() => {
              setSelectedMarker(item); // Set as selected marker (red)
            }}
          >
            <Callout tooltip onPress={() => handleAssignLocation(item.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{item.name}</Text>
                <Text style={styles.calloutDescription}>{item.kind}</Text>
                <View style={styles.calloutButton}>
                  <Text style={styles.calloutButtonText}>Assign Location</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Display selected marker in red */}
        {selectedMarker && (
          <Marker
            coordinate={{
              latitude: selectedMarker.latitude,
              longitude: selectedMarker.longitude,
            }}
            pinColor="red" // Red pin for selected marker
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{selectedMarker.name}</Text>
                <Text style={styles.calloutDescription}>Selected Location</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Always display assigned marker (from props) in green */}
        {assignedMarker && (
          <Marker
            coordinate={{
              latitude: assignedMarker.latitude,
              longitude: assignedMarker.longitude,
            }}
            pinColor="green" // Green pin for the assigned marker
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{assignedMarker.name}</Text>
                <Text style={styles.calloutDescription}>Assigned Location</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </Map>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    marginTop: 10,
    color: "#fff",
    backgroundColor: Colors.secondary_dark_1,
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    backgroundColor: Colors.primary_light,
    marginTop: 10,
  },
  calloutContainer: {
    width: 160,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 3,
  },
  calloutDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 5,
  },
  calloutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 10,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
});

export default MapPicker;
