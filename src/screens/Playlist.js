import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/FontAwesome";

import SearchBar from "../components/SearchBar";
import PlaylistItem from "../components/PlaylistItem";

import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYLIST = "PLAYLIST";

const Playlist = () => {
  const [inputPlaylist, setInputPlaylist] = useState(""); // tên playlist mới
  const [playlistList, setPlaylistList] = useState([]); // danh sách playlist đã tạo

  // lưu playlist mới vào Async Storage
  const savePlaylist = async () => {
    try {
      await AsyncStorage.setItem(
        PLAYLIST,
        JSON.stringify([...playlistList, inputPlaylist])
      );
    } catch (e) {
      alert("Failed to save the PLAYLIST to the storage");
    }
  };
  // đọc danh sách playlist từ Async Storage
  const readPlaylist = async () => {
    try {
      const value = await AsyncStorage.getItem(PLAYLIST);
      if (value !== null) {
        setPlaylistList(JSON.parse(value));
      }
    } catch (e) {
      alert("Failed to fetch the PLAYLIST from storage");
    }
  };

  useEffect(() => {
    readPlaylist();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar></StatusBar>
      {/* thanh tìm kiếm */}
      <SearchBar />
      <View style={styles.title}>
        <Text style={{ fontSize: 30, fontWeight: "500" }}>Danh sách phát</Text>
      </View>

      <View style={styles.newPlaylist}>
        <TextInput
          placeholder="Thêm danh sách phát mới"
          style={styles.playlistInput}
          value = {inputPlaylist}
          onChangeText={(value) => {
            setInputPlaylist(value);
          }}
        />
        <TouchableOpacity
          style={styles.addPlaylistButton}
          onPress={() => {
            if (inputPlaylist != "") {
              if (playlistList.includes(inputPlaylist))
                alert("Playlist đã tồn tại, vui lòng tạo playlist mới!");
              else {
                setPlaylistList([...playlistList, inputPlaylist]);
                setInputPlaylist("");
                savePlaylist();
              }
            } else {
              alert("Nhập tên playlist mới!");
            }
          }}
        >
          <Icon name="plus" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={playlistList}
        renderItem={({ item }) => <PlaylistItem name={item} />}
        keyExtractor={(item) => item}
      />
    </SafeAreaView>
  );
};

export default Playlist;

const styles = StyleSheet.create({
  title: {
    width: "100%",
    height: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  newPlaylist: {
    width: "100%",
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  playlistInput: { fontSize: 18, flex: 1, marginRight: 30, height: "80%" },
  addPlaylistButton: {
    width: 40,
    height: 40,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
