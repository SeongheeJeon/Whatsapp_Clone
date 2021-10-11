import moment from "moment";
import React from "react";
import { Image, Text, View, TouchableWithoutFeedback } from "react-native";
import { User } from "../../types";
import styles from "./styles";
import { useNavigation } from "@react-navigation/native";

import { API, Auth, graphqlOperation } from "aws-amplify";
import {
  createChatRoom,
  createChatRoomUser,
} from "../../src/graphql/mutations";

export type ContactListItemProps = {
  user: User;
};

const ContactListItem = (props: ContactListItemProps) => {
  const { user } = props;

  const navigation = useNavigation();

  const onClick = async () => {
    try {
      // 1. Create a new Chat Room
      const newChatRoomData = await API.graphql(
        graphqlOperation(createChatRoom, {
          input: {
            lastMessageID: "9ss3a761-1f63-48c0-b396-4d2225131670",
          },
        })
      );

      if (!newChatRoomData.data) {
        console.log("Failed to create a chat room");
        return;
      }

      const newChatRoom = newChatRoomData.data.createChatRoom;

      // 2. Add 'user' to the Chat Room
      await API.graphql(
        graphqlOperation(createChatRoomUser, {
          input: {
            userID: user.id,
            chatRoomID: newChatRoom.id,
          },
        })
      );

      // 3. Add authenticated user to thet Chat Room
      const userInfo = await Auth.currentAuthenticatedUser();

      await API.graphql(
        graphqlOperation(createChatRoomUser, {
          input: {
            userID: userInfo.attributes.sub,
            chatRoomID: newChatRoom.id,
          },
        })
      );

      navigation.navigate("ChatRoom", {
        id: newChatRoom.id,
        name: "Hardcoded name",
        imageUri: user.imageUri,
      });
    } catch (e) {
      console.log(e);
    }
    // navigate to chat room with this user
  };

  return (
    <TouchableWithoutFeedback onPress={onClick}>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Image source={{ uri: user.imageUri }} style={styles.avatar} />

          <View style={styles.midContainer}>
            <Text style={styles.username}>{user.name}</Text>
            <Text numberOfLines={1} style={styles.status}>
              {user.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ContactListItem;
