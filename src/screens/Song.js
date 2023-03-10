import {
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";

import SearchBar from "../components/SearchBar";
import SongItem from "../components/SongItem";
import Title from "../components/Title";
import { songData } from "../../data/songData";

import SortModal from "../components/SortModal";
import PlayerMini from "../components/PlayerMini";
import Player from "./Player";
import { DataContext } from "../context/DataContext";
import { AudioContext } from "../context/AudioContext";

import * as MediaLibrary from "expo-media-library";

// chuyen ve tieng Viet khong dau
function ConverVItoEN(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

const Song = () => {
  // context data
  const context = useContext(DataContext);
  // const audio
  const contextAudio = useContext(AudioContext);

  const [showSort, setShowSort] = useState(false);
  // Function truyen tu component con ve
  const Sort = (flag) => {
    setShowSort(flag);
  };

  const [sortOption, setSortOption] = useState("NgayThem");
  // Function truyen tu component con ve
  const Option = (value) => {
    setSortOption(value);
  };

  const [localData, setLocalData] = useState([]);

  const getAllAudioFilesFromDevice = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission not granted for media library");
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
      });

      let mp3Files;
      // Check if media.assets is an array
      if (Array.isArray(media.assets)) {
        mp3Files = media.assets.filter((asset) =>
          asset.filename.endsWith(".mp3")
        );
        //throw new Error("No audio files found");
      }
      else
        mp3Files = [];

      const uris = mp3Files.map((asset, index) => ({
        id: songData.length + index,
        name: asset.filename.substring(0, asset.filename.length - 4),
        singer: "Unknown",
        uri: asset.uri,
      }));

      context.updateNewData(songData.concat(uris));
      setLocalData(songData.concat(uris));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllAudioFilesFromDevice();
  }, []);

  const resultBaiHat = [...context.data].sort((a, b) =>
    ConverVItoEN(a.name).localeCompare(ConverVItoEN(b.name))
  );
  const resultNgheSi = [...context.data].sort((a, b) =>
    ConverVItoEN(a.singer).localeCompare(ConverVItoEN(b.singer))
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar></StatusBar>
      {/* thanh tìm kiếm */}
      <SearchBar showSort={true} Sort={Sort} />

      {/* Title */}
      <Title title={"Danh sách bài hát"} />

      {/* Danh sách bài hát */}
      <FlatList
        data={
          sortOption === "NgayThem"
            ? localData
            : sortOption === "NgheSi"
              ? resultNgheSi
              : resultBaiHat
        }
        renderItem={({ item }) => (
          <SongItem
            info={item}
            songdata={
              sortOption === "NgayThem"
                ? localData
                : sortOption === "NgheSi"
                  ? resultNgheSi
                  : resultBaiHat
            }
          />
        )}
        keyExtractor={(item, index) => index}
      />

      <SortModal
        showSort={showSort}
        Sort={Sort}
        sortOption={sortOption}
        Option={Option}
      />

      {contextAudio.audioState.currentIndex !== null && (
        <PlayerMini></PlayerMini>
      )}
    </SafeAreaView>
  );
};

export default Song;

const styles = StyleSheet.create({});
